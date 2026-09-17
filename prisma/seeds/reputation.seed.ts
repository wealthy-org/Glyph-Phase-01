import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedReputation(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ [5/5] Seeding Initial Reputation Metrics...");

  const metrics = await prisma.reputationMetrics.upsert({
    where: { agentId },
    update: {
      decisionsCount: 0,
      tradesCount: 0,
      winRate: 0,
      realizedPnl: 0,
      averageReturn: 0,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 7, // Day 7 from genesis
    },
    create: {
      agentId,
      decisionsCount: 0,
      tradesCount: 0,
      winRate: 0,
      realizedPnl: 0,
      averageReturn: 0,
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
