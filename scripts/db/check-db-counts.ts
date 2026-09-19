import { prisma } from "../../src/lib/prisma";

async function main() {
  const [
    trades,
    decisions,
    positions,
    memories,
    snapshots,
    runs,
    events,
    transactions,
    treasury,
  ] = await Promise.all([
    prisma.trade.count(),
    prisma.decision.count(),
    prisma.position.count(),
    prisma.memory.count(),
    prisma.researchSnapshot.count(),
    prisma.agentRun.count(),
    prisma.economicEvent.count(),
    prisma.transaction.count(),
    prisma.agentTreasury.findFirst(),
  ]);

  console.log("=== CURRENT DATABASE COUNTS ===");
  console.log("Trades:             ", trades);
  console.log("Decisions:          ", decisions);
  console.log("Positions:          ", positions);
  console.log("Memories:           ", memories);
  console.log("Research Snapshots: ", snapshots);
  console.log("Agent Runs:         ", runs);
  console.log("Economic Events:    ", events);
  console.log("Transactions:       ", transactions);
  console.log("Treasury Balance:   ", treasury ? `$${Number(treasury.currentBalance).toFixed(2)} ${treasury.currency}` : "None");
  console.log("===============================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
