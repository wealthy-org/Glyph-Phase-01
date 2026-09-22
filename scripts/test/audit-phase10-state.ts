import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("=================== AUDIT PHASE 10 STATE ===================");
  
  const agent = await prisma.agent.findFirst({
    include: { treasury: true, policy: true }
  });
  console.log("Agent:", {
    id: agent?.id,
    agentId: agent?.agentId,
    name: agent?.name,
    treasury: agent?.treasury,
  });

  const decisions = await prisma.decision.findMany({
    include: { trade: true }
  });
  console.log("\n--- DECISIONS (" + decisions.length + ") ---");
  for (const d of decisions) {
    console.log(JSON.stringify(d, null, 2));
  }

  const trades = await prisma.trade.findMany();
  console.log("\n--- TRADES (" + trades.length + ") ---");
  for (const t of trades) {
    console.log(JSON.stringify(t, null, 2));
  }

  const positions = await prisma.position.findMany();
  console.log("\n--- POSITIONS (" + positions.length + ") ---");
  for (const p of positions) {
    console.log(JSON.stringify(p, null, 2));
  }

  const runs = await prisma.agentRun.findMany({
    orderBy: { startedAt: "desc" },
  });
  console.log("\n--- AGENT RUNS (" + runs.length + ") ---");
  for (const r of runs) {
    console.log(`Run ${r.id} (${r.policyResult ?? "N/A"}): started ${r.startedAt?.toISOString()}, ended ${r.completedAt?.toISOString()}`);
  }

  const snapshots = await prisma.researchSnapshot.findMany({
    orderBy: { createdAt: "desc" }
  });
  console.log("\n--- RESEARCH SNAPSHOTS (" + snapshots.length + ") ---");
  for (const s of snapshots) {
    console.log(`Snapshot ${s.id} for ${s.asset} at ${s.createdAt?.toISOString()} (cycleId: ${s.cycleId})`);
  }

  const economicEvents = await prisma.economicEvent.findMany({
    orderBy: { timestamp: "desc" },
    take: 10
  });
  console.log("\n--- ECONOMIC EVENTS (" + economicEvents.length + ") ---");
  for (const e of economicEvents) {
    console.log(`[${e.timestamp?.toISOString()}] ${e.eventType} - ${e.title} (day: ${e.day})`);
    console.log(`  txHash: ${e.txHash}, cycleId: ${e.cycleId}, tradeId: ${e.tradeId}`);
  }

  const activityLogs = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 10
  });
  console.log("\n--- ACTIVITY LOGS (" + activityLogs.length + ") ---");
  for (const a of activityLogs) {
    console.log(`[${a.timestamp?.toISOString()}] ${a.activityType} (${a.status}) - ${a.title} (cycle: ${a.cycleId}, asset: ${a.asset})`);
    if (a.txHash) console.log(`  txHash: ${a.txHash}`);
    if (a.error) console.log(`  error: ${a.error}`);
  }

  const memories = await prisma.memory.findMany();
  console.log("\n--- MEMORIES (" + memories.length + ") ---");
  for (const m of memories) {
    console.log(JSON.stringify(m, null, 2));
  }

  const reputation = await prisma.reputationMetrics.findFirst();
  console.log("\n--- REPUTATION METRICS ---");
  console.log(JSON.stringify(reputation, null, 2));
}

main().finally(() => prisma.$disconnect());
