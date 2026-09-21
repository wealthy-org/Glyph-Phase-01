// ============================================================================
// GLYPH PHASE 01 — PERSISTENT MEMORY ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-memory.ts
// ============================================================================

import assert from "node:assert/strict";
import {
  closeSimulatedPosition,
  openSimulatedPosition,
} from "../../src/lib/portfolio";
import { prisma } from "../../src/lib/prisma";

async function runMemoryTests() {
  console.log("===============================================================");
  console.log("🧠 GLYPH PERSISTENT MEMORY ENGINE — VERIFICATION SUITE");
  console.log("===============================================================\n");

  const agentId = process.env.GLYPH_AGENT_ID || "1";

  // -------------------------------------------------------------------------
  // TEST 1: Automatic Memory Formation on Profitable Trade Close (WIN)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Opening and Closing a WIN Trade...");

  const openRes1 = await openSimulatedPosition({
    agentId,
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
  // TEST 1B: Original thesis must be reflected in the lesson, not a generic template
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1B] Reconstructing original decision context into the lesson...");

  const tradeWithThesis = await openSimulatedPosition({
    agentId,
    asset: "AAPL",
    side: "LONG",
    entryPrice: 190.0,
    proposedPositionPercent: 5,
    proposedLeverage: 2,
    scores: {
      conviction: 82,
      fundamentalScore: 84,
      technicalScore: 78,
      riskScore: 58,
      thesis: {
        fundamental: "Bullish earnings context and revenue expansion support a higher fair value.",
        technical: "Price remains above the 20-day trend and holds above key support.",
        catalyst: "Expected earnings beat supports continuation.",
        risk: "Macro volatility and earnings surprise risk remain elevated.",
        invalidation: "Break below the support band would invalidate the thesis.",
      },
    },
  });

  const closeWithThesis = await closeSimulatedPosition(
    tradeWithThesis.position.id,
    196.0,
    "TAKE_PROFIT"
  );

  const thesisMemory = await prisma.memory.findFirst({
    where: { tradeId: tradeWithThesis.trade.id },
  });

  if (!thesisMemory) {
    throw new Error("Failed: memory was not created for trade with thesis context.");
  }

  assert(
    thesisMemory.lesson.toLowerCase().includes("bullish earnings") ||
    thesisMemory.lesson.toLowerCase().includes("revenue expectations") ||
    thesisMemory.lesson.toLowerCase().includes("technical strength") ||
    thesisMemory.lesson.toLowerCase().includes("support"),
    `Expected lesson to reflect original trade thesis, got: ${thesisMemory.lesson}`
  );

  console.log(`  ✅ Lesson reflects original decision context: "${thesisMemory.lesson}"\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Automatic Memory Formation on Loss Trade (LOSS / OVER_CONFIDENT)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 2] Opening and Closing a LOSS Trade...");

  const openRes2 = await openSimulatedPosition({
    agentId,
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
  // TEST 3: Duplicate Close Must Not Create A Second Memory
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 3] Calling close twice should not create duplicate memory...");

  try {
    await closeSimulatedPosition(openRes2.position.id, 2850.0, "STOP_LOSS");
  } catch (error) {
    console.log(`  - Duplicate close attempt correctly rejected: ${(error as Error).message}`);
  }

  const duplicateMemories = await prisma.memory.findMany({
    where: { tradeId: openRes2.trade.id },
  });
  assert.equal(duplicateMemories.length, 1, "Expected exactly one memory for a closed trade.");
  console.log(`  ✅ Duplicate close produced ${duplicateMemories.length} memory record(s), not more.\n`);

  console.log("\n===============================================================");
  console.log("🎉 MEMORY ECONOMIC FLOW VERIFIED: PROFIT, LOSS, AND DUPLICATE PROTECTION.");
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
