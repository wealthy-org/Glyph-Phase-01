import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedReputation(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ [5/5] Seeding Initial Reputation Metrics...");

  const [decisionsCount, trades] = await Promise.all([
    prisma.decision.count({ where: { agentId } }),
    prisma.trade.findMany({
      where: { agentId },
      select: { simulatedPnl: true, simulatedPnlPercent: true, status: true },
    }),
  ]);
  const closedTrades = trades.filter((trade) => trade.status !== "OPEN");
  const winningTrades = closedTrades.filter((trade) => Number(trade.simulatedPnl ?? 0) > 0);
  const realizedPnl = closedTrades.reduce(
    (total, trade) => total + Number(trade.simulatedPnl ?? 0),
    0
  );
  const averageReturn = closedTrades.length
    ? closedTrades.reduce((total, trade) => total + Number(trade.simulatedPnlPercent ?? 0), 0) /
    closedTrades.length
    : 0;

  const metrics = await prisma.reputationMetrics.upsert({
    where: { agentId },
    update: {
      decisionsCount,
      tradesCount: trades.length,
      winRate: closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0,
      realizedPnl,
      averageReturn,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 7, // Day 7 from genesis
    },
    create: {
      agentId,
      decisionsCount,
      tradesCount: trades.length,
      winRate: closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0,
      realizedPnl,
      averageReturn,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 7,
    },
  });

  console.log(
    `    ✅ Reputation Metrics initialized: Days Active: ${metrics.timeActiveDays}, Decisions: ${metrics.decisionsCount}, Trades: ${metrics.tradesCount}`
  );

  return metrics;
}
