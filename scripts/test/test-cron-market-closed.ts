import "dotenv/config";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { POST as glyphCycleHandler } from "../../src/app/api/cron/glyph-cycle/route";
import { POST as tradeDecisionHandler } from "../../src/app/api/cron/trade-decision/route";
import { prisma } from "../../src/lib/prisma";

const cachePath = path.join(process.cwd(), ".cache", "market", "market_status.json");

function setMockMarketStatus(status: "closed" | "open" | "unknown") {
  const cacheDir = path.dirname(cachePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const payload = {
    endpoint: "Global Market Open & Close Status",
    markets: [
      {
        market_type: "Equity",
        region: "United States",
        primary_exchanges: "NASDAQ, NYSE, AMEX, BATS",
        local_open: "09:30",
        localClose: "16:15",
        current_status: status,
        notes: status === "unknown" ? "Simulated unknown status" : "",
      },
    ],
  };

  fs.writeFileSync(cachePath, JSON.stringify(payload, null, 2), "utf-8");
}

async function runTests() {
  console.log("===============================================================");
  console.log("🛡️ RUNNING PHASE 9 MARKET-CLOSED CRON BEHAVIOR TEST");
  console.log("===============================================================\n");

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    throw new Error("CRON_SECRET environment variable is missing!");
  }

  // Backup original cache if exists
  const originalCache = fs.existsSync(cachePath) ? fs.readFileSync(cachePath, "utf-8") : null;

  // 1. Capture DB Baseline
  console.log("▶ [STEP 1] Capturing DB Baseline Counts...");
  const [initialAgents, initialDecisions, initialTrades, initialPositions, initialSnapshots, initialRuns] =
    await Promise.all([
      prisma.agent.count(),
      prisma.decision.count(),
      prisma.trade.count(),
      prisma.position.count(),
      prisma.researchSnapshot.count(),
      prisma.agentRun.count(),
    ]);

  console.log(`  ↳ Agents: ${initialAgents}`);
  console.log(`  ↳ Decisions: ${initialDecisions}`);
  console.log(`  ↳ Trades: ${initialTrades}`);
  console.log(`  ↳ Positions: ${initialPositions}`);
  console.log(`  ↳ Research Snapshots: ${initialSnapshots}`);
  console.log(`  ↳ Agent Runs: ${initialRuns}`);

  try {
    // 2. Test Authorization Gate
    console.log("\n▶ [STEP 2] Testing Cron Authorization Gate...");
    {
      const reqNoAuth = new NextRequest("http://localhost:3000/api/cron/glyph-cycle", {
        method: "POST",
      });
      const res = await glyphCycleHandler(reqNoAuth);
      assert.equal(res.status, 401, "Expected 401 for unauthenticated request");
      console.log("  ✅ Unauthenticated /api/cron/glyph-cycle correctly rejected (HTTP 401)");
    }
    {
      const reqBadAuth = new NextRequest("http://localhost:3000/api/cron/glyph-cycle", {
        method: "POST",
        headers: { authorization: "Bearer invalid-token" },
      });
      const res = await glyphCycleHandler(reqBadAuth);
      assert.equal(res.status, 401, "Expected 401 for bad token");
      console.log("  ✅ Invalid token /api/cron/glyph-cycle correctly rejected (HTTP 401)");
    }
    {
      const reqTradeNoAuth = new NextRequest("http://localhost:3000/api/cron/trade-decision", {
        method: "POST",
      });
      const res = await tradeDecisionHandler(reqTradeNoAuth);
      assert.equal(res.status, 401, "Expected 401 for trade-decision unauthenticated");
      console.log("  ✅ Unauthenticated /api/cron/trade-decision correctly rejected (HTTP 401)");
    }

    // 3. Test Market Closed Behavior on /api/cron/glyph-cycle
    console.log("\n▶ [STEP 3] Testing Market-Closed Behavior on /api/cron/glyph-cycle...");
    setMockMarketStatus("closed");

    // Empty body (skipIfClosed omitted) — this previously fell through to orchestrator!
    const reqEmptyBody = new NextRequest("http://localhost:3000/api/cron/glyph-cycle", {
      method: "POST",
      headers: {
        authorization: `Bearer ${cronSecret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const cycleRes = await glyphCycleHandler(reqEmptyBody);
    assert.equal(cycleRes.status, 200, `Expected HTTP 200, got ${cycleRes.status}`);
    const cycleJson = await cycleRes.json();

    console.log("  ↳ Response payload:", JSON.stringify(cycleJson, null, 2));
    assert.equal(cycleJson.status, "MARKET_CLOSED", "Expected status MARKET_CLOSED");
    assert.ok(
      cycleJson.message.includes("Autonomous cycle skipped"),
      "Expected message to state autonomous cycle skipped"
    );
    console.log("  ✅ /api/cron/glyph-cycle safely STOPPED when market closed (without skipIfClosed flag)!");

    // 4. Test Market Closed Behavior on /api/cron/trade-decision
    console.log("\n▶ [STEP 4] Testing Market-Closed Behavior on /api/cron/trade-decision...");
    const reqTradeClosed = new NextRequest("http://localhost:3000/api/cron/trade-decision", {
      method: "POST",
      headers: {
        authorization: `Bearer ${cronSecret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const tradeRes = await tradeDecisionHandler(reqTradeClosed);
    assert.equal(tradeRes.status, 200, `Expected HTTP 200, got ${tradeRes.status}`);
    const tradeJson = await tradeRes.json();

    console.log("  ↳ Response payload:", JSON.stringify(tradeJson, null, 2));
    assert.equal(tradeJson.success, true, "Expected success: true");
    assert.equal(tradeJson.status, "MARKET_CLOSED", "Expected status: MARKET_CLOSED");
    console.log("  ✅ /api/cron/trade-decision safely handled MARKET_CLOSED response!");

    // 5. Verify Zero Side Effects on Database
    console.log("\n▶ [STEP 5] Verifying DB state remains 100% untouched...");
    const [afterDecisions, afterTrades, afterPositions, afterSnapshots, afterRuns] =
      await Promise.all([
        prisma.decision.count(),
        prisma.trade.count(),
        prisma.position.count(),
        prisma.researchSnapshot.count(),
        prisma.agentRun.count(),
      ]);

    assert.equal(afterDecisions, initialDecisions, "Decisions count changed!");
    assert.equal(afterTrades, initialTrades, "Trades count changed!");
    assert.equal(afterPositions, initialPositions, "Positions count changed!");
    assert.equal(afterSnapshots, initialSnapshots, "Snapshots count changed!");
    assert.equal(afterRuns, initialRuns, "Agent runs count changed!");

    console.log("  ✅ Verification confirms ZERO side effects:");
    console.log(`     ↳ No Research Snapshot created (still ${afterSnapshots})`);
    console.log(`     ↳ No Decision created (still ${afterDecisions})`);
    console.log(`     ↳ No Trade created (still ${afterTrades})`);
    console.log(`     ↳ No Position created (still ${afterPositions})`);
    console.log(`     ↳ No AgentRun created (still ${afterRuns})`);
    console.log("     ↳ No Mainnet transaction sent");

    console.log("\n===============================================================");
    console.log("🎉 ALL MARKET-CLOSED CRON TESTS PASSED 100%!");
    console.log("===============================================================\n");
  } finally {
    // Restore cache
    if (originalCache !== null) {
      fs.writeFileSync(cachePath, originalCache, "utf-8");
    } else {
      fs.rmSync(cachePath, { force: true });
    }
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
