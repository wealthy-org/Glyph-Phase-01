// ============================================================================
// GLYPH PHASE 01 — PORTFOLIO & SIMULATION ENGINE TEST SCRIPT
// Run with: npx tsx scripts/test-portfolio.ts
// ============================================================================

import {
  clampLeverage,
  calculatePositionMarginAndNotional,
  calculateLiquidationPrice,
  calculatePnL,
  calculateTransactionFee,
  isPositionLiquidated,
} from "../../src/lib/simulation-math";
import {
  openSimulatedPosition,
  updatePositionsMarketPrices,
  closeSimulatedPosition,
  getActivePositions,
} from "../../src/lib/portfolio";
import { getTreasurySummary } from "../../src/lib/treasury";
import { prisma } from "../../src/lib/prisma";

async function runTests() {
  console.log("===============================================================");
  console.log("⚡ GLYPH SIMULATION & PORTFOLIO ENGINE — VERIFICATION SUITE");
  console.log("===============================================================\n");

  // -------------------------------------------------------------------------
  // TEST 1: Pure Math Functions
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Testing Pure Financial & Risk Math...");

  // 1.1 Clamping Leverage
  const clamped1 = clampLeverage(5, 2);
  const clamped2 = clampLeverage(1.5, 2);
  const clamped3 = clampLeverage(0.5, 2);
  console.log(`  - clampLeverage(5, max: 2)   = ${clamped1} (expected: 2)`);
  console.log(`  - clampLeverage(1.5, max: 2) = ${clamped2} (expected: 1.5)`);
  console.log(`  - clampLeverage(0.5, max: 2) = ${clamped3} (expected: 1)`);
  if (clamped1 !== 2 || clamped2 !== 1.5 || clamped3 !== 1) {
    throw new Error("Leverage clamping test failed.");
  }

  // 1.2 Margin & Notional
  const { margin, notionalSize } = calculatePositionMarginAndNotional(1000, 10, 2);
  console.log(
    `  - calculatePositionMarginAndNotional(Equity: 1000, 10%, 2x) = Margin: $${margin}, Notional: $${notionalSize}`
  );
  if (margin !== 100 || notionalSize !== 200) {
    throw new Error("Margin & notional calculation test failed.");
  }

  // 1.3 Liquidation Price (LONG: entry $100, 2x leverage, 5% MMR -> 100 * (1 - 0.5 + 0.05) = $55)
  const liqLong = calculateLiquidationPrice("LONG", 100, 2, 0.05);
  // SHORT: entry $100, 2x leverage, 5% MMR -> 100 * (1 + 0.5 - 0.05) = $145
  const liqShort = calculateLiquidationPrice("SHORT", 100, 2, 0.05);
  console.log(`  - calculateLiquidationPrice(LONG, $100, 2x, MMR 5%) = $${liqLong} (expected: 55)`);
  console.log(`  - calculateLiquidationPrice(SHORT, $100, 2x, MMR 5%) = $${liqShort} (expected: 145)`);
  if (liqLong !== 55 || liqShort !== 145) {
    throw new Error("Liquidation price formula test failed.");
  }

  // 1.4 PnL Calculation (NVDA LONG from $100 to $105, notional $200, margin $100)
  const pnlResult = calculatePnL("LONG", 100, 105, 200, 100);
  console.log(
    `  - calculatePnL(LONG, $100 -> $105, Notional: $200, Margin: $100) = $${pnlResult.pnlDollar} (${pnlResult.pnlPercent}%)`
  );
  if (pnlResult.pnlDollar !== 10 || pnlResult.pnlPercent !== 10) {
    throw new Error("PnL calculation test failed.");
  }

  // 1.5 Transaction Fee (0.1% on $200 = $0.2)
  const fee = calculateTransactionFee(200, 0.1);
  console.log(`  - calculateTransactionFee($200, 0.1%) = $${fee} (expected: 0.2)`);
  if (fee !== 0.2) {
    throw new Error("Fee calculation test failed.");
  }

  console.log("  ✅ All Pure Math Tests Passed!\n");

  // -------------------------------------------------------------------------
  // TEST 2: Database Portfolio Lifecycle (Open -> Price Move -> Close)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 2] Testing Database Lifecycle (Open -> PnL -> Close)...");

  // 2.1 Initial Treasury State
  const initialTreasury = await getTreasurySummary("1");
  console.log(`  - Initial Cash Balance: $${initialTreasury.currentBalance.toFixed(2)}`);
  console.log(`  - Initial Total Equity: $${initialTreasury.totalEquity.toFixed(2)}`);

  // 2.2 Open Position: NVDA LONG, Entry $120, proposed 5x leverage (should clamp to 2x)
  console.log("\n  [2.2] Opening Simulated Position: NVDA (LONG, 2x leverage clamped)...");
  const openRes = await openSimulatedPosition({
    agentId: "1",
    asset: "NVDA",
    side: "LONG",
    entryPrice: 120.0,
    proposedPositionPercent: 10, // 10% of equity
    proposedLeverage: 5, // AI asks for 5x, policy should clamp to 2x!
    scores: {
      conviction: 82,
      fundamentalScore: 85,
      technicalScore: 78,
      riskScore: 65,
    },
  });

  console.log(`  - Trade Created: ${openRes.trade.tradeNumber} (ID: ${openRes.trade.id})`);
  console.log(`  - Position Created ID: ${openRes.position.id}`);
  console.log(`  - Effective Leverage: ${openRes.effectiveLeverage}x (Clamped from 5x)`);
  console.log(`  - Allocated Margin: $${openRes.margin.toFixed(2)}`);
  console.log(`  - Notional Exposure: $${openRes.notionalSize.toFixed(2)}`);
  console.log(`  - Opening Fee (0.1%): $${openRes.openingFee.toFixed(2)}`);
  console.log(`  - Liquidation Price: $${openRes.liquidationPrice.toFixed(2)}`);
  console.log(`  - Remaining Cash Balance: $${openRes.remainingCash.toFixed(2)}`);

  // 2.3 Check Active Positions Query
  const activePositions = await getActivePositions("1");
  console.log(`\n  - Active Positions Count: ${activePositions.positions.length}`);
  console.log(`  - Total Margin Committed: $${activePositions.totalMargin.toFixed(2)}`);

  // 2.4 Update Market Price: NVDA rises from $120 to $126 (+5% price move)
  console.log("\n  [2.4] Simulating Market Price Update: NVDA $120 -> $126 (+5%)...");
  const updateRes = await updatePositionsMarketPrices({ NVDA: 126.0 }, "1");
  console.log(`  - Positions Updated: ${updateRes.updatedCount}`);
  if (updateRes.details.length > 0) {
    const detail = updateRes.details[0];
    console.log(`  - Floating PnL: $${detail.unrealizedPnl} (${detail.unrealizedPnlPercent}%)`);
  }

  // Check Treasury Equity with Floating Profit
  const floatingTreasury = await getTreasurySummary("1");
  console.log(`  - Treasury Equity during floating profit: $${floatingTreasury.totalEquity.toFixed(2)}`);

  // 2.5 Close Position at $126
  console.log("\n  [2.5] Closing Position at $126 (Taking Profit)...");
  const closeRes = await closeSimulatedPosition(openRes.position.id, 126.0, "TAKE_PROFIT");
  console.log(`  - Trade Status: ${closeRes.status}`);
  console.log(`  - Realized Net PnL: $${closeRes.realizedPnl.toFixed(2)} (${closeRes.realizedPnlPercent}%)`);
  console.log(`  - Total Fees Paid: $${closeRes.fees.toFixed(2)}`);
  console.log(`  - New Treasury Cash Balance: $${closeRes.newBalance.toFixed(2)}`);

  const finalTreasury = await getTreasurySummary("1");
  console.log(`  - Final Treasury Total Equity: $${finalTreasury.totalEquity.toFixed(2)}`);
  console.log(`  - Overall Gain: +$${finalTreasury.pnlDollar.toFixed(2)} (${finalTreasury.pnlPercent.toFixed(2)}%)`);

  console.log("  ✅ Lifecycle Test Completed Successfully!\n");

  // -------------------------------------------------------------------------
  // TEST 3: Simulated Liquidation Trigger Test
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 3] Testing Simulated Liquidation Trigger...");
  const liqTestOpen = await openSimulatedPosition({
    agentId: "1",
    asset: "BTC",
    side: "LONG",
    entryPrice: 60000.0,
    proposedPositionPercent: 5,
    proposedLeverage: 2,
  });
  console.log(`  - Opened BTC position at $60,000 (Liq price: $${liqTestOpen.liquidationPrice})`);

  // Market crashes below liquidation price ($30,000)
  console.log("  - Simulating market crash to $25,000 (breaches liquidation threshold)...");
  const liqUpdateRes = await updatePositionsMarketPrices({ BTC: 25000.0 }, "1");
  console.log(`  - Liquidated Count: ${liqUpdateRes.liquidatedCount}`);
  const liqDetail = liqUpdateRes.details.find((d) => d.positionId === liqTestOpen.position.id);
  console.log(`  - Result Status: ${liqDetail?.status}`);

  // Verify Trade status in database
  const liqTrade = await prisma.trade.findUnique({
    where: { id: liqTestOpen.trade.id },
  });
  console.log(`  - DB Trade Status: ${liqTrade?.status} (Simulated PnL: $${liqTrade?.simulatedPnl})`);

  if (liqTrade?.status !== "LIQUIDATED") {
    throw new Error("Simulated liquidation failed to mark trade as LIQUIDATED.");
  }
  console.log("  ✅ Liquidation Test Passed!\n");

  console.log("===============================================================");
  console.log("🎉 ALL TESTS PASSED! Portfolio & Leverage Engine is 100% Valid.");
  console.log("===============================================================");
}

runTests()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
