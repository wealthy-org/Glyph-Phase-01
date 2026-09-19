import { prisma } from "@/lib/prisma";
import { getTreasurySummary } from "@/lib/treasury";
import { getActivePositions } from "@/lib/portfolio";

export interface HeaderMetricsData {
  pnlDollar: number;
  pnlPercent: number;
  treasuryEquity: number;
  currency: string;
  positionDisplay: string;
  openPositionCount: number;
  winRatePercent: number | null;
  winningTradesCount: number;
  losingTradesCount: number;
  closedTradeCount: number;
  agentStatus: string;
  agentId: string;
  network: string;
  cycleCount: number;
}

export async function getHeaderMetrics(agentIdentifier?: string): Promise<HeaderMetricsData> {
  const targetAgentId = agentIdentifier || process.env.GLYPH_AGENT_ID || "1";

  try {
    const agent = await prisma.agent.findFirst({
      where: targetAgentId ? { agentId: targetAgentId } : undefined,
    }) || await prisma.agent.findFirst();

    const resolvedAgentId = agent?.agentId || targetAgentId || "1";

    const [treasury, activePositionsData, closedTrades, decisionCount] = await Promise.all([
      getTreasurySummary(resolvedAgentId),
      getActivePositions(resolvedAgentId),
      agent
        ? prisma.trade.findMany({
            where: { agentId: agent.id, status: { in: ["CLOSED", "LIQUIDATED"] } },
            select: { simulatedPnl: true, simulatedPnlPercent: true },
          })
        : [],
      agent
        ? prisma.decision.count({ where: { agentId: agent.id } })
        : 0,
    ]);

    const closedTradesCount = closedTrades.length;
    const winningTrades = closedTrades.filter(
      (t) => (t.simulatedPnl && Number(t.simulatedPnl) > 0) || (t.simulatedPnlPercent && Number(t.simulatedPnlPercent) > 0)
    ).length;
    const losingTrades = Math.max(0, closedTradesCount - winningTrades);

    const totalEvaluated = winningTrades + losingTrades;
    const winRate =
      totalEvaluated > 0
        ? Math.round((winningTrades / totalEvaluated) * 1000) / 10
        : 0;

    const primaryPosition = activePositionsData.positions[0];
    let positionDisplay = "NONE";
    if (primaryPosition) {
      if (activePositionsData.positions.length > 1) {
        positionDisplay = `${primaryPosition.asset} ${primaryPosition.leverage}× (+${activePositionsData.positions.length - 1})`;
      } else {
        positionDisplay = `${primaryPosition.asset} · ${primaryPosition.side} ${primaryPosition.leverage}×`;
      }
    }

    return {
      pnlDollar: treasury.pnlDollar,
      pnlPercent: treasury.pnlPercent,
      treasuryEquity: treasury.totalEquity,
      currency: treasury.currency,
      positionDisplay,
      openPositionCount: activePositionsData.positions.length,
      winRatePercent: winRate,
      winningTradesCount: winningTrades,
      losingTradesCount: losingTrades,
      closedTradeCount: closedTradesCount,
      agentStatus: agent?.status || "ACTIVE",
      agentId: resolvedAgentId,
      network: "ROBINHOOD TESTNET",
      cycleCount: Math.max(1, decisionCount),
    };
  } catch (error) {
    console.error("[getHeaderMetrics] Error fetching header metrics:", error);
    return {
      pnlDollar: 0,
      pnlPercent: 0,
      treasuryEquity: 1000,
      currency: "USD-SIM",
      positionDisplay: "NONE",
      openPositionCount: 0,
      winRatePercent: 0,
      winningTradesCount: 0,
      losingTradesCount: 0,
      closedTradeCount: 0,
      agentStatus: "ACTIVE",
      agentId: targetAgentId,
      network: "ROBINHOOD TESTNET",
      cycleCount: 1,
    };
  }
}
