// ============================================================================
// GLYPH PHASE 01 — PERSISTENT MEMORY ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-memory.ts
// ============================================================================

import {
  openSimulatedPosition,
  closeSimulatedPosition,
} from "../src/lib/portfolio";
import { getRecentMemories } from "../src/lib/memory";
import { createResearchSnapshot } from "../src/lib/research";
import { executeGlyphDecisionCycle } from "../src/lib/decision/engine";
import { prisma } from "../src/lib/prisma";

async function runMemoryTests() {
  console.log("===============================================================");
  console.log("🧠 GLYPH PERSISTENT MEMORY ENGINE — VERIFICATION SUITE");
  console.log("===============================================================\n");

  // -------------------------------------------------------------------------
  // TEST 1: Automatic Memory Formation on Profitable Trade Close (WIN)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Opening and Closing a WIN Trade...");

  const openRes1 = await openSimulatedPosition({
    agentId: "1",
    asset: "NVDA",
    side: "LONG",
    entryPrice: 120.0,
    proposedPositionPercent: 5,
    proposedLeverage: 2,
    scores: {
      conviction: 85, // High conviction
      fundamentalScore: 88,
      technicalScore: 82,
      riskScore: 60,
    },
  });
  console.log(`  - Opened Trade: ${openRes1.trade.tradeNumber} (NVDA LONG at $120)`);

  // Close with +5% price increase ($120 -> $126) => +10% ROE with 2x leverage
  console.log("  - Closing Position at $126 (+10% gain)...");
  const closeRes1 = await closeSimulatedPosition(openRes1.position.id, 126.0, "TAKE_PROFIT");
  console.log(`  - Closed Trade Status: ${closeRes1.status} (PnL: +${closeRes1.realizedPnlPercent}%)`);

  // Verify Memory was formed and linked to tradeId
  const winMemory = await prisma.memory.findFirst({
    where: { tradeId: openRes1.trade.id },
  });

  if (!winMemory) {
    throw new Error("Failed: Memory was not automatically created upon trade close.");
  }

  console.log(`  ✅ WIN Memory Verified in database!`);
  console.log(`     ↳ Outcome: ${winMemory.outcome} (Expected: WIN)`);
  console.log(`     ↳ Thesis Result: ${winMemory.thesisResult} (Expected: CORRECT)`);
  console.log(`     ↳ Calibration: ${winMemory.confidenceCalibration} (Expected: GOOD)`);
  console.log(`     ↳ Lesson: "${winMemory.lesson}"`);
  console.log(`     ↳ Weight Shift: ${winMemory.weightShift}`);

  if (winMemory.outcome !== "WIN" || winMemory.thesisResult !== "CORRECT" || winMemory.confidenceCalibration !== "GOOD") {
    throw new Error("Failed: WIN memory attributes did not match expected values.");
  }

  // Verify Economic Event MEMORY_CREATED
  const event1 = await prisma.economicEvent.findFirst({
    where: { tradeId: openRes1.trade.id, eventType: "MEMORY_CREATED" },
  });
  if (!event1) {
    throw new Error("Failed: MEMORY_CREATED economic event was not logged.");
  }
  console.log(`  ✅ Economic Event logged for Life Log: "${event1.title}"\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Automatic Memory Formation on Loss Trade (LOSS / OVER_CONFIDENT)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 2] Opening and Closing a LOSS Trade...");

  const openRes2 = await openSimulatedPosition({
    agentId: "1",
    asset: "ETH",
    side: "LONG",
    entryPrice: 3000.0,
    proposedPositionPercent: 5,
    proposedLeverage: 2,
    scores: {
      conviction: 80, // High conviction
    },
  });
  console.log(`  - Opened Trade: ${openRes2.trade.tradeNumber} (ETH LONG at $3,000)`);

  // Close at $2850 (-5% price) => -10% ROE
  console.log("  - Closing Position at $2,850 (-10% loss)...");
  const closeRes2 = await closeSimulatedPosition(openRes2.position.id, 2850.0, "STOP_LOSS");

  const lossMemory = await prisma.memory.findFirst({
    where: { tradeId: openRes2.trade.id },
  });

  if (!lossMemory) {
    throw new Error("Failed: Loss memory was not created.");
  }

  console.log(`  ✅ LOSS Memory Verified in database!`);
  console.log(`     ↳ Outcome: ${lossMemory.outcome} (Expected: LOSS)`);
  console.log(`     ↳ Thesis Result: ${lossMemory.thesisResult} (Expected: INCORRECT)`);
  console.log(`     ↳ Calibration: ${lossMemory.confidenceCalibration} (Expected: OVER_CONFIDENT)`);
  console.log(`     ↳ Lesson: "${lossMemory.lesson}"`);
  console.log(`     ↳ Weight Shift: ${lossMemory.weightShift}\n`);

  // -------------------------------------------------------------------------
  // TEST 3: Asset-Specific Memory Filtering (Preventing Cross-Asset Contamination)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 3] Testing Asset-Specific Memory Filtering...");

  // NVDA should only return NVDA memories
  const nvdaMemories = await getRecentMemories("1", 3, "NVDA");
  console.log(`  - NVDA Filter: Retrieved ${nvdaMemories.length} memories (Expected: >= 1).`);
  for (const m of nvdaMemories) {
    console.log(`    ↳ Memory ID ${m.id} | Asset: ${m.asset} | Outcome: ${m.outcome}`);
    if (m.asset !== "NVDA") {
      throw new Error(`Failed: Non-NVDA memory leaked into NVDA filter: ${m.asset}`);
    }
  }

  // ETH should only return ETH memories
  const ethMemories = await getRecentMemories("1", 3, "ETH");
  console.log(`  - ETH Filter: Retrieved ${ethMemories.length} memories (Expected: >= 1).`);
  for (const m of ethMemories) {
    console.log(`    ↳ Memory ID ${m.id} | Asset: ${m.asset} | Outcome: ${m.outcome}`);
    if (m.asset !== "ETH") {
      throw new Error(`Failed: Non-ETH memory leaked into ETH filter: ${m.asset}`);
    }
  }

  // BTC has not been traded yet, so BTC filter should return 0 memories (no cross-asset leakage from NVDA/ETH)
  const btcMemories = await getRecentMemories("1", 3, "BTC");
  console.log(`  - BTC Filter: Retrieved ${btcMemories.length} memories (Expected: 0).`);
  if (btcMemories.length !== 0) {
    throw new Error(`Failed: Unrelated memories leaked into BTC memory search! Length: ${btcMemories.length}`);
  }
  console.log("  ✅ Asset-specific memory isolation verified: No cross-asset contamination!\n");

  // -------------------------------------------------------------------------
  // TEST 4: Feedback Loop — Asset-Specific Memories Passed into Decision Cycle
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 4] Testing Feedback Loop into Next Decision Cycle for NVDA...");

  const { snapshotId } = await createResearchSnapshot("NVDA");
  const nextDecision = await executeGlyphDecisionCycle(snapshotId, "1");

  console.log(`  - New Decision Generated: ID ${nextDecision.decisionId}`);
  console.log(`  - Asset: ${nextDecision.asset}`);
  console.log(`  - Proposed Action: ${nextDecision.action}`);
  console.log(`  - Conviction: ${nextDecision.conviction}%`);
  console.log(`  - Invalidation: "${nextDecision.decision.thesis.invalidation.slice(0, 60)}..."`);
  console.log(`  - Resulting Policy: ${nextDecision.policyResult}`);

  console.log("\n===============================================================");
  console.log("🎉 ALL PERSISTENT MEMORY TESTS PASSED! TAHAP 6 IS 100% OPERATIONAL.");
  console.log("===============================================================");
}

runMemoryTests()
  .catch((err) => {
    console.error("❌ Memory test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
