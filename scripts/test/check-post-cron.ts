import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const latestRun = await prisma.agentRun.findFirst({
    orderBy: { startedAt: "desc" },
  });

  const totalRuns = await prisma.agentRun.count();
  const totalDecisions = await prisma.decision.count();
  const totalTrades = await prisma.trade.count();
  const totalSnapshots = await prisma.researchSnapshot.count();
  const totalEvents = await prisma.economicEvent.count();
  const totalActivities = await prisma.activityLog.count();

  console.log("=== CRON EXECUTION CHECK ===");
  console.log("Total Runs:", totalRuns);
  console.log("Total Decisions:", totalDecisions);
  console.log("Total Trades:", totalTrades);
  console.log("Total Snapshots:", totalSnapshots);
  console.log("Total Economic Events:", totalEvents);
  console.log("Total Activity Logs:", totalActivities);
  console.log("Latest Run:", {
    id: latestRun?.id,
    cycleKey: latestRun?.cycleKey,
    startedAt: latestRun?.startedAt?.toISOString(),
    completedAt: latestRun?.completedAt?.toISOString(),
    policyResult: latestRun?.policyResult,
    tradeId: latestRun?.tradeId,
    txHash: latestRun?.transactionHash,
    error: latestRun?.error,
  });

  const latestActivities = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 5,
  });
  console.log("\nLatest 5 Activities:");
  for (const a of latestActivities) {
    console.log(`[${a.timestamp.toISOString()}] ${a.activityType} (${a.status}) - ${a.title}`);
  }
}

main().finally(() => prisma.$disconnect());
