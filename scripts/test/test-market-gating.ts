import "dotenv/config";
import { runAutonomousGlyphCycle } from "../../src/lib/cycle/orchestrator";
import { TwelveDataProvider } from "../../src/lib/market/twelve-data";
import { validateTradeProposal } from "../../src/lib/policy";
import { prisma } from "../../src/lib/prisma";

async function runMarketGatingVerification() {
  console.log("===============================================================");
  console.log("🛡️ VERIFYING MARKET HOURS GATING VIA TWELVE DATA API");
  console.log("===============================================================\n");

  // 1. Test Twelve Data getMarketStatus API
  console.log("▶ [TEST 1] Querying real-time Market Status from Twelve Data API...");
  const marketProvider = new TwelveDataProvider();
  const status = await marketProvider.getMarketStatus("United States");
  console.log("  ✅ Live Market Status fetched:");
  console.log(`     ↳ Region           : ${status.region}`);
  console.log(`     ↳ Status           : ${status.status.toUpperCase()}`);
  console.log(`     ↳ Is Open          : ${status.isOpen}`);
  console.log(`     ↳ Exchanges        : ${status.primaryExchanges}`);
  console.log(`     ↳ Regular Hours    : ${status.localOpen} - ${status.localClose}`);
  console.log(`     ↳ Source           : ${status.source}`);

  // 2. Test Deterministic Policy Engine rejection when market is closed
  console.log("\n▶ [TEST 2] Testing Policy Engine market hours rejection...");
  const policyCheck = validateTradeProposal(
    {
      asset: "NVDA",
      action: "OPEN_LONG",
      conviction: 85,
      positionSizePercent: 5,
      leverage: 2,
    },
    0,
    0,
    null,
    false // isMarketOpen = false
  );

  console.log(`  ↳ Policy Result: ${policyCheck.policyResult}`);
  console.log(`  ↳ Reject Reason: "${policyCheck.rejectReason}"`);
  if (policyCheck.approved || policyCheck.policyResult !== "REJECTED") {
    throw new Error("Policy Engine failed to reject order when market is closed!");
  }
  console.log("  ✅ Policy Engine successfully rejected trade proposal due to closed market.");

  // 3. Test Orchestrator Gating (marketClosed: true when not bypassed)
  console.log("\n▶ [TEST 3] Testing Cycle Orchestrator Gating (bypassMarketHours: false)...");
  const testKey = `market-gate-test:${Date.now()}`;
  const cycleSummary = await runAutonomousGlyphCycle({
    targetAsset: "NVDA",
    cycleKey: testKey,
    bypassMarketHours: false,
  });

  console.log("\n▶ [TEST 3 RESULTS]:");
  console.log(`  ↳ Cycle Success      : ${cycleSummary.success}`);
  console.log(`  ↳ Market Closed Flag : ${cycleSummary.marketClosed}`);
  console.log(`  ↳ Decision Action    : ${cycleSummary.decisionResult.action}`);
  console.log(`  ↳ Policy Result      : ${cycleSummary.decisionResult.policyResult}`);
  console.log(`  ↳ Reject Reason      : ${cycleSummary.decisionResult.policyRejectReason}`);
  console.log(`  ↳ Trade ID           : ${cycleSummary.decisionResult.tradeId ?? "None (No trade opened)"}`);

  if (status.isOpen) {
    console.log("  ℹ️ Market is currently OPEN; cycle proceeded normally.");
  } else {
    if (!cycleSummary.marketClosed || cycleSummary.decisionResult.tradeId !== null) {
      throw new Error("Orchestrator failed to halt execution while market is closed!");
    }
    console.log("  ✅ Orchestrator successfully halted research/trade creation because market is closed.");
  }

  // Clean up the test agent run from db
  await prisma.agentRun.deleteMany({
    where: { cycleKey: testKey },
  });

  console.log("\n===============================================================");
  console.log("🎉 ALL MARKET HOURS GATING TESTS PASSED SUCCESSFULLY!");
  console.log("===============================================================\n");
}

runMarketGatingVerification()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
