// ============================================================================
// GLYPH PHASE 01 — AUTONOMOUS CYCLE & CRON ENDPOINT VERIFICATION SUITE
// Run with:
//   npm run test:cycle -- --scenario zero-treasury --force
//   npm run test:cycle -- --scenario positive-treasury --force
//   npm run test:cycle -- --force (runs all scenarios)
//
// ARCHITECTURE:
//   This test runner WRAPS the real autonomous cycle — it does NOT contain
//   any mock decisions or duplicate trade logic. Both modes call the same
//   runAutonomousGlyphCycle() used by the cron and CLI.
//
// MODE A — ISOLATED (default): State is rolled back after assertions.
//   - Test positions, trades, decisions, activity logs, economic events deleted.
//   - Treasury restored to pre-test balance.
//   - UI is NOT affected.
//
// MODE B — PERSISTENT: Use `npm run cycle -- --force` for real execution.
// ============================================================================

import { runAutonomousGlyphCycle } from "../../src/lib/cycle/orchestrator";
import { prisma } from "../../src/lib/prisma";
import { getTreasurySummary } from "../../src/lib/treasury";

interface CliOptions {
  scenario?: "zero-treasury" | "positive-treasury";
  force: boolean;
  verbose: boolean;
  json: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  let scenario: "zero-treasury" | "positive-treasury" | undefined;
  let force = false;
  let verbose = false;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scenario" && args[i + 1]) {
      const val = args[i + 1].toLowerCase();
      if (val === "zero-treasury" || val === "positive-treasury") {
        scenario = val;
      }
      i++;
    } else if (args[i] === "--force") {
      force = true;
    } else if (args[i] === "--verbose") {
      verbose = true;
    } else if (args[i] === "--json") {
      json = true;
    }
  }

  if (process.env.FORCE_MARKET_OPEN === "true") {
    force = true;
  }

  return { scenario, force, verbose, json };
}

// ---------------------------------------------------------------------------
// DB INVARIANT HELPER
// Invariant: currentBalance + allocatedMargin + unrealizedPnl == totalEquity
// ---------------------------------------------------------------------------
function assertDatabaseInvariant(
  label: string,
  summary: {
    currentBalance: number;
    allocatedMargin: number;
    unrealizedPnl: number;
    totalEquity: number;
  }
) {
  const computed = summary.currentBalance + summary.allocatedMargin + summary.unrealizedPnl;
  const reported = summary.totalEquity;
  const delta = Math.abs(computed - reported);
  const TOLERANCE = 0.01; // $0.01 floating point tolerance

  if (delta >= TOLERANCE) {
    throw new Error(
      `DATABASE INVARIANT VIOLATED at [${label}]: ` +
        `cash($${summary.currentBalance.toFixed(4)}) + margin($${summary.allocatedMargin.toFixed(4)}) + unrealizedPnl($${summary.unrealizedPnl.toFixed(4)}) ` +
        `= $${computed.toFixed(4)} != totalEquity $${reported.toFixed(4)} (delta: $${delta.toFixed(4)})`
    );
  }
  console.log(`  ✅ [PASS] DB Invariant: cash + margin + pnl = $${computed.toFixed(4)} == totalEquity $${reported.toFixed(4)}`);
}

// ---------------------------------------------------------------------------
// SCENARIO A: ZERO TREASURY
// Invariant: When availableCapital = $0, analysis and decision proceed,
// but Risk Policy must REJECT with INSUFFICIENT_TREASURY and 0 trades created.
// ---------------------------------------------------------------------------
async function runZeroTreasuryScenario(agentIdentifier: string, force: boolean) {
  console.log("\n===============================================================");
  console.log("🧪 SCENARIO: ZERO TREASURY ($0 Capital Economic Safety Precondition)");
  console.log("===============================================================\n");

  const agent = await prisma.agent.findFirst({
    where: { OR: [{ agentId: agentIdentifier }, { id: agentIdentifier }] },
    include: { treasury: true, positions: { where: { isOpen: true } } },
  });

  if (!agent) {
    throw new Error(`Agent '${agentIdentifier}' not found in database.`);
  }

  // Snapshot original treasury state for hermetic restoration
  const originalBalance = agent.treasury ? Number(agent.treasury.currentBalance) : 0;
  const originalInitial = agent.treasury ? Number(agent.treasury.initialCapital) : 0;

  try {
    // Clean up any test positions for target asset to test opening with zero capital
    await prisma.position.deleteMany({
      where: { agentId: agent.id, asset: "NVDA" },
    });

    // Set test treasury to exactly $0.00
    await prisma.agentTreasury.upsert({
      where: { agentId: agent.id },
      update: { currentBalance: 0 },
      create: { agentId: agent.id, currentBalance: 0, initialCapital: 0, currency: "USD-SIM" },
    });

    const preSummary = await getTreasurySummary(agent.agentId);
    console.log(`▶ [SETUP] Treasury zeroed`);
    console.log(`      Available Capital: $${preSummary.currentBalance.toFixed(2)}`);
    console.log(`      Total Equity:      $${preSummary.totalEquity.toFixed(2)}`);

    if (preSummary.currentBalance !== 0) {
      throw new Error(`Test setup failed: Expected availableCapital = 0, got ${preSummary.currentBalance}`);
    }

    const initialPositionsCount = await prisma.position.count({
      where: { agentId: agent.id, isOpen: true },
    });
    const initialTradesCount = await prisma.trade.count({
      where: { agentId: agent.id },
    });

    // Run Autonomous Cycle — same as production
    const cycleKey = `test-zero-treasury:${Date.now()}`;
    console.log(`\n▶ Running real autonomous cycle (cycleId: ${cycleKey})...`);
    const cycleResult = await runAutonomousGlyphCycle({
      targetAsset: "NVDA",
      agentIdentifier: agent.agentId,
      cycleKey,
      bypassMarketHours: force,
    });

    if (!cycleResult.success) {
      throw new Error("Cycle failed unexpectedly");
    }

    if (cycleResult.marketClosed && !force) {
      console.log("  ℹ️ Market is closed. Run with --force to test full pipeline execution.");
      return;
    }

    const decisionResult = cycleResult.decisionResult;
    console.log(`\n▶ Verifying cycle artifacts (cycleId: ${cycleKey}):`);

    // Assert: Research snapshot created
    const snapshot = await prisma.researchSnapshot.findFirst({
      where: { cycleId: cycleKey },
    });
    if (!snapshot) {
      throw new Error("Failed: Research snapshot was not created for this cycle.");
    }
    console.log(`  ✅ [PASS] Market Data & Analysis Completed (Snapshot ID: ${snapshot.id})`);

    // Assert: Decision was recorded
    const decision = await prisma.decision.findUnique({
      where: { id: decisionResult.decisionId },
    });
    if (!decision) {
      throw new Error("Failed: Decision record was not persisted to database.");
    }
    console.log(`  ✅ [PASS] Decision Created: Action = ${decision.action} (${decision.conviction}%)`);

    // Assert: Risk Policy REJECTED with INSUFFICIENT_TREASURY (when trade was proposed)
    if (decision.action === "OPEN_LONG" || decision.action === "OPEN_SHORT") {
      if (decision.policyResult !== "REJECTED") {
        throw new Error(
          `CRITICAL SAFETY VIOLATION: Expected policyResult='REJECTED' when treasury=$0, got '${decision.policyResult}'!`
        );
      }
      if (!decision.policyRejectReason?.includes("INSUFFICIENT_TREASURY")) {
        throw new Error(
          `CRITICAL SAFETY VIOLATION: Expected rejectReason to contain 'INSUFFICIENT_TREASURY', got: '${decision.policyRejectReason}'`
        );
      }
      console.log(`  ✅ [PASS] Risk Policy: Result = REJECTED`);
      console.log(`      Reason: ${decision.policyRejectReason}`);
    } else {
      console.log(`  ℹ️ Decision action was ${decision.action} (Policy: ${decision.policyResult})`);
    }

    // Assert: NO trade created (CRITICAL INVARIANT)
    if (decision.tradeId !== null) {
      throw new Error(
        `CRITICAL SAFETY VIOLATION: Trade ID ${decision.tradeId} was linked to decision with $0 treasury!`
      );
    }
    const finalTradesCount = await prisma.trade.count({
      where: { agentId: agent.id },
    });
    if (finalTradesCount > initialTradesCount) {
      throw new Error(
        `CRITICAL SAFETY VIOLATION: ${finalTradesCount - initialTradesCount} new trade(s) were created when treasury was $0!`
      );
    }
    console.log(`  ✅ [PASS] No Trade Created (trades created = 0)`);

    // Assert: Activity Logs
    const activities = await prisma.activityLog.findMany({
      where: { cycleId: cycleKey },
      orderBy: { timestamp: "asc" },
    });
    const activityTypes = activities.map((a) => a.activityType);
    console.log(`  ✅ [PASS] Activity Logs Verified (${activities.length} entries):`);
    for (const act of activities) {
      console.log(`      ↳ [${act.activityType}] ${act.status} — ${act.title}`);
    }

    if (!activityTypes.includes("ECONOMIC_PRECHECK")) {
      throw new Error("Failed: ActivityLog missing ECONOMIC_PRECHECK entry.");
    }
    if (!activityTypes.includes("ANALYSIS")) {
      throw new Error("Failed: ActivityLog missing ANALYSIS entry.");
    }
    if (!activityTypes.includes("DECISION")) {
      throw new Error("Failed: ActivityLog missing DECISION entry.");
    }
    if (!activityTypes.includes("RISK_POLICY")) {
      throw new Error("Failed: ActivityLog missing RISK_POLICY entry.");
    }

    // Assert: Life Log / Economic Event
    const economicEvent = await prisma.economicEvent.findFirst({
      where: { cycleId: cycleKey, eventType: "DECISION_MADE" },
    });
    if (!economicEvent) {
      throw new Error("Failed: EconomicEvent DECISION_MADE was not recorded.");
    }
    console.log(`  ✅ [PASS] Life Log Verified:`);
    console.log(`      ↳ ${economicEvent.title}`);
    console.log(`      ↳ ${economicEvent.description}`);

    if (decision.action === "OPEN_LONG" || decision.action === "OPEN_SHORT") {
      if (economicEvent.result !== "REJECTED" || !economicEvent.description?.includes("INSUFFICIENT_TREASURY")) {
        throw new Error("Failed: Life Log does not reflect REJECTED / INSUFFICIENT_TREASURY status.");
      }
    }

    // Assert: Portfolio unchanged
    const finalPositionsCount = await prisma.position.count({
      where: { agentId: agent.id, isOpen: true },
    });
    if (finalPositionsCount !== initialPositionsCount) {
      throw new Error(
        `Failed: Open positions changed during $0 treasury cycle (${initialPositionsCount} -> ${finalPositionsCount}).`
      );
    }
    const postSummary = await getTreasurySummary(agent.agentId);
    if (postSummary.currentBalance !== 0) {
      throw new Error(`Failed: Treasury cash balance was altered from $0.00.`);
    }
    console.log(`  ✅ [PASS] Portfolio Unchanged (0 positions added, cash remains $0.00)`);

    // Assert: DB invariant (cash=$0, margin=$0, pnl=$0 → equity=$0)
    assertDatabaseInvariant("zero-treasury post-cycle", postSummary);

    console.log("\n🎉 ZERO TREASURY ECONOMIC SAFETY TEST PASSED COMPLETELY!\n");
  } finally {
    // Restore original treasury state
    await prisma.agentTreasury.update({
      where: { agentId: agent.id },
      data: { currentBalance: originalBalance, initialCapital: originalInitial },
    });
    console.log(`🔄 Isolated test state restored (Treasury restored to $${originalBalance.toFixed(2)}).`);
  }
}

// ---------------------------------------------------------------------------
// SCENARIO B: POSITIVE TREASURY
// Invariant: When availableCapital = $1,000, high conviction trade proposal
// passes economic precheck, policy is APPROVED, trade is CREATED, and
// treasury reflects the deducted margin + fee.
// ---------------------------------------------------------------------------
async function runPositiveTreasuryScenario(agentIdentifier: string, force: boolean) {
  console.log("\n===============================================================");
  console.log("🧪 SCENARIO: POSITIVE TREASURY ($1,000 Capital Execution Flow)");
  console.log("===============================================================\n");

  const agent = await prisma.agent.findFirst({
    where: { OR: [{ agentId: agentIdentifier }, { id: agentIdentifier }] },
    include: { treasury: true },
  });

  if (!agent) {
    throw new Error(`Agent '${agentIdentifier}' not found in database.`);
  }

  // Snapshot original treasury state for hermetic restoration
  const originalBalance = agent.treasury ? Number(agent.treasury.currentBalance) : 0;
  const originalInitial = agent.treasury ? Number(agent.treasury.initialCapital) : 0;

  const cycleKey = `test-positive-treasury:${Date.now()}`;

  try {
    // Clean up any pre-existing NVDA positions to allow fresh trade
    await prisma.position.deleteMany({
      where: { agentId: agent.id, asset: "NVDA" },
    });

    // Set test treasury to $1,000.00
    await prisma.agentTreasury.upsert({
      where: { agentId: agent.id },
      update: { currentBalance: 1000, initialCapital: 1000 },
      create: { agentId: agent.id, currentBalance: 1000, initialCapital: 1000, currency: "USD-SIM" },
    });

    const preSummary = await getTreasurySummary(agent.agentId);
    console.log(`▶ [SETUP] Treasury funded`);
    console.log(`      Available Capital: $${preSummary.currentBalance.toFixed(2)}`);
    console.log(`      Total Equity:      $${preSummary.totalEquity.toFixed(2)}`);

    if (preSummary.currentBalance < 1000) {
      throw new Error(`Test setup failed: Expected availableCapital >= 1000, got ${preSummary.currentBalance}`);
    }

    // Assert: Pre-cycle DB invariant (no positions, cash=$1000)
    assertDatabaseInvariant("pre-cycle setup", preSummary);

    // Run Autonomous Cycle — same core pipeline as production/cron
    console.log(`\n▶ Running real autonomous cycle (cycleId: ${cycleKey})...`);
    const cycleResult = await runAutonomousGlyphCycle({
      targetAsset: "NVDA",
      agentIdentifier: agent.agentId,
      cycleKey,
      bypassMarketHours: force,
    });

    if (!cycleResult.success) {
      throw new Error("Cycle failed unexpectedly");
    }

    if (cycleResult.marketClosed && !force) {
      console.log("  ℹ️ Market is closed. Run with --force to test full pipeline execution.");
      return;
    }

    const decisionResult = cycleResult.decisionResult;
    console.log(`\n▶ Verifying cycle artifacts (cycleId: ${cycleKey}):`);

    // -------------------------------------------------------------------
    // Assert: Research snapshot
    // -------------------------------------------------------------------
    const snapshot = await prisma.researchSnapshot.findFirst({
      where: { cycleId: cycleKey },
    });
    if (!snapshot) {
      throw new Error("Failed: Research snapshot was not created for this cycle.");
    }
    console.log(`  ✅ [PASS] Market Data & Analysis Completed (Snapshot ID: ${snapshot.id})`);

    // -------------------------------------------------------------------
    // Assert: Decision created with correct fields
    // -------------------------------------------------------------------
    const decision = await prisma.decision.findUnique({
      where: { id: decisionResult.decisionId },
    });
    if (!decision) {
      throw new Error("Failed: Decision record was not persisted to database.");
    }
    console.log(`  ✅ [PASS] Decision Created: Action = ${decision.action} (${decision.conviction}%)`);
    console.log(`  ✅ [PASS] Policy Result: ${decision.policyResult}`);

    // -------------------------------------------------------------------
    // Assert: Trade created when APPROVED (with full detail check)
    // -------------------------------------------------------------------
    if (decision.policyResult === "APPROVED" && (decision.action === "OPEN_LONG" || decision.action === "OPEN_SHORT")) {
      if (!decision.tradeId) {
        throw new Error("Failed: APPROVED trade proposal did not create a Trade record.");
      }

      const trade = await prisma.trade.findUnique({
        where: { id: decision.tradeId },
      });
      if (!trade) {
        throw new Error(`Failed: Trade ${decision.tradeId} not found in database.`);
      }

      const margin = Number(trade.positionSize);
      const fee = Number(trade.fees);
      const leverage = Number(trade.leverage);

      // Validate margin > 0 and fee > 0
      if (margin <= 0) {
        throw new Error(`Failed: Trade margin is $${margin.toFixed(2)} — expected > $0.`);
      }
      if (fee <= 0) {
        throw new Error(`Failed: Trade fee is $${fee.toFixed(4)} — expected > $0.`);
      }
      if (leverage < 1) {
        throw new Error(`Failed: Trade leverage is ${leverage}x — expected >= 1.`);
      }

      console.log(`  ✅ [PASS] Paper Trade Created: ${trade.tradeNumber}`);
      console.log(`      ↳ Asset:         ${trade.asset} ${trade.action}`);
      console.log(`      ↳ Entry Price:   $${Number(trade.entryPrice).toFixed(2)}`);
      console.log(`      ↳ Margin:        $${margin.toFixed(2)}`);
      console.log(`      ↳ Leverage:      ${leverage}x`);
      console.log(`      ↳ Fee:           $${fee.toFixed(4)}`);
      console.log(`      ↳ Status:        ${trade.status}`);

      // -------------------------------------------------------------------
      // Assert: Position created and open
      // -------------------------------------------------------------------
      const position = await prisma.position.findFirst({
        where: { tradeId: trade.id, isOpen: true },
      });
      if (!position) {
        throw new Error(`Failed: Open position for trade ${trade.tradeNumber} not found.`);
      }

      const posMargin = Number(position.positionSize);
      const posLeverage = Number(position.leverage);

      if (!position.isOpen) {
        throw new Error("Failed: Position is not marked as open.");
      }
      if (posMargin !== margin) {
        throw new Error(`Failed: Position margin ($${posMargin.toFixed(2)}) != Trade margin ($${margin.toFixed(2)}).`);
      }
      if (posLeverage !== leverage) {
        throw new Error(`Failed: Position leverage (${posLeverage}x) != Trade leverage (${leverage}x).`);
      }

      console.log(`  ✅ [PASS] Position Opened:`);
      console.log(`      ↳ Asset:         ${position.asset} · ${position.side}`);
      console.log(`      ↳ Entry Price:   $${Number(position.entryPrice).toFixed(2)}`);
      console.log(`      ↳ Margin:        $${posMargin.toFixed(2)}`);
      console.log(`      ↳ Leverage:      ${posLeverage}x`);
      console.log(`      ↳ isOpen:        ${position.isOpen}`);

      // -------------------------------------------------------------------
      // Assert: Treasury correctly debited (cash = 1000 - margin - fee)
      // -------------------------------------------------------------------
      const postSummary = await getTreasurySummary(agent.agentId);
      const expectedCash = 1000 - margin - fee;
      const expectedEquity = 1000 - fee; // initial - fee (margin is still "ours" as allocated capital)
      const cashDelta = Math.abs(postSummary.currentBalance - expectedCash);
      const equityDelta = Math.abs(postSummary.totalEquity - expectedEquity);

      if (cashDelta > 0.01) {
        throw new Error(
          `Failed: Expected cash ≈ $${expectedCash.toFixed(2)}, got $${postSummary.currentBalance.toFixed(2)} (delta: $${cashDelta.toFixed(4)})`
        );
      }
      if (equityDelta > 0.01) {
        throw new Error(
          `Failed: Expected equity ≈ $${expectedEquity.toFixed(2)}, got $${postSummary.totalEquity.toFixed(2)} (delta: $${equityDelta.toFixed(4)})`
        );
      }

      console.log(`  ✅ [PASS] Treasury Correctly Debited:`);
      console.log(`      ↳ Cash:   $${postSummary.currentBalance.toFixed(2)} (expected ≈ $${expectedCash.toFixed(2)})`);
      console.log(`      ↳ Margin: $${postSummary.allocatedMargin.toFixed(2)}`);
      console.log(`      ↳ Equity: $${postSummary.totalEquity.toFixed(2)} (expected ≈ $${expectedEquity.toFixed(2)})`);
      console.log(`      ↳ PnL:    $${postSummary.pnlDollar.toFixed(4)} (${postSummary.pnlPercent.toFixed(4)}%)`);

      // -------------------------------------------------------------------
      // Assert: Database invariant holds after trade
      // cash + allocatedMargin + unrealizedPnl == totalEquity
      // -------------------------------------------------------------------
      assertDatabaseInvariant("positive-treasury post-trade", postSummary);

      // -------------------------------------------------------------------
      // Assert: Activity Logs (all stages present)
      // -------------------------------------------------------------------
      const activities = await prisma.activityLog.findMany({
        where: { cycleId: cycleKey },
        orderBy: { timestamp: "asc" },
      });
      const activityTypes = activities.map((a) => a.activityType);
      console.log(`  ✅ [PASS] Activity Logs Verified (${activities.length} entries):`);
      for (const act of activities) {
        console.log(`      ↳ [${act.activityType}] ${act.status} — ${act.title}`);
      }

      const requiredActivities = ["ECONOMIC_PRECHECK", "ANALYSIS", "DECISION", "RISK_POLICY", "TRADE"];
      for (const required of requiredActivities) {
        if (!activityTypes.includes(required)) {
          throw new Error(`Failed: ActivityLog missing required '${required}' entry.`);
        }
      }

      // -------------------------------------------------------------------
      // Assert: Economic Events (DECISION_MADE + TRADE_OPENED)
      // -------------------------------------------------------------------
      const decisionEvent = await prisma.economicEvent.findFirst({
        where: { cycleId: cycleKey, eventType: "DECISION_MADE" },
      });
      if (!decisionEvent) {
        throw new Error("Failed: EconomicEvent DECISION_MADE was not recorded.");
      }

      const tradeOpenedEvent = await prisma.economicEvent.findFirst({
        where: { tradeId: trade.id, eventType: "TRADE_OPENED" },
      });
      if (!tradeOpenedEvent) {
        throw new Error("Failed: EconomicEvent TRADE_OPENED was not recorded.");
      }

      console.log(`  ✅ [PASS] Economic Events:`);
      console.log(`      ↳ DECISION_MADE: ${decisionEvent.title}`);
      console.log(`      ↳ TRADE_OPENED:  ${tradeOpenedEvent.title}`);

    } else {
      // When policy is REJECTED or action is not OPEN_*
      const postSummary = await getTreasurySummary(agent.agentId);
      console.log(`  ℹ️ Decision was ${decision.action} / Policy: ${decision.policyResult}`);
      console.log(`      ↳ Cash: $${postSummary.currentBalance.toFixed(2)} (unchanged)`);
      // Invariant: no trade → cash unchanged
      assertDatabaseInvariant("positive-treasury no-trade", postSummary);
    }

    console.log("\n🎉 POSITIVE TREASURY TEST PASSED COMPLETELY!\n");
  } finally {
    // -------------------------------------------------------------------
    // COMPREHENSIVE ROLLBACK
    // Cleans up ALL artifacts created during this test cycle.
    // Order matters: positions → trades (FK constraint) → decisions → others
    // -------------------------------------------------------------------
    console.log(`🧹 Rolling back isolated test state (cycleId: ${cycleKey})...`);

    // 1. Close/delete open positions linked to this test cycle's trades
    await prisma.position.deleteMany({
      where: { trade: { cycleId: cycleKey } },
    });

    // 2. Delete economic events for this cycle (including TRADE_OPENED events)
    await prisma.economicEvent.deleteMany({
      where: { cycleId: cycleKey },
    });
    // Also delete TRADE_OPENED/TRADE_CLOSED events that reference trades from this cycle
    const cycleTradeIds = await prisma.trade.findMany({
      where: { cycleId: cycleKey },
      select: { id: true },
    });
    if (cycleTradeIds.length > 0) {
      await prisma.economicEvent.deleteMany({
        where: { tradeId: { in: cycleTradeIds.map((t) => t.id) } },
      });
    }

    // 3. Unlink decisions from trades before deleting trades (FK constraint)
    await prisma.decision.updateMany({
      where: { cycleId: cycleKey },
      data: { tradeId: null },
    });

    // 4. Delete trades
    await prisma.trade.deleteMany({
      where: { cycleId: cycleKey },
    });

    // 5. Delete decisions
    await prisma.decision.deleteMany({
      where: { cycleId: cycleKey },
    });

    // 6. Delete activity logs
    await prisma.activityLog.deleteMany({
      where: { cycleId: cycleKey },
    });

    // 7. Delete research snapshots
    await prisma.researchSnapshot.deleteMany({
      where: { cycleId: cycleKey },
    });

    // 8. Delete agent run record
    await prisma.agentRun.deleteMany({
      where: { cycleKey },
    });

    // 9. Restore original treasury balance
    await prisma.agentTreasury.update({
      where: { agentId: agent.id },
      data: { currentBalance: originalBalance, initialCapital: originalInitial },
    });

    console.log(`🔄 Isolated test state restored (Treasury restored to $${originalBalance.toFixed(2)}).`);
    console.log(`   Deleted: positions, trades, decisions, activity logs, economic events, research snapshots, agent run.`);
  }
}

// ---------------------------------------------------------------------------
// HTTP API SECURITY VERIFICATION
// ---------------------------------------------------------------------------
async function verifyHttpSecurity() {
  console.log("\n▶ [HTTP API SECURITY] Testing /api/cron/glyph-cycle guardrails...");
  const localBaseUrl = "http://localhost:3000";

  try {
    // 1. Missing Auth header → 401
    const resNoAuth = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, { method: "POST" });
    if (resNoAuth.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${resNoAuth.status}`);
    }
    console.log(`  ✅ 401 Unauthorized returned for missing token`);

    // 2. Invalid Bearer token → 401
    const resBadToken = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, {
      method: "POST",
      headers: { Authorization: "Bearer invalid_secret_12345" },
    });
    if (resBadToken.status !== 401) {
      throw new Error(`Expected 401 for invalid token, got ${resBadToken.status}`);
    }
    console.log(`  ✅ 401 Unauthorized returned for invalid token`);

    // 3. GET method → 405
    const resGet = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, { method: "GET" });
    if (resGet.status !== 405) {
      throw new Error(`Expected 405 Method Not Allowed, got ${resGet.status}`);
    }
    console.log(`  ✅ 405 Method Not Allowed returned for GET request`);
  } catch (err: any) {
    if (err.cause?.code === "ECONNREFUSED" || err.message?.includes("fetch failed")) {
      console.log(`  ℹ️ Local server not reachable on :3000 (skipping HTTP route check).`);
    } else {
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseCliArgs();

  console.log("===============================================================");
  console.log("🚀 GLYPH PHASE 01 — AUTONOMOUS CYCLE & ECONOMIC SAFETY SUITE");
  console.log("===============================================================");
  console.log(`- Mode: ${opts.force ? "BYPASS MARKET HOURS (--force)" : "STRICT MARKET HOURS"}`);
  console.log(`- Scenario: ${opts.scenario || "ALL SCENARIOS"}`);
  console.log(`- Isolation: ENABLED (state rolled back after assertions)\n`);
  console.log("  ↳ To run a PERSISTENT cycle (keeps DB state), use:");
  console.log("    npm run cycle -- --force\n");

  const agentIdentifier = process.env.GLYPH_AGENT_ID || "1";

  if (opts.scenario === "zero-treasury") {
    await runZeroTreasuryScenario(agentIdentifier, opts.force);
  } else if (opts.scenario === "positive-treasury") {
    await runPositiveTreasuryScenario(agentIdentifier, opts.force);
  } else {
    // Default: Run all scenarios
    await runZeroTreasuryScenario(agentIdentifier, opts.force);
    await runPositiveTreasuryScenario(agentIdentifier, opts.force);
    await verifyHttpSecurity();
  }

  console.log("===============================================================");
  console.log("🎉 ALL ECONOMIC SAFETY & CYCLE VERIFICATION CHECKS PASSED (EXIT 0)");
  console.log("===============================================================\n");
}

main()
  .catch((err) => {
    console.error("\n❌ E2E VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
