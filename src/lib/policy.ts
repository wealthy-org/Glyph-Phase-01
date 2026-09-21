// ============================================================================
// GLYPH PHASE 01 — RISK POLICY ENGINE (GLYPH_POLICY)
// Deterministic policy layer independent of the LLM.
// Derived from: BRIEF.md (§10, §3.0C, §3.8, §3.10)
//
// Core Principle:
// "LLM proposes. Policy validates. Execution layer acts."
// The LLM cannot modify the policy. allowedAssets is hardcoded in code.
// ============================================================================

import {
  calculatePositionRequirements,
  evaluateEconomicPreconditions,
  PositionRequirements,
} from "./economic-precheck";

/**
 * Hardcoded Whitelist of Allowed Assets (BRIEF §3.8, §10).
 * MUST NOT be stored solely in a database table that could be dynamically manipulated.
 */
export const ALLOWED_ASSETS = ["NVDA", "MSFT", "AAPL"] as const;
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
  action: "OPEN_LONG" | "OPEN_SHORT" | "HOLD" | "CLOSE" | "NO_TRADE";
  conviction: number; // 0-100
  positionSizePercent?: number; // Proposed % of equity
  leverage?: number; // Proposed leverage multiplier
}

export interface ActivePositionState {
  asset: string;
  side: "LONG" | "SHORT";
}

export interface PolicyValidationResult {
  approved: boolean;
  policyResult: "APPROVED" | "REJECTED";
  rejectReason: string | null;
  clampedLeverage: number;
  clampedPositionPercent: number;
}

export interface EconomicContextInput {
  availableCapital?: number;
  totalEquity?: number;
  positionRequirements?: PositionRequirements | null;
}

/**
 * Validates a proposed trade against GLYPH_POLICY rules deterministically.
 * Pure validation logic without external database dependencies.
 */
export function validateTradeProposal(
  proposal: TradeProposal,
  currentOpenPositionsCount: number = 0,
  dailyLossPercent: number = 0,
  currentPosition: ActivePositionState | null = null,
  isMarketOpen: boolean = true,
  economicContext?: EconomicContextInput
): PolicyValidationResult {
  // 0. Check Market Hours for any order that would execute a trade.
  if (
    !isMarketOpen &&
    (proposal.action === "OPEN_LONG" ||
      proposal.action === "OPEN_SHORT" ||
      proposal.action === "CLOSE")
  ) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: "Market is closed. Trade execution is not allowed outside regular trading hours.",
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // NO_TRADE is a first-class valid decision (Brief §3.0B):
  // The Glyph Brain deliberately chose not to trade. Policy APPROVES this decision
  // (acknowledging the brain's autonomous reasoning). NO_TRADE requires NO capital.
  // The trade gate in engine.ts independently prevents trade creation when action === NO_TRADE.
  if (proposal.action === "NO_TRADE") {
    return {
      approved: true,
      policyResult: "APPROVED",
      rejectReason: null,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // HOLD / CLOSE operate on existing positions and do not require new capital
  if (proposal.action === "HOLD" || proposal.action === "CLOSE") {
    if (!currentPosition) {
      return {
        approved: false,
        policyResult: "REJECTED",
        rejectReason: `${proposal.action} requires an active position for ${proposal.asset}.`,
        clampedLeverage: 1,
        clampedPositionPercent: 0,
      };
    }

    if (currentPosition.asset.toUpperCase() !== proposal.asset.toUpperCase()) {
      return {
        approved: false,
        policyResult: "REJECTED",
        rejectReason: `Active position is ${currentPosition.asset}, not ${proposal.asset}.`,
        clampedLeverage: 1,
        clampedPositionPercent: 0,
      };
    }

    return {
      approved: true,
      policyResult: "APPROVED",
      rejectReason: null,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // Cannot open position if one is already open for this asset
  if (currentPosition) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: `Cannot ${proposal.action} ${proposal.asset} while ${currentPosition.side} position is open. Close it first.`,
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

  // 6. Mandatory Economic Precondition for New Positions (OPEN_LONG / OPEN_SHORT)
  const availableCapital = economicContext?.availableCapital ?? 0;
  const totalEquity = economicContext?.totalEquity ?? availableCapital;

  if (availableCapital <= 0) {
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: "INSUFFICIENT_TREASURY: Available simulated capital is $0.00. Cannot open new position without capital.",
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  // Single source of truth for position sizing
  const positionRequirements =
    economicContext?.positionRequirements ??
    calculatePositionRequirements({
      totalEquity,
      availableCapital,
      proposedPositionPercent: proposal.positionSizePercent,
      proposedLeverage: proposal.leverage,
    });

  if (!positionRequirements.capitalSufficient) {
    const reason =
      positionRequirements.requiredMargin <= 0
        ? "INSUFFICIENT_TREASURY: Calculated margin is $0.00. Cannot open position with zero margin."
        : `INSUFFICIENT_TREASURY: Required capital ($${positionRequirements.totalRequiredCapital.toFixed(
          2
        )}) exceeds available capital ($${availableCapital.toFixed(2)}).`;
    return {
      approved: false,
      policyResult: "REJECTED",
      rejectReason: reason,
      clampedLeverage: 1,
      clampedPositionPercent: 0,
    };
  }

  return {
    approved: true,
    policyResult: "APPROVED",
    rejectReason: null,
    clampedLeverage: positionRequirements.leverage,
    clampedPositionPercent: positionRequirements.clampedPositionPercent,
  };
}

/**
 * Evaluates an agent trade proposal by pulling live state (treasury, open positions count, 24h loss)
 * directly from the database and running deterministic validation.
 */
export async function evaluateAgentTradeProposal(
  agentIdentifier: string = "1",
  proposal: TradeProposal,
  options?: {
    isMarketOpen?: boolean;
    availableCapital?: number;
    totalEquity?: number;
    positionRequirements?: PositionRequirements | null;
  }
): Promise<PolicyValidationResult> {
  const precheck = await evaluateEconomicPreconditions(agentIdentifier, proposal);

  const availableCapital =
    options?.availableCapital !== undefined
      ? options.availableCapital
      : precheck.availableCapital;
  const totalEquity =
    options?.totalEquity !== undefined ? options.totalEquity : precheck.totalEquity;
  const positionRequirements =
    options?.positionRequirements !== undefined
      ? options.positionRequirements
      : precheck.positionRequirements;

  return validateTradeProposal(
    proposal,
    precheck.activePositionsCount,
    precheck.dailyLossPercent,
    precheck.currentPosition,
    options?.isMarketOpen ?? true,
    {
      availableCapital,
      totalEquity,
      positionRequirements,
    }
  );
}
