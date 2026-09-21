// ============================================================================
// GLYPH PHASE 01 — HOMEPAGE SERVER DATA AGGREGATOR
// Derived from: BRIEF.md (§2.1-§2.5, §3.0A, §3.0B) & TODO.md
// Aggregates authoritative economic, portfolio, decision, memory, and reputation state.
// Acts as a pure aggregator — delegates calculations to authoritative services.
// ============================================================================

import { getExplorerTxUrl } from "@/lib/onchain/registry";
import { getActivePositions } from "@/lib/portfolio";
import { prisma } from "@/lib/prisma";
import { getTreasurySummary } from "@/lib/treasury";
import {
  LandingAgentMeta,
  LandingAnalysisState,
  LandingEconomicEvent,
  LandingLatestActivity,
  LandingLatestDecision,
  LandingMemoryItem,
  LandingPageData,
  LandingPositionItem,
  LandingReputationData,
  LandingTreasuryData,
} from "./types";

export const GLYPH_CORE_OBJECTIVE = "Grow economic capital while preserving survival.";

function calculateAgentDay(eventDate: Date, birthDate: Date): number {
  const eventUtc = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate()
  );
  const birthUtc = Date.UTC(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth(),
    birthDate.getUTCDate()
  );

  const diffDays = Math.floor((eventUtc - birthUtc) / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays + 1);
}

/**
 * Aggregates all authoritative data required for the public Homepage observation terminal.
 * Gracefully handles newly initialized, empty, or partial database states.
 */
export async function getLandingPageData(agentIdentifier?: string): Promise<LandingPageData> {
  const now = new Date();

  // 1. Fetch Agent record
  const targetAgentId = agentIdentifier || process.env.GLYPH_AGENT_ID;
  let agent = targetAgentId
    ? await prisma.agent.findFirst({ where: { agentId: targetAgentId } })
    : await prisma.agent.findFirst();

  if (!agent) {
    agent = await prisma.agent.findFirst();
  }

  const birthDate = agent ? new Date(agent.createdAt) : now;
  const diffMs = Math.max(0, now.getTime() - birthDate.getTime());
  const activeDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const activeHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  const agentMeta: LandingAgentMeta = {
    id: agent?.id || "",
    agentId: agent?.agentId || agentIdentifier || process.env.GLYPH_AGENT_ID || "1",
    name: agent?.name || "GLYPH",
    status: agent?.status || "ACTIVE",
    objective: GLYPH_CORE_OBJECTIVE,
    activeDays,
    activeHours,
    createdAt: birthDate.toISOString(),
  };

  // 2. Authoritative Treasury & Portfolio State
  const resolvedAgentId = agent?.agentId || targetAgentId || process.env.GLYPH_AGENT_ID || "1";
  const treasurySummary = await getTreasurySummary(resolvedAgentId);
  const activePositionsData = await getActivePositions(resolvedAgentId);

  // Fetch closed trades for realized PnL and win-rate calculations
  const closedTrades = agent
    ? await prisma.trade.findMany({
      where: { agentId: agent.id, status: { in: ["CLOSED", "LIQUIDATED"] } },
      select: { simulatedPnl: true },
    })
    : [];

  const cumulativeRealizedPnl = closedTrades.reduce(
    (sum, t) => sum + (t.simulatedPnl ? Number(t.simulatedPnl) : 0),
    0
  );

  const treasuryData: LandingTreasuryData = {
    currency: treasurySummary.currency,
    initialCapital: treasurySummary.initialCapital,
    cashBalance: treasurySummary.currentBalance,
    allocatedMargin: treasurySummary.allocatedMargin,
    unrealizedPnl: treasurySummary.unrealizedPnl,
    totalEquity: treasurySummary.totalEquity,
    pnlDollar: treasurySummary.pnlDollar,
    pnlPercent: treasurySummary.pnlPercent,
    realizedPnl: cumulativeRealizedPnl,
  };

  const openPositions: LandingPositionItem[] = activePositionsData.positions.map((p) => ({
    id: p.id,
    tradeId: p.tradeId,
    tradeNumber: p.tradeNumber,
    asset: p.asset,
    side: p.side as "LONG" | "SHORT",
    entryPrice: p.entryPrice,
    currentPrice: p.currentPrice,
    margin: p.margin,
    leverage: p.leverage,
    notional: p.notional,
    unrealizedPnl: p.unrealizedPnl,
    unrealizedPnlPercent: p.unrealizedPnlPercent,
    openedAt: p.openedAt.toISOString(),
  }));

  // 3. Authoritative Latest Decision (May or may NOT have resulted in a trade)
  const latestDecisionRecord = agent
    ? await prisma.decision.findFirst({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      include: { trade: true },
    })
    : null;

  let latestDecision: LandingLatestDecision | null = null;

  if (latestDecisionRecord) {
    const rawThesis = latestDecisionRecord.thesis as {
      fundamental?: string;
      technical?: string;
      catalyst?: string;
      risk?: string;
      invalidation?: string;
    };
    const hasValidTx =
      Boolean(latestDecisionRecord.transactionHash) &&
      !latestDecisionRecord.transactionHash?.endsWith("000000000000");

    latestDecision = {
      id: latestDecisionRecord.id,
      asset: latestDecisionRecord.asset,
      action: latestDecisionRecord.action as
        | "OPEN_LONG"
        | "OPEN_SHORT"
        | "HOLD"
        | "CLOSE"
        | "NO_TRADE",
      conviction: latestDecisionRecord.conviction,
      fundamentalScore: latestDecisionRecord.fundamentalScore,
      technicalScore: latestDecisionRecord.technicalScore,
      riskScore: latestDecisionRecord.riskScore,
      policyResult: latestDecisionRecord.policyResult as "APPROVED" | "REJECTED",
      policyRejectReason: latestDecisionRecord.policyRejectReason,
      thesis: {
        fundamental: rawThesis.fundamental,
        technical: rawThesis.technical,
        catalyst: rawThesis.catalyst,
        risk: rawThesis.risk,
        invalidation: rawThesis.invalidation,
      },
      decisionHash: latestDecisionRecord.decisionHash,
      transactionHash: hasValidTx ? latestDecisionRecord.transactionHash : null,
      explorerUrl: hasValidTx ? getExplorerTxUrl(latestDecisionRecord.transactionHash!) : null,
      tradeId: latestDecisionRecord.tradeId,
      tradeNumber: latestDecisionRecord.trade?.tradeNumber || null,
      createdAt: latestDecisionRecord.createdAt.toISOString(),
    };
  }

  const activityCandidates = agent
    ? await prisma.activityLog.findMany({
      where: {
        agentId: agent.id,
        activityType: { in: ["ANALYSIS", "TRADE"] },
        asset: { not: null },
      },
      orderBy: { timestamp: "desc" },
      take: 20,
      select: {
        id: true,
        cycleId: true,
        activityType: true,
        status: true,
        asset: true,
        title: true,
        timestamp: true,
      },
    })
    : [];

  // ActivityLog is authoritative only while its execution still has a
  // corresponding AgentRun. This prevents genesis resets from reviving
  // stale activity even when old research snapshots remain in the database.
  const validActivityRecords = await Promise.all(
    activityCandidates.map(async (activity) => {
      if (!activity.cycleId) return null;
      const run = await prisma.agentRun.findUnique({
        where: { cycleKey: activity.cycleId },
        select: { id: true },
      });
      return run ? activity : null;
    })
  );

  const latestActivityRecord = validActivityRecords.find(
    (activity): activity is (typeof activityCandidates)[number] => activity !== null
  ) || null;
  const latestAnalysisActivity = validActivityRecords.find(
    (activity) => activity?.activityType === "ANALYSIS"
  ) || null;

  const latestResearchSnapshot = latestAnalysisActivity
    ? await prisma.researchSnapshot.findFirst({
      where: {
        cycleId: latestAnalysisActivity.cycleId,
        asset: latestAnalysisActivity.asset || undefined,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        asset: true,
        cycleId: true,
        marketData: true,
        fundamentalData: true,
        technicalData: true,
        sourceMetadata: true,
        createdAt: true,
      },
    })
    : null;

  const numeric = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const text = (value: unknown): string | null =>
    typeof value === "string" && value.trim().length > 0 ? value : null;
  const marketData = latestResearchSnapshot?.marketData as { quote?: Record<string, unknown> } | null;
  const fundamentalData = latestResearchSnapshot?.fundamentalData as { fundamentalScore?: unknown } | null;
  const technicalData = latestResearchSnapshot?.technicalData as {
    technicalScore?: unknown;
    trend?: unknown;
    volatilityPercent?: unknown;
  } | null;
  const sourceMetadata = latestResearchSnapshot?.sourceMetadata as {
    riskContext?: { regime?: unknown; level?: unknown; details?: unknown };
  } | null;
  const riskContext = sourceMetadata?.riskContext;
  const quote = marketData?.quote;
  const latestAnalysis: LandingAnalysisState | null = latestResearchSnapshot
    ? {
      snapshotId: latestResearchSnapshot.id,
      cycleId: latestResearchSnapshot.cycleId,
      asset: latestResearchSnapshot.asset,
      fundamentalScore: numeric(fundamentalData?.fundamentalScore),
      technicalScore: numeric(technicalData?.technicalScore),
      riskScore: latestDecisionRecord?.researchSnapshotId === latestResearchSnapshot.id
        ? latestDecisionRecord.riskScore
        : null,
      riskContext: {
        regime: text(riskContext?.regime),
        level: text(riskContext?.level),
        details: text(riskContext?.details),
      },
      marketContext: {
        price: numeric(quote?.price),
        changePercent: numeric(quote?.changePercent),
        volume: numeric(quote?.volume),
        trend: text(technicalData?.trend),
        volatilityPercent: numeric(technicalData?.volatilityPercent),
      },
      createdAt: latestResearchSnapshot.createdAt.toISOString(),
    }
    : null;

  const latestActivity: LandingLatestActivity | null = latestActivityRecord?.asset?.trim()
    ? {
      id: latestActivityRecord.id,
      cycleId: latestActivityRecord.cycleId,
      activityType: latestActivityRecord.activityType as "ANALYSIS" | "TRADE",
      status: latestActivityRecord.status,
      asset: latestActivityRecord.asset.trim(),
      title: latestActivityRecord.title,
      timestamp: latestActivityRecord.timestamp.toISOString(),
    }
    : null;

  // 4. Authoritative Recent Economic Events (6 entries for homepage)
  const eventRecords = agent
    ? await prisma.economicEvent.findMany({
      where: { agentId: agent.id },
      orderBy: { timestamp: "desc" },
      take: 6,
    })
    : [];

  const recentEvents: LandingEconomicEvent[] = eventRecords.map((evt) => {
    const d = new Date(evt.timestamp);
    const day = evt.day ?? calculateAgentDay(d, birthDate);
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const time =
      d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC";

    return {
      id: evt.id,
      day,
      date,
      time,
      timestamp: evt.timestamp.toISOString(),
      eventType: evt.eventType,
      title: evt.title,
      description: evt.description || "",
      result: evt.result || null,
      txHash: evt.txHash || null,
    };
  });

  // 5. Authoritative Memories & Adaptive Feedback
  const memoryRecords = agent
    ? await prisma.memory.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    })
    : [];

  const memories: LandingMemoryItem[] = memoryRecords.map((m) => ({
    id: m.id,
    tradeId: m.tradeId,
    outcome: m.outcome as "WIN" | "LOSS" | "BREAKEVEN",
    pnlPercent: m.pnlPercent ? Number(m.pnlPercent) : null,
    thesisResult: m.thesisResult,
    lesson: m.lesson,
    adaptation: m.adaptation,
    weightShift: m.weightShift,
    createdAt: m.createdAt.toISOString(),
  }));

  const latestMemory = memories.length > 0 ? memories[0] : null;
  const adaptiveLearnings = memories.filter((m) => Boolean(m.weightShift || m.adaptation));

  // 6. Authoritative Reputation Metrics
  const [decisionsCount, tradesCount, onchainAttestationsCount] = await Promise.all([
    agent ? prisma.decision.count({ where: { agentId: agent.id } }) : 0,
    agent ? prisma.trade.count({ where: { agentId: agent.id } }) : 0,
    agent
      ? prisma.decision.count({
        where: {
          agentId: agent.id,
          transactionHash: { not: null },
          NOT: { transactionHash: { endsWith: "000000000000" } },
        },
      })
      : 0,
  ]);

  const closedTradesCount = closedTrades.length;
  const winningTradesCount = closedTrades.filter(
    (t) => t.simulatedPnl && Number(t.simulatedPnl) > 0
  ).length;

  // Win rate formula strictly across completed/closed trades. If 0 closed trades, returns null.
  const winRate =
    closedTradesCount > 0 ? (winningTradesCount / closedTradesCount) * 100 : null;

  const reputation: LandingReputationData = {
    decisionsCount,
    tradesCount,
    closedTradesCount,
    winningTradesCount,
    winRate,
    thesesPublished: decisionsCount,
    onchainAttestationsCount,
    realizedPnl: cumulativeRealizedPnl,
  };

  return {
    agent: agentMeta,
    treasury: treasuryData,
    openPositions,
    latestDecision,
    latestAnalysis,
    latestActivity,
    recentEvents,
    latestMemory,
    adaptiveLearnings,
    reputation,
    cognitiveCycleCount: decisionsCount,
  };
}
