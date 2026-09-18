// ============================================================================
// GLYPH PHASE 01 — HOMEPAGE SERVER DATA AGGREGATOR
// Derived from: BRIEF.md (§2.1-§2.5, §3.0A, §3.0B) & TODO.md
// Aggregates authoritative economic, portfolio, decision, memory, and reputation state.
// Acts as a pure aggregator — delegates calculations to authoritative services.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { getTreasurySummary } from "@/lib/treasury";
import { getActivePositions } from "@/lib/portfolio";
import { getExplorerTxUrl } from "@/lib/onchain/registry";
import {
  LandingPageData,
  LandingTreasuryData,
  LandingPositionItem,
  LandingLatestDecision,
  LandingEconomicEvent,
  LandingMemoryItem,
  LandingReputationData,
  LandingAgentMeta,
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
  const agent = targetAgentId
    ? await prisma.agent.findFirst({ where: { agentId: targetAgentId } })
    : await prisma.agent.findFirst();

  const birthDate = agent ? new Date(agent.createdAt) : now;
  const diffMs = Math.max(0, now.getTime() - birthDate.getTime());
  const activeDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const activeHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  const agentMeta: LandingAgentMeta = {
    id: agent?.id || "",
    agentId: agent?.agentId || agentIdentifier,
    name: agent?.name || "GLYPH",
    status: agent?.status || "ACTIVE",
    objective: GLYPH_CORE_OBJECTIVE,
    activeDays,
    activeHours,
    createdAt: birthDate.toISOString(),
  };

  // 2. Authoritative Treasury & Portfolio State
  const treasurySummary = await getTreasurySummary(agentIdentifier);
  const activePositionsData = await getActivePositions(agentIdentifier);

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
    const rawThesis = (latestDecisionRecord.thesis as Record<string, any>) || {};
    const hasValidTx =
      Boolean(latestDecisionRecord.transactionHash) &&
      !latestDecisionRecord.transactionHash?.endsWith("000000000000");

    latestDecision = {
      id: latestDecisionRecord.id,
      asset: latestDecisionRecord.asset,
      action: latestDecisionRecord.action as "LONG" | "SHORT" | "NO_TRADE",
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
    recentEvents,
    latestMemory,
    adaptiveLearnings,
    reputation,
    cognitiveCycleCount: decisionsCount,
  };
}
