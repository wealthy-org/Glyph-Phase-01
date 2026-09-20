// ============================================================================
// GLYPH PHASE 01 — ACCOUNTING & TREASURY REGRESSION TEST SUITE
// Verifies all 10 accounting invariants:
// 1. Initial State ($1,000 cash, 0 positions) -> Equity $1000, PnL $0
// 2. Open LONG $70 margin at flat price -> Equity $999.86, PnL -$0.14, NEVER $1070
// 3. LONG price rises (+5%) -> Positive PnL
// 4. LONG price falls (-5%) -> Negative PnL
// 5. SHORT price falls (-5%) -> Positive PnL
// 6. SHORT price rises (+5%) -> Negative PnL
// 7. Margin != PnL (Collateral != Profit)
// 8. Leverage != Automatic Profit
// 9. Fee consistently accounted ($0.14 deducted)
// 10. Frontend Navbar format matches backend canonical data 1:1
// ============================================================================

import { prisma } from "../../src/lib/prisma";
import { getTreasurySummary } from "../../src/lib/treasury";
import { getHeaderMetrics } from "../../src/lib/header-stats";
import { calculatePnL } from "../../src/lib/simulation-math";

async function runAccountingRegression() {
  console.log("===============================================================");
  console.log("🧪 GLYPH PHASE 01 — ACCOUNTING & TREASURY REGRESSION SUITE");
  console.log("===============================================================\n");

  const agent = await prisma.agent.findFirst({
    where: { agentId: "5" },
    include: { treasury: true },
  }) || await prisma.agent.findFirst({
    include: { treasury: true },
  });

  if (!agent) {
    throw new Error("No agent found in database.");
  }

  // Snapshot original state for teardown
  const origBalance = agent.treasury ? Number(agent.treasury.currentBalance) : 1000;
  const origInitial = agent.treasury ? Number(agent.treasury.initialCapital) : 1000;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Initial State ($1000 capital, 0 positions)
    // -------------------------------------------------------------------------
    console.log("▶ [TEST 1] Verifying Initial State ($1,000.00, 0 positions)...");
    // Clean up any test positions
    await prisma.position.deleteMany({ where: { agentId: agent.id } });
    await prisma.agentTreasury.upsert({
      where: { agentId: agent.id },
      update: { currentBalance: 1000, initialCapital: 1000 },
      create: { agentId: agent.id, currentBalance: 1000, initialCapital: 1000, currency: "USD-SIM" },
    });

    const initTreasury = await getTreasurySummary(agent.agentId);
    const initHeader = await getHeaderMetrics(agent.agentId);

    if (initTreasury.totalEquity !== 1000) {
      throw new Error(`TEST 1 Failed: Expected totalEquity=1000, got ${initTreasury.totalEquity}`);
    }
    if (initTreasury.pnlDollar !== 0 || initTreasury.pnlPercent !== 0) {
      throw new Error(`TEST 1 Failed: Expected pnl=0, got $${initTreasury.pnlDollar}`);
    }
    if (initHeader.treasuryEquity !== 1000) {
      throw new Error(`TEST 1 Failed: Header treasuryEquity=${initHeader.treasuryEquity}, expected 1000`);
    }
    console.log(`  ✅ [PASS] Initial Equity: $${initTreasury.totalEquity.toFixed(2)}, PnL: $${initTreasury.pnlDollar.toFixed(2)} (0.00%)`);

    // -------------------------------------------------------------------------
    // TEST 2: Open LONG with $70 Margin at Flat Price ($222.27)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 2] Verifying Open LONG with $70 Margin at Flat Price...");
    // Simulate trade creation:
    // Cash decremented by margin ($70) + fee ($0.14) = $70.14 -> Cash = $929.86
    await prisma.agentTreasury.update({
      where: { agentId: agent.id },
      data: { currentBalance: 929.86, initialCapital: 1000 },
    });
    const testTrade = await prisma.trade.create({
      data: {
        tradeNumber: "TEST-0001",
        agent: { connect: { id: agent.id } },
        asset: "NVDA",
        action: "LONG",
        entryPrice: 222.27,
        positionSize: 70,
        leverage: 2,
        fees: 0.14,
        status: "OPEN",
      },
    });
    const testPos = await prisma.position.create({
      data: {
        agent: { connect: { id: agent.id } },
        trade: { connect: { id: testTrade.id } },
        asset: "NVDA",
        side: "LONG",
        entryPrice: 222.27,
        currentPrice: 222.27,
        positionSize: 70,
        leverage: 2,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        isOpen: true,
      },
    });

    const flatTreasury = await getTreasurySummary(agent.agentId);
    const flatHeader = await getHeaderMetrics(agent.agentId);

    // CRITICAL ASSERTION: Equity must NOT be $1,070!
    if (flatTreasury.totalEquity === 1070) {
      throw new Error(`CRITICAL BUG: totalEquity is $1,070! Margin was double-counted!`);
    }
    if (flatTreasury.totalEquity !== 999.86) {
      throw new Error(`TEST 2 Failed: Expected totalEquity=999.86, got ${flatTreasury.totalEquity}`);
    }
    if (flatTreasury.pnlDollar !== -0.14) {
      throw new Error(`TEST 2 Failed: Expected pnlDollar=-0.14 (fee), got ${flatTreasury.pnlDollar}`);
    }
    if (Math.abs(flatTreasury.pnlPercent - -0.014) > 0.001) {
      throw new Error(`TEST 2 Failed: Expected pnlPercent=-0.014%, got ${flatTreasury.pnlPercent}`);
    }
    if (flatHeader.treasuryEquity !== 999.86) {
      throw new Error(`TEST 2 Failed: Header treasuryEquity=${flatHeader.treasuryEquity}, expected 999.86`);
    }
    if (flatHeader.pnlDollar !== -0.14) {
      throw new Error(`TEST 2 Failed: Header pnlDollar=${flatHeader.pnlDollar}, expected -0.14`);
    }
    console.log(`  ✅ [PASS] Cash: $${flatTreasury.currentBalance.toFixed(2)}, Margin: $${flatTreasury.allocatedMargin.toFixed(2)}`);
    console.log(`  ✅ [PASS] Total Equity: $${flatTreasury.totalEquity.toFixed(2)} (NEVER $1,070)`);
    console.log(`  ✅ [PASS] Portfolio PnL: -$${Math.abs(flatTreasury.pnlDollar).toFixed(2)} (${flatTreasury.pnlPercent.toFixed(3)}%)`);
    console.log(`  ✅ [PASS] Position Unrealized PnL: $${flatTreasury.unrealizedPnl.toFixed(2)}`);

    // -------------------------------------------------------------------------
    // TEST 3: LONG Price Increases (+5%)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 3] Verifying LONG Price Increase (+5%)...");
    const pnlLongUp = calculatePnL("LONG", 222.27, 233.3835, 140, 70);
    if (pnlLongUp.pnlDollar <= 0 || pnlLongUp.pnlPercent <= 0) {
      throw new Error(`TEST 3 Failed: Expected positive PnL for LONG price increase`);
    }
    console.log(`  ✅ [PASS] LONG +5% Move -> Position PnL: +$${pnlLongUp.pnlDollar.toFixed(2)} (+${pnlLongUp.pnlPercent.toFixed(1)}% ROE)`);

    // -------------------------------------------------------------------------
    // TEST 4: LONG Price Decreases (-5%)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 4] Verifying LONG Price Decrease (-5%)...");
    const pnlLongDown = calculatePnL("LONG", 222.27, 211.1565, 140, 70);
    if (pnlLongDown.pnlDollar >= 0 || pnlLongDown.pnlPercent >= 0) {
      throw new Error(`TEST 4 Failed: Expected negative PnL for LONG price decrease`);
    }
    console.log(`  ✅ [PASS] LONG -5% Move -> Position PnL: -$${Math.abs(pnlLongDown.pnlDollar).toFixed(2)} (${pnlLongDown.pnlPercent.toFixed(1)}% ROE)`);

    // -------------------------------------------------------------------------
    // TEST 5: SHORT Price Decreases (-5%)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 5] Verifying SHORT Price Decrease (-5%)...");
    const pnlShortDown = calculatePnL("SHORT", 222.27, 211.1565, 140, 70);
    if (pnlShortDown.pnlDollar <= 0 || pnlShortDown.pnlPercent <= 0) {
      throw new Error(`TEST 5 Failed: Expected positive PnL for SHORT price decrease`);
    }
    console.log(`  ✅ [PASS] SHORT -5% Move -> Position PnL: +$${pnlShortDown.pnlDollar.toFixed(2)} (+${pnlShortDown.pnlPercent.toFixed(1)}% ROE)`);

    // -------------------------------------------------------------------------
    // TEST 6: SHORT Price Increases (+5%)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 6] Verifying SHORT Price Increase (+5%)...");
    const pnlShortUp = calculatePnL("SHORT", 222.27, 233.3835, 140, 70);
    if (pnlShortUp.pnlDollar >= 0 || pnlShortUp.pnlPercent >= 0) {
      throw new Error(`TEST 6 Failed: Expected negative PnL for SHORT price increase`);
    }
    console.log(`  ✅ [PASS] SHORT +5% Move -> Position PnL: -$${Math.abs(pnlShortUp.pnlDollar).toFixed(2)} (${pnlShortUp.pnlPercent.toFixed(1)}% ROE)`);

    // -------------------------------------------------------------------------
    // TEST 7: Margin != PnL (Collateral != Profit)
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 7] Verifying Margin != PnL...");
    if (flatTreasury.allocatedMargin === flatTreasury.pnlDollar) {
      throw new Error(`TEST 7 Failed: Margin ($${flatTreasury.allocatedMargin}) was equated to PnL!`);
    }
    console.log(`  ✅ [PASS] Allocated Margin ($${flatTreasury.allocatedMargin}) is NOT PnL ($${flatTreasury.pnlDollar})`);

    // -------------------------------------------------------------------------
    // TEST 8: Leverage != Automatic Profit
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 8] Verifying Leverage != Automatic Profit...");
    const flatPnL = calculatePnL("LONG", 222.27, 222.27, 140, 70);
    if (flatPnL.pnlDollar !== 0 || flatPnL.pnlPercent !== 0) {
      throw new Error(`TEST 8 Failed: Expected $0 PnL at flat price, got $${flatPnL.pnlDollar}`);
    }
    console.log(`  ✅ [PASS] 2x Leverage at flat price -> PnL: $0.00 (0.00%)`);

    // -------------------------------------------------------------------------
    // TEST 9: Fee Accounted for Consistently
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 9] Verifying Fee Deduction Consistency...");
    const expectedEquityAfterFee = 1000 - 0.14;
    if (flatTreasury.totalEquity !== expectedEquityAfterFee) {
      throw new Error(`TEST 9 Failed: Expected equity ${expectedEquityAfterFee}, got ${flatTreasury.totalEquity}`);
    }
    console.log(`  ✅ [PASS] Opening fee $0.14 correctly deducted: Total Equity = $${flatTreasury.totalEquity.toFixed(2)}`);

    // -------------------------------------------------------------------------
    // TEST 10: Canonical Frontend Navbar Format Matches Backend
    // -------------------------------------------------------------------------
    console.log("\n▶ [TEST 10] Verifying Navbar Formatting Invariants...");
    // Navbar renders:
    // formattedTreasury = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(metrics.treasuryEquity)
    const formattedTreasury = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(flatHeader.treasuryEquity);

    if (formattedTreasury !== "$999.86") {
      throw new Error(`TEST 10 Failed: Expected Navbar TREASURY='$999.86', got '${formattedTreasury}'`);
    }

    const pnlSign = flatHeader.pnlDollar > 0 ? "+" : flatHeader.pnlDollar < 0 ? "-" : "";
    const pnlFormatted = `${flatHeader.pnlPercent.toFixed(2)}% (${pnlSign}$${Math.abs(flatHeader.pnlDollar).toFixed(2)})`;
    if (pnlFormatted !== "-0.01% (-$0.14)") {
      throw new Error(`TEST 10 Failed: Expected Navbar PNL='-0.01% (-$0.14)', got '${pnlFormatted}'`);
    }
    console.log(`  ✅ [PASS] Navbar TREASURY: "${formattedTreasury}"`);
    console.log(`  ✅ [PASS] Navbar PNL (SIM): "${pnlFormatted}"`);

    // Clean up test position and trade
    await prisma.position.delete({ where: { id: testPos.id } });
    await prisma.trade.delete({ where: { id: testTrade.id } });

    console.log("\n===============================================================");
    console.log("🎉 ALL 10 ACCOUNTING REGRESSION INVARIANTS PASSED (100%)");
    console.log("===============================================================\n");
  } finally {
    // Teardown: restore original state
    await prisma.position.deleteMany({ where: { agentId: agent.id } });
    await prisma.trade.deleteMany({ where: { tradeNumber: "TEST-0001" } });
    await prisma.agentTreasury.update({
      where: { agentId: agent.id },
      data: { currentBalance: origBalance, initialCapital: origInitial },
    });
  }
}

runAccountingRegression()
  .catch((err) => {
    console.error("❌ Regression test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
