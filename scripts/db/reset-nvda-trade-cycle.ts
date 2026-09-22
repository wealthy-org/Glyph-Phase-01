// ============================================================================
// GLYPH PHASE 01 — SAFELY RESET NVDA TRADE CYCLE WITHOUT DELETING RESEARCH
// Target Cycle: cycle_20260922135823_NVDA
// Target Trade: GLYPH-0001
// Target Decision: 04cb8434-bed0-413c-a1f0-ad742903d01a
// ============================================================================

import { prisma } from "../../src/lib/prisma";

async function runReset() {
  const targetCycleId = "cycle_20260922135823_NVDA";
  const targetTradeNumber = "GLYPH-0001";
  const targetDecisionId = "04cb8434-bed0-413c-a1f0-ad742903d01a";
  const targetTxHash = "0x40191a87bf8f6c04488d997ac651bbb85b883c84165ec5a06f639195780d9978";

  console.log("===============================================================");
  console.log("🔍 STEP 1: PRE-RESET AUDIT & DEPENDENCY INSPECTION");
  console.log("===============================================================\n");

  // 1. Fetch Target Trade
  const trade = await prisma.trade.findUnique({
    where: { tradeNumber: targetTradeNumber },
    include: { position: true, decision: true },
  });

  if (!trade) {
    throw new Error(`Target trade ${targetTradeNumber} not found in database!`);
  }

  // 2. Fetch Target Position
  const position = await prisma.position.findUnique({
    where: { tradeId: trade.id },
  });

  // 3. Fetch Target Decision
  const decision = await prisma.decision.findUnique({
    where: { id: targetDecisionId },
  });

  if (!decision) {
    throw new Error(`Target decision ${targetDecisionId} not found in database!`);
  }

  // 4. Fetch Trade-related Economic Events
  const tradeEvents = await prisma.economicEvent.findMany({
    where: {
      cycleId: targetCycleId,
      eventType: { in: ["DECISION_MADE", "TRADE_OPENED"] },
    },
  });

  // 5. Fetch Research Economic Events (MUST PRESERVE)
  const researchEvents = await prisma.economicEvent.findMany({
    where: {
      eventType: "RESEARCH_STARTED",
    },
  });

  // 6. Fetch Genesis Economic Events (MUST PRESERVE)
  const genesisEvents = await prisma.economicEvent.findMany({
    where: {
      eventType: {
        in: [
          "AGENT_BORN",
          "IDENTITY_REGISTERED",
          "WALLET_CREATED",
          "WALLET_ROTATED",
          "TREASURY_FUNDED",
        ],
      },
    },
  });

  // 7. Snapshots count (CRITICAL SAFETY)
  const snapshotsBefore = await prisma.researchSnapshot.count();
  const targetSnapshot = await prisma.researchSnapshot.findFirst({
    where: { cycleId: targetCycleId, asset: "NVDA" },
  });

  if (!targetSnapshot) {
    throw new Error(`Target research snapshot for ${targetCycleId} not found!`);
  }

  // 8. Agent Runs
  const targetAgentRun = await prisma.agentRun.findFirst({
    where: { cycleKey: targetCycleId },
  });

  // 9. Transaction
  const targetTransaction = await prisma.transaction.findUnique({
    where: { transactionHash: targetTxHash },
  });

  // 10. Treasury
  const treasuryBefore = await prisma.agentTreasury.findFirst();
  if (!treasuryBefore) {
    throw new Error("Agent treasury not found!");
  }

  const tradeEventIds = tradeEvents.map((e) => e.id);

  console.log("=== RESET AUDIT ===");
  console.log("\nTARGET CYCLE:\n" + targetCycleId);
  console.log("\nWILL DELETE:");
  console.log(`- Trade: ${trade.tradeNumber} (ID: ${trade.id}, Asset: ${trade.asset}, Side: ${trade.action})`);
  console.log(`- Position: ${position ? `${position.id} (Asset: ${position.asset}, Side: ${position.side}, isOpen: ${position.isOpen})` : "None"}`);
  console.log(`- Decision: ${decision.id} (Action: ${decision.action}, Conviction: ${decision.conviction}%)`);
  console.log(`- EconomicEvent: ${tradeEvents.length} record(s):`);
  tradeEvents.forEach((e) => console.log(`    ↳ [${e.eventType}] ${e.id} — "${e.title}"`));
  console.log(`- AgentRun: ${targetAgentRun ? `${targetAgentRun.id} (CycleKey: ${targetAgentRun.cycleKey}, Policy: ${targetAgentRun.policyResult})` : "None"}`);
  console.log(`- Transaction: ${targetTransaction ? `${targetTransaction.transactionHash} (${targetTransaction.eventType})` : "None"}`);
  console.log(`- Trade Activity Logs: DECISION, RISK_POLICY, TRADE, ONCHAIN_PROOF, ECONOMIC_PRECHECK for cycle`);

  console.log("\nWILL PRESERVE:");
  console.log(`- ResearchSnapshot: ${snapshotsBefore} snapshots total (including NVDA snapshot ${targetSnapshot.id})`);
  console.log(`- Research events: ${researchEvents.length} event(s) (including cycle NVDA analysis event)`);
  console.log(`- Analysis: Full fundamental/technical/risk snapshot data retained`);
  console.log(`- Genesis events: ${genesisEvents.length} event(s) (AGENT_BORN, IDENTITY_REGISTERED, WALLET_CREATED, WALLET_ROTATED, TREASURY_FUNDED)`);
  console.log(`- Wallet/Identity: Safe Smart Account, Agent Identity, and Policy unchanged`);

  console.log("\nTREASURY:");
  console.log(`Before: $${Number(treasuryBefore.currentBalance).toFixed(2)} ${treasuryBefore.currency}`);
  console.log(`After: $0.00 USD-SIM (unfunded)`);
  console.log("===============================================================\n");

  console.log("⏳ STEP 2: EXECUTING SAFE TRANSACTION RESET...");

  await prisma.$transaction(async (tx) => {
    // 1. Delete Position for trade
    if (position) {
      await tx.position.delete({
        where: { id: position.id },
      });
    }

    // 2. Unlink tradeId & researchSnapshotId on Decision before deletion
    await tx.decision.update({
      where: { id: decision.id },
      data: { tradeId: null, researchSnapshotId: null },
    });

    // 3. Delete Trade
    await tx.trade.delete({
      where: { id: trade.id },
    });

    // 4. Delete Decision
    await tx.decision.delete({
      where: { id: decision.id },
    });

    // 5. Delete Trade Economic Events (Keep RESEARCH_STARTED intact!)
    if (tradeEventIds.length > 0) {
      await tx.economicEvent.deleteMany({
        where: { id: { in: tradeEventIds } },
      });
    }

    // 6. Delete Trade Activity Logs (Keep ANALYSIS activity log intact!)
    await tx.activityLog.deleteMany({
      where: {
        cycleId: targetCycleId,
        activityType: { in: ["DECISION", "RISK_POLICY", "TRADE", "ONCHAIN_PROOF", "ECONOMIC_PRECHECK"] },
      },
    });

    // 7. Delete AgentRun for target cycle
    if (targetAgentRun) {
      await tx.agentRun.delete({
        where: { id: targetAgentRun.id },
      });
    }

    // 8. Delete Transaction
    if (targetTransaction) {
      await tx.transaction.delete({
        where: { id: targetTransaction.id },
      });
    }

    // 9. Reset AgentTreasury to completely unfunded state ($0.00 USD-SIM)
    await tx.agentTreasury.update({
      where: { id: treasuryBefore.id },
      data: {
        currentBalance: "0",
        initialCapital: "0",
        currency: "USD-SIM",
      },
    });

    // 10. Remove any TREASURY_FUNDED events
    await tx.economicEvent.deleteMany({
      where: { eventType: "TREASURY_FUNDED" },
    });
  });

  console.log("✅ Transaction completed successfully.\n");

  console.log("===============================================================");
  console.log("🔍 STEP 3: POST-RESET VERIFICATION");
  console.log("===============================================================\n");

  // Post-verification checks
  const [
    postTrade,
    postPosition,
    postDecision,
    postTradeEvents,
    postResearchEvents,
    snapshotsAfter,
    postTargetSnapshot,
    postTreasury,
    postGenesisEvents,
  ] = await Promise.all([
    prisma.trade.findUnique({ where: { tradeNumber: targetTradeNumber } }),
    prisma.position.findFirst({ where: { tradeId: trade.id } }),
    prisma.decision.findUnique({ where: { id: targetDecisionId } }),
    prisma.economicEvent.findMany({
      where: {
        cycleId: targetCycleId,
        eventType: { in: ["DECISION_MADE", "TRADE_OPENED"] },
      },
    }),
    prisma.economicEvent.findMany({ where: { eventType: "RESEARCH_STARTED" } }),
    prisma.researchSnapshot.count(),
    prisma.researchSnapshot.findFirst({ where: { cycleId: targetCycleId, asset: "NVDA" } }),
    prisma.agentTreasury.findFirst(),
    prisma.economicEvent.findMany({
      where: {
        eventType: {
          in: [
            "AGENT_BORN",
            "IDENTITY_REGISTERED",
            "WALLET_CREATED",
            "WALLET_ROTATED",
            "TREASURY_FUNDED",
          ],
        },
      },
    }),
  ]);

  if (snapshotsBefore !== snapshotsAfter) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ResearchSnapshot count changed! Before: ${snapshotsBefore}, After: ${snapshotsAfter}`);
  }

  if (!postTargetSnapshot) {
    throw new Error("CRITICAL INTEGRITY FAILURE: NVDA ResearchSnapshot was deleted!");
  }

  const tradeDeleted = postTrade === null;
  const positionDeleted = postPosition === null;
  const decisionDeleted = postDecision === null;
  const tradeEventsDeletedCount = tradeEvents.length - postTradeEvents.length;
  const analysisPreserved = postTargetSnapshot !== null && postTargetSnapshot.fundamentalData !== null;
  const genesisPreserved = postGenesisEvents.length === genesisEvents.length;

  console.log("=== RESET COMPLETE ===\n");
  console.log(`Trade deleted: ${tradeDeleted ? "YES" : "NO"}`);
  console.log(`Position deleted: ${positionDeleted ? "YES" : "NO"}`);
  console.log(`Decision deleted: ${decisionDeleted ? "YES" : "NO"}`);
  console.log();
  console.log(`Trade-related events deleted: ${tradeEventsDeletedCount}`);
  console.log(`Research events preserved: ${postResearchEvents.length}`);
  console.log();
  console.log("ResearchSnapshot:");
  console.log(`Before: ${snapshotsBefore}`);
  console.log(`After: ${snapshotsAfter}`);
  console.log();
  console.log(`Analysis preserved: ${analysisPreserved ? "YES" : "NO"}`);
  console.log();
  console.log("Treasury:");
  console.log(`Before: $${Number(treasuryBefore.currentBalance).toFixed(2)} ${treasuryBefore.currency}`);
  console.log(`After: $${Number(postTreasury?.currentBalance).toFixed(2)} ${postTreasury?.currency}`);
  console.log();
  console.log(`Genesis preserved: ${genesisPreserved ? "YES" : "NO"}`);
  console.log("===============================================================");
}

runReset()
  .catch((err) => {
    console.error("❌ Reset script encountered an error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
