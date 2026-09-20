// ============================================================================
// GLYPH PHASE 01 — ACTIVITY LOGGING SERVICE
// Derived from: Master Brief & Mandatory Database Activity Logging
//
// Every major activity in a single Glyph cycle MUST create a database log:
// ANALYSIS -> DECISION -> RISK_POLICY -> TRADE / NO_TRADE -> ONCHAIN_PROOF
// Linked by cycle_id for complete chronological auditability.
// ============================================================================

import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "ECONOMIC_PRECHECK"
  | "ANALYSIS"
  | "DECISION"
  | "RISK_POLICY"
  | "TRADE"
  | "NO_TRADE"
  | "ONCHAIN_PROOF"
  | "MEMORY";

export type ActivityStatus =
  | "PASSED"
  | "COMPLETED"
  | "FAILED"
  | "APPROVED"
  | "REJECTED"
  | "OPENED"
  | "NO_POSITION"
  | "COMMITTED";

export interface LogActivityParams {
  cycleId: string;
  agentId: string; // Database UUID or agent identifier
  activityType: ActivityType;
  asset?: string;
  status: ActivityStatus | string;
  title: string;
  description?: string;
  data?: Record<string, any>;
  decisionId?: string;
  tradeId?: string;
  txHash?: string;
  error?: string;
}

/**
 * Resolves the Agent database UUID from either an agentId string or numeric identifier.
 */
async function resolveAgentDbId(agentIdentifier: string): Promise<string> {
  const agent = await prisma.agent.findFirst({
    where: {
      OR: [{ id: agentIdentifier }, { agentId: agentIdentifier }],
    },
    select: { id: true },
  });

  if (!agent) {
    throw new Error(`Agent with identifier '${agentIdentifier}' not found.`);
  }

  return agent.id;
}

/**
 * Base database activity logger. Persists record in activity_logs table.
 */
export async function logCycleActivity(params: LogActivityParams) {
  try {
    const agentDbId = await resolveAgentDbId(params.agentId);

    const log = await prisma.activityLog.create({
      data: {
        cycleId: params.cycleId,
        agentId: agentDbId,
        activityType: params.activityType,
        asset: params.asset?.toUpperCase(),
        status: params.status,
        title: params.title,
        description: params.description,
        data: params.data ?? {},
        decisionId: params.decisionId,
        tradeId: params.tradeId,
        txHash: params.txHash,
        error: params.error,
      },
    });

    return log;
  } catch (err: any) {
    console.error(`[ActivityLogger] Failed to write ${params.activityType} log:`, err.message);
    return null;
  }
}

/**
 * 0. Economic Precheck Log Helper (§Mandatory Economic Safety)
 */
export async function logEconomicPrecheckActivity(params: {
  cycleId: string;
  agentId: string;
  asset?: string;
  status: "PASSED" | "REJECTED";
  availableCapital: number;
  totalEquity: number;
  activePositionsCount: number;
  requiredMargin?: number;
  reason?: string;
  error?: string;
}) {
  const isPassed = params.status === "PASSED";
  const title = isPassed
    ? `Economic Precheck PASSED — Available Capital $${params.availableCapital.toFixed(2)}`
    : `Economic Precheck REJECTED — ${params.reason || "Insufficient Capital"}`;

  const description = isPassed
    ? `Simulated treasury capital is sufficient ($${params.availableCapital.toFixed(2)} available, equity $${params.totalEquity.toFixed(2)}). Active positions: ${params.activePositionsCount}.`
    : `Economic precondition failed: ${params.reason}. Available: $${params.availableCapital.toFixed(2)}, Equity: $${params.totalEquity.toFixed(2)}.`;

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "ECONOMIC_PRECHECK",
    asset: params.asset,
    status: params.status,
    title,
    description,
    data: {
      availableCapital: params.availableCapital,
      totalEquity: params.totalEquity,
      activePositionsCount: params.activePositionsCount,
      requiredMargin: params.requiredMargin,
      reason: params.reason,
    },
    error: params.error,
  });
}

/**
 * 1. Analysis Log Helper
 */
export async function logAnalysisActivity(params: {
  cycleId: string;
  agentId: string;
  asset: string;
  status: "COMPLETED" | "FAILED";
  marketDataRef?: { price: number; volume?: number; source?: string };
  technical?: { trend: string; technicalScore: number; rsi14?: number };
  fundamental?: { score: number; sentimentVerdict?: string };
  riskContext?: { regime: string; level: string };
  error?: string;
}) {
  const isSuccess = params.status === "COMPLETED";
  const title = isSuccess
    ? `Market Analysis Completed — ${params.asset.toUpperCase()}`
    : `Market Analysis Failed — ${params.asset.toUpperCase()}`;

  const description = isSuccess
    ? `Regime: ${params.riskContext?.regime || "NEUTRAL"} · Tech Score: ${params.technical?.technicalScore ?? "N/A"}/100 · Fund Score: ${params.fundamental?.score ?? "N/A"}/100`
    : `Analysis halted due to error: ${params.error}`;

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "ANALYSIS",
    asset: params.asset,
    status: params.status,
    title,
    description,
    data: {
      marketData: params.marketDataRef,
      technical: params.technical,
      fundamental: params.fundamental,
      riskContext: params.riskContext,
    },
    error: params.error,
  });
}

/**
 * 2. Decision Log Helper
 */
export async function logDecisionActivity(params: {
  cycleId: string;
  agentId: string;
  asset: string;
  decisionId: string;
  action: string;
  thesis: {
    fundamental: string;
    technical: string;
    catalyst: string;
    risk: string;
    invalidation: string;
  };
  conviction: number;
  timeHorizon?: string;
  policyStatus?: string;
  decisionHash?: string;
}) {
  const cleanAction = params.action.replace("OPEN_", "");
  const title = `Decision Formed — ${cleanAction} (${params.conviction}% Conviction)`;
  const description = params.thesis.catalyst || "Autonomous decision formed based on synthesized thesis.";

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "DECISION",
    asset: params.asset,
    decisionId: params.decisionId,
    status: "COMPLETED",
    title,
    description,
    data: {
      action: params.action,
      conviction: params.conviction,
      timeHorizon: params.timeHorizon,
      thesis: params.thesis,
      policyStatus: params.policyStatus,
      decisionHash: params.decisionHash,
    },
  });
}

/**
 * 3. Policy Log Helper
 */
export async function logPolicyActivity(params: {
  cycleId: string;
  agentId: string;
  asset: string;
  decisionId: string;
  decisionAction: string;
  result: "APPROVED" | "REJECTED";
  rejectReason?: string | null;
  clampedLeverage?: number;
  clampedPositionPercent?: number;
}) {
  const isApproved = params.result === "APPROVED";
  const cleanAction = params.decisionAction.replace("OPEN_", "");
  const title = `Risk Policy Evaluation — ${params.result} (${cleanAction})`;
  const description = isApproved
    ? `Proposal approved. Leverage clamped to ${params.clampedLeverage ?? 1}×, size clamped to ${params.clampedPositionPercent ?? 5}%.`
    : `Proposal rejected: ${params.rejectReason || "Risk limit breached."}`;

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "RISK_POLICY",
    asset: params.asset,
    decisionId: params.decisionId,
    status: params.result,
    title,
    description,
    data: {
      decision: cleanAction,
      result: params.result,
      rejectReason: params.rejectReason,
      clampedLeverage: params.clampedLeverage,
      clampedPositionPercent: params.clampedPositionPercent,
    },
  });
}

/**
 * 4. Trade Log Helper (Executed Paper Trade)
 */
export async function logTradeActivity(params: {
  cycleId: string;
  agentId: string;
  decisionId: string;
  tradeId: string;
  tradeNumber?: string;
  asset: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  positionSize: number;
  leverage: number;
  simulatedCapital?: number;
  fees?: number;
}) {
  const title = `Paper Trade Opened — ${params.side} ${params.asset.toUpperCase()}`;
  const description = `Executed ${params.side} on ${params.asset.toUpperCase()} at $${params.entryPrice.toFixed(2)} (${params.leverage}× leverage, size $${params.positionSize.toFixed(2)}).`;

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "TRADE",
    asset: params.asset,
    decisionId: params.decisionId,
    tradeId: params.tradeId,
    status: "OPENED",
    title,
    description,
    data: {
      tradeNumber: params.tradeNumber,
      side: params.side,
      entryPrice: params.entryPrice,
      positionSize: params.positionSize,
      leverage: params.leverage,
      simulatedCapital: params.simulatedCapital,
      fees: params.fees,
      status: "OPENED",
    },
  });
}

/**
 * 5. No Trade Log Helper (When NO_TRADE was decided or Policy Rejected)
 */
export async function logNoTradeActivity(params: {
  cycleId: string;
  agentId: string;
  asset: string;
  decisionId?: string;
  action: string;
  reason: string;
}) {
  const cleanAction = params.action.replace("OPEN_", "");
  const title = `No Position Opened — ${cleanAction === "NO_TRADE" ? "Zero Edge" : "Policy Rejected"}`;
  const description = params.reason || "Cycle completed without opening a paper position.";

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "NO_TRADE",
    asset: params.asset,
    decisionId: params.decisionId,
    status: "NO_POSITION",
    title,
    description,
    data: {
      action: params.action,
      reason: params.reason,
    },
  });
}

/**
 * 6. Onchain Proof Log Helper
 */
export async function logProofActivity(params: {
  cycleId: string;
  agentId: string;
  decisionId: string;
  decisionHash?: string;
  transactionHash?: string;
  status: "COMMITTED" | "FAILED";
  error?: string;
}) {
  const isCommitted = params.status === "COMMITTED";
  const title = isCommitted
    ? "Onchain Proof Committed"
    : "Onchain Proof Failed";
  const description = isCommitted
    ? `Canonical decision hash committed to DecisionRegistry on Robinhood Testnet: ${params.transactionHash}`
    : `Failed to commit onchain proof: ${params.error}`;

  return logCycleActivity({
    cycleId: params.cycleId,
    agentId: params.agentId,
    activityType: "ONCHAIN_PROOF",
    decisionId: params.decisionId,
    txHash: params.transactionHash,
    status: params.status,
    title,
    description,
    data: {
      decisionHash: params.decisionHash,
      transactionHash: params.transactionHash,
      chainId: 46630,
    },
    error: params.error,
  });
}

/**
 * Retrieves all activities for a specific cycle in chronological order.
 */
export async function getCycleActivities(cycleId: string) {
  return prisma.activityLog.findMany({
    where: { cycleId },
    orderBy: { timestamp: "asc" },
  });
}

/**
 * Retrieves the most recent activity logs for an agent.
 */
export async function getRecentActivities(agentIdentifier?: string, limit = 20) {
  const where = agentIdentifier
    ? {
      agent: {
        OR: [{ id: agentIdentifier }, { agentId: agentIdentifier }],
      },
    }
    : undefined;

  return prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
