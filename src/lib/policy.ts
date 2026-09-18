// ============================================================================
// GLYPH PHASE 01 — RISK POLICY ENGINE (GLYPH_POLICY)
// Deterministic policy layer independent of the LLM.
// Derived from: BRIEF.md (§10, §3.0C, §3.8, §3.10)
//
// Core Principle:
// "LLM proposes. Policy validates. Execution layer acts."
// The LLM cannot modify the policy. allowedAssets is hardcoded in code.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { clampLeverage } from "./simulation-math";

/**
 * Hardcoded Whitelist of Allowed Assets (BRIEF §3.8, §10).
 * MUST NOT be stored solely in a database table that could be dynamically manipulated.
 */
export const ALLOWED_ASSETS = ["NVDA"] as const;
export type AllowedAsset = (typeof ALLOWED_ASSETS)[number];

/**
 * Immutable Risk Policy Parameters (BRIEF §10, §3.10).
 */
export const GLYPH_POLICY = {
  maxPositionPercent: 10, // Max 10% of total portfolio equity per position
  maxLeverage: 2, // Max 2x simulated leverage (hard ceiling)
  maxDailyLossPercent: 5, // Daily circuit breaker: halt new trades if 24h loss >= 5%
  maxOpenPositions: 3, // Maximum 3 concurrent open positions
  allowedAssets: ALLOWED_ASSETS, // Hardcoded whitelist
  minConfidence: 60, // Minimum required conviction score (0-100)
  simulatedFeePercent: 0.1, // Simulated transaction fee (0.1% per trade)
} as const;

export interface TradeProposal {
  asset: string;
  action: "LONG" | "SHORT" | "NO_TRADE";
  conviction: number; // 0-100
  positionSizePercent?: number; // Proposed % of equity
  leverage?: number; // Proposed leverage multiplier
}

export interface PolicyValidationResult {
  approved: boolean;
  policyResult: "APPROVED" | "REJECTED";
  rejectReason: string | null;
  clampedLeverage: number;
  clampedPositionPercent: number;
}

/**
 * Validates a proposed trade against GLYPH_POLICY rules deterministically.
 * Pure validation logic without external database dependencies.
 */
export function validateTradeProposal(
  proposal: TradeProposal,
  currentOpenPositionsCount: number = 0,
  dailyLossPercent: number = 0
): PolicyValidationResult {
  // 1. Check for NO_TRADE action
  if (proposal.action === "NO_TRADE") {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: "Action is NO_TRADE. Proposal does not warrant execution.",
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // 2. Check Whitelisted Asset (§3.8)
  const isAllowed = (ALLOWED_ASSETS as readonly string[]).includes(
    proposal.asset.toUpperCase()
  );
  if (!isAllowed) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: `Asset '${proposal.asset}' is not in the hardcoded allowedAssets whitelist [${ALLOWED_ASSETS.join(
        ", "
      )}].`,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // 3. Check Minimum Confidence / Conviction (§10)
  if (proposal.conviction < GLYPH_POLICY.minConfidence) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: `Conviction score (${proposal.conviction}%) is below minimum required threshold (${GLYPH_POLICY.minConfidence}%).`,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // 4. Check Maximum Concurrent Open Positions (§10)
  if (currentOpenPositionsCount >= GLYPH_POLICY.maxOpenPositions) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: `Max open positions limit reached (${currentOpenPositionsCount}/${GLYPH_POLICY.maxOpenPositions}). Cannot open new position.`,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // 5. Check Daily Loss Circuit Breaker (§10)
  if (dailyLossPercent >= GLYPH_POLICY.maxDailyLossPercent) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: `Daily loss limit breached (-${dailyLossPercent.toFixed(
        2
      )}% >= ${GLYPH_POLICY.maxDailyLossPercent}%). Circuit breaker engaged for 24 hours.`,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // 6. Clamp Leverage (§3.0C) and Position Size
  const clampedLeverage = clampLeverage(
    proposal.leverage ?? 1,
    GLYPH_POLICY.maxLeverage
  );
  const clampedPositionPercent = Math.min(
    GLYPH_POLICY.maxPositionPercent,
    Math.max(1, proposal.positionSizePercent ?? 5)
  );

  return {
    approved: true,
    policyResult: "APPROVED",
    rejectReason: null,
    clampedLeverage,
    clampedPositionPercent,
  };
}

/**
 * Evaluates an agent trade proposal by pulling live state (open positions count, 24h loss)
 * directly from the database and running deterministic validation.
 */
export async function evaluateAgentTradeProposal(
  agentIdentifier: string = "1",
  proposal: TradeProposal
): Promise<PolicyValidationResult> {
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: {
      treasury: true,
      positions: {
        where: { isOpen: true },
      },
    },
  });

  if (!agent) {
    throw new Error(`Agent with agentId ${agentIdentifier} not found.`);
  }

  const currentOpenPositionsCount = agent.positions.length;

  // Calculate realized losses in the past 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentClosedTrades = await prisma.trade.findMany({
    where: {
      agentId: agent.id,
      status: { in: ["CLOSED", "LIQUIDATED"] },
      closedAt: { gte: oneDayAgo },
    },
  });

  let totalLossDollar = 0;
  for (const trade of recentClosedTrades) {
    const pnl = Number(trade.simulatedPnl ?? 0);
    if (pnl < 0) {
      totalLossDollar += Math.abs(pnl);
    }
  }

  const initialCapital = agent.treasury
    ? Number(agent.treasury.initialCapital)
    : 1000;
  const dailyLossPercent =
    initialCapital > 0 ? (totalLossDollar / initialCapital) * 100 : 0;

  return validateTradeProposal(
    proposal,
    currentOpenPositionsCount,
    dailyLossPercent
  );
}
