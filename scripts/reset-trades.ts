// ============================================================================
// GLYPH PHASE 01 — RESET TRADES & DECISION DATA SCRIPT
// Run with: npx tsx scripts/reset-trades.ts
// ============================================================================

import { prisma } from "../src/lib/prisma";

async function resetTradesAndDecisions() {
  console.log("===============================================================");
  console.log("🧹 RESETTING GLYPH TRADE, DECISION, AND RUN HISTORY TO ZERO");
  console.log("===============================================================\n");

  console.log("1. Removing Positions...");
  const delPositions = await prisma.position.deleteMany({});
  console.log(`   ↳ Deleted ${delPositions.count} position(s).`);

  console.log("2. Removing Memories...");
  const delMemories = await prisma.memory.deleteMany({});
  console.log(`   ↳ Deleted ${delMemories.count} memory(ies).`);

  console.log("3. Removing Trades...");
  const delTrades = await prisma.trade.deleteMany({});
  console.log(`   ↳ Deleted ${delTrades.count} trade(s).`);

  console.log("4. Removing Decisions...");
  const delDecisions = await prisma.decision.deleteMany({});
  console.log(`   ↳ Deleted ${delDecisions.count} decision(s).`);

  console.log("5. Removing Observability Agent Runs...");
  const delRuns = await prisma.agentRun.deleteMany({});
  console.log(`   ↳ Deleted ${delRuns.count} agent run(s).`);

  console.log("6. Removing Decision Commitment Transactions...");
  const delTxs = await prisma.transaction.deleteMany({
    where: { eventType: "DECISION_COMMITTED" },
  });
  console.log(`   ↳ Deleted ${delTxs.count} transaction record(s).`);

  console.log("7. Removing Trade-related Economic Events (Keeping Genesis)...");
  const delEvents = await prisma.economicEvent.deleteMany({
    where: {
      eventType: {
        in: [
          "DECISION_MADE",
          "TRADE_OPENED",
          "TRADE_CLOSED",
          "PROFIT_RECORDED",
          "LOSS_RECORDED",
          "MEMORY_CREATED",
        ],
      },
    },
  });
  console.log(`   ↳ Deleted ${delEvents.count} economic event(s).`);

  console.log("8. Resetting Treasury Balance to $1000.00 USD-SIM...");
  const agentId = process.env.GLYPH_AGENT_ID || "1";
  const agent = await prisma.agent.findFirst({
    where: { agentId },
    include: { treasury: true },
  });

  if (agent && agent.treasury) {
    await prisma.agentTreasury.update({
      where: { id: agent.treasury.id },
      data: { currentBalance: "1000" },
    });
    console.log("   ↳ Treasury reset to $1,000.00 USD-SIM successfully.");
  }

  console.log("\n===============================================================");
  console.log("✨ DATABASE CLEANUP COMPLETE: READY FOR FRESH PURE ONCHAIN RUN!");
  console.log("===============================================================\n");

  // Summary counts
  const [tCount, dCount, pCount, mCount, rCount, eCount, treas] = await Promise.all([
    prisma.trade.count(),
    prisma.decision.count(),
    prisma.position.count(),
    prisma.memory.count(),
    prisma.agentRun.count(),
    prisma.economicEvent.count(),
    prisma.agentTreasury.findFirst(),
  ]);

  console.log("=== CURRENT DATABASE COUNTS ===");
  console.log(`- Trades:           ${tCount}`);
  console.log(`- Decisions:        ${dCount}`);
  console.log(`- Positions:        ${pCount}`);
  console.log(`- Memories:         ${mCount}`);
  console.log(`- Agent Runs:       ${rCount}`);
  console.log(`- Genesis Events:   ${eCount}`);
  console.log(`- Treasury Balance: $${treas?.currentBalance} USD-SIM`);
  console.log("===============================\n");
}

resetTradesAndDecisions()
  .catch((err) => {
    console.error("❌ Reset failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
