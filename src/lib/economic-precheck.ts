// ============================================================================
// GLYPH PHASE 01 — ECONOMIC PRECHECK & POSITION REQUIREMENTS
// Single source of truth for economic preconditions and position sizing.
// Shared across Risk Policy Engine, Portfolio Execution, and Cycle Orchestrator.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { clampLeverage, calculatePositionMarginAndNotional, calculateTransactionFee } from "./simulation-math";
import { GLYPH_POLICY, TradeProposal, ActivePositionState } from "./policy";
import { getTreasurySummary } from "./treasury";

export interface PositionRequirementsInput {
  totalEquity: number;
  availableCapital: number;
  proposedPositionPercent?: number;
  proposedLeverage?: number;
  maxPositionPercent?: number;
  maxLeverage?: number;
  feePercent?: number;
}

export interface PositionRequirements {
  positionValue: number; // Notional market exposure
  requiredMargin: number; // Allocated margin dollar value
  positionSize: number; // Same as requiredMargin
  leverage: number;
  openingFee: number;
  totalRequiredCapital: number; // margin + openingFee
  availableCapital: number;
  capitalSufficient: boolean;
  clampedPositionPercent: number;
}

/**
 * Single source of truth for position sizing calculations.
 * Used identically by both the Risk Policy Engine and openSimulatedPosition().
 */
export function calculatePositionRequirements(
  input: PositionRequirementsInput
): PositionRequirements {
  const maxLeverage = input.maxLeverage ?? GLYPH_POLICY.maxLeverage;
  const maxPositionPercent = input.maxPositionPercent ?? GLYPH_POLICY.maxPositionPercent;
  const feePercent = input.feePercent ?? GLYPH_POLICY.simulatedFeePercent;

  // 1. Clamp leverage (ceiling 2x) & position percent (1% to 10%)
  const leverage = clampLeverage(input.proposedLeverage ?? 1.0, maxLeverage);
  const clampedPositionPercent = Math.min(
    maxPositionPercent,
    Math.max(1.0, input.proposedPositionPercent ?? 5.0)
  );

  // 2. Calculate margin & notional size based on total equity
  const { margin, notionalSize } = calculatePositionMarginAndNotional(
    input.totalEquity,
    clampedPositionPercent,
    leverage
  );

  // 3. Calculate simulated fee and total required cash
  const openingFee = calculateTransactionFee(notionalSize, feePercent);
  const totalRequiredCapital = margin + openingFee;

  // 4. Capital sufficiency condition
  const capitalSufficient =
    input.availableCapital > 0 &&
    margin > 0 &&
    totalRequiredCapital <= input.availableCapital;

  return {
    positionValue: notionalSize,
    requiredMargin: margin,
    positionSize: margin,
    leverage,
    openingFee,
    totalRequiredCapital,
    availableCapital: input.availableCapital,
    capitalSufficient,
    clampedPositionPercent,
  };
}

export interface EconomicPreconditionsResult {
  agentId: string;
  availableCapital: number;
  totalEquity: number;
  activePositionsCount: number;
  maxOpenPositions: number;
  dailyLossPercent: number;
  maxDailyLossPercent: number;
  positionRequirements: PositionRequirements | null;
  capitalSufficient: boolean;
  circuitBreakerTriggered: boolean;
  maxPositionsReached: boolean;
  currentPosition: ActivePositionState | null;
  reason?: string;
}

/**
 * Evaluates economic preconditions by pulling live state from the database.
 * Serves as the precheck before trade execution.
 */
export async function evaluateEconomicPreconditions(
  agentIdentifier: string = "1",
  proposal?: TradeProposal
): Promise<EconomicPreconditionsResult> {
  const agent = await prisma.agent.findFirst({
    where: {
      OR: [{ id: agentIdentifier }, { agentId: agentIdentifier }],
    },
    include: {
      treasury: true,
      policy: true,
      positions: {
        where: { isOpen: true },
      },
    },
  });

  if (!agent) {
    throw new Error(`Agent with identifier '${agentIdentifier}' not found.`);
  }

  // 1. Load Treasury Summary (Single DB Source of Truth)
  const treasurySummary = await getTreasurySummary(agent.agentId);
  const availableCapital = treasurySummary.currentBalance;
  const totalEquity = treasurySummary.totalEquity;

  // 2. Active Positions & Limits
  const activePositionsCount = agent.positions.length;
  const maxOpenPositions = agent.policy?.maxOpenPositions ?? GLYPH_POLICY.maxOpenPositions;
  const maxPositionsReached = activePositionsCount >= maxOpenPositions;

  // 3. Daily Loss Circuit Breaker
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

  const initialCapital = Number(agent.treasury?.initialCapital ?? 1000);
  const dailyLossPercent = initialCapital > 0 ? (totalLossDollar / initialCapital) * 100 : 0;
  const maxDailyLossPercent = agent.policy?.maxDailyLossPercent
    ? Number(agent.policy.maxDailyLossPercent)
    : GLYPH_POLICY.maxDailyLossPercent;
  const circuitBreakerTriggered = dailyLossPercent >= maxDailyLossPercent;

  // 4. Current Position for target asset
  let currentPosition: ActivePositionState | null = null;
  if (proposal?.asset) {
    const pos = agent.positions.find(
      (p) => p.asset.toUpperCase() === proposal.asset.toUpperCase()
    );
    if (pos) {
      currentPosition = {
        asset: pos.asset,
        side: pos.side as "LONG" | "SHORT",
      };
    }
  }

  // 5. Position Requirements (if opening a new position)
  let positionRequirements: PositionRequirements | null = null;
  let capitalSufficient = true;
  let reason: string | undefined;

  const isOpening = proposal?.action === "OPEN_LONG" || proposal?.action === "OPEN_SHORT";

  if (isOpening) {
    const maxLeverage = agent.policy?.maxLeverage
      ? Number(agent.policy.maxLeverage)
      : GLYPH_POLICY.maxLeverage;
    const maxPositionPercent = agent.policy?.maxPositionPercent
      ? Number(agent.policy.maxPositionPercent)
      : GLYPH_POLICY.maxPositionPercent;
    const feePercent = agent.policy?.simulatedFeePercent
      ? Number(agent.policy.simulatedFeePercent)
      : GLYPH_POLICY.simulatedFeePercent;

    positionRequirements = calculatePositionRequirements({
      totalEquity,
      availableCapital,
      proposedPositionPercent: proposal?.positionSizePercent,
      proposedLeverage: proposal?.leverage,
      maxLeverage,
      maxPositionPercent,
      feePercent,
    });

    capitalSufficient = positionRequirements.capitalSufficient;

    if (availableCapital <= 0) {
      reason = "INSUFFICIENT_TREASURY: Available simulated capital is $0.00. Cannot open new position without capital.";
    } else if (positionRequirements.requiredMargin <= 0) {
      reason = "INSUFFICIENT_TREASURY: Calculated margin is $0.00. Cannot open position with zero margin.";
    } else if (positionRequirements.totalRequiredCapital > availableCapital) {
      reason = `INSUFFICIENT_TREASURY: Required capital ($${positionRequirements.totalRequiredCapital.toFixed(
        2
      )}) exceeds available capital ($${availableCapital.toFixed(2)}).`;
    }
  }

  return {
    agentId: agent.agentId,
    availableCapital,
    totalEquity,
    activePositionsCount,
    maxOpenPositions,
    dailyLossPercent,
    maxDailyLossPercent,
    positionRequirements,
    capitalSufficient,
    circuitBreakerTriggered,
    maxPositionsReached,
    currentPosition,
    reason,
  };
}
