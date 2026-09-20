// ============================================================================
// GLYPH PHASE 01 — PERSISTENT AUTONOMOUS CYCLE CLI
// Runs the REAL autonomous cycle and persists ALL state to the database.
//
// Usage:
//   npm run cycle -- --force              (bypass market hours)
//   npm run cycle -- --asset TSLA --force  (target specific asset)
//   npm run cycle                          (strict market hours)
//
// This is the SAME pipeline used by the cron endpoint:
//   Market Data → Research → Glyph Brain → Economic Precheck →
//   Risk Policy → Trade Gate → Portfolio Update → Activity Log →
//   Life Log → Onchain Proof
//
// ALL state (decisions, trades, positions, treasury) PERSISTS after execution.
// The UI will immediately reflect the new state.
// ============================================================================

import { runAutonomousGlyphCycle } from "../../src/lib/cycle/orchestrator";
import { prisma } from "../../src/lib/prisma";
import { getTreasurySummary } from "../../src/lib/treasury";
import { getActivePositions } from "../../src/lib/portfolio";

interface CliOptions {
  asset?: string;
  force: boolean;
  verbose: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  let asset: string | undefined;
  let force = false;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--asset" || args[i] === "-a") {
      asset = args[++i]?.toUpperCase();
    } else if (args[i] === "--force") {
      force = true;
    } else if (args[i] === "--verbose") {
      verbose = true;
    }
  }

  if (process.env.FORCE_MARKET_OPEN === "true") {
    force = true;
  }

  return { asset, force, verbose };
}

/**
 * Verifies the database invariant:
 *   currentBalance + allocatedMargin + unrealizedPnl == totalEquity
 *
 * This must hold after every cycle execution.
 */
function verifyDatabaseInvariant(summary: {
  currentBalance: number;
  allocatedMargin: number;
  unrealizedPnl: number;
  totalEquity: number;
}): { valid: boolean; computed: number; reported: number; delta: number } {
  const computed = summary.currentBalance + summary.allocatedMargin + summary.unrealizedPnl;
  const reported = summary.totalEquity;
  const delta = Math.abs(computed - reported);
  // Allow floating point tolerance of $0.01
  const valid = delta < 0.01;
  return { valid, computed, reported, delta };
}

async function main() {
  const opts = parseCliArgs();

  console.log("===============================================================");
  console.log("🤖 GLYPH AUTONOMOUS CYCLE — PERSISTENT MODE");
  console.log("===============================================================");
  console.log(`  Mode: ${opts.force ? "BYPASS MARKET HOURS (--force)" : "STRICT MARKET HOURS"}`);
  console.log(`  Target: ${opts.asset || "NVDA (default)"}`);
  console.log(`  State: ALL CHANGES WILL PERSIST IN DATABASE`);
  console.log("");

  const agentIdentifier = process.env.GLYPH_AGENT_ID || "1";

  // Pre-cycle treasury snapshot
  const preTreasury = await getTreasurySummary(agentIdentifier);
  console.log("▶ PRE-CYCLE STATE:");
  console.log(`  Cash Balance:     $${preTreasury.currentBalance.toFixed(2)}`);
  console.log(`  Allocated Margin: $${preTreasury.allocatedMargin.toFixed(2)}`);
  console.log(`  Unrealized PnL:   $${preTreasury.unrealizedPnl.toFixed(2)}`);
  console.log(`  Total Equity:     $${preTreasury.totalEquity.toFixed(2)}`);
  console.log(`  Initial Capital:  $${preTreasury.initialCapital.toFixed(2)}`);
  console.log("");

  if (preTreasury.currentBalance <= 0) {
    console.error("❌ ABORT: Treasury has $0 available capital. Fund the treasury first:");
    console.error("   npm run fund:treasury -- --amount 1000");
    process.exit(1);
  }

  // Run the REAL autonomous cycle — same as cron endpoint
  console.log("⏳ Executing autonomous cycle...\n");
  const cycleResult = await runAutonomousGlyphCycle({
    targetAsset: opts.asset,
    agentIdentifier,
    bypassMarketHours: opts.force,
  });

  if (!cycleResult.success) {
    console.error("❌ Cycle execution failed.");
    process.exit(1);
  }

  if (cycleResult.marketClosed && !opts.force) {
    console.log("ℹ️  Market is closed. Run with --force to bypass.");
    console.log("   npm run cycle -- --force");
    return;
  }

  // Post-cycle state verification
  const postTreasury = await getTreasurySummary(agentIdentifier);
  const activePositions = await getActivePositions(agentIdentifier);
  const dr = cycleResult.decisionResult;

  console.log("===============================================================");
  console.log("📊 POST-CYCLE PERSISTED STATE");
  console.log("===============================================================");

  // Decision summary
  console.log("\n▶ DECISION:");
  console.log(`  Action:     ${dr.action}`);
  console.log(`  Conviction: ${dr.conviction}%`);
  console.log(`  Policy:     ${dr.policyResult}`);
  if (dr.policyRejectReason) {
    console.log(`  Reject:     ${dr.policyRejectReason}`);
  }

  // Trade summary
  if (dr.tradeId && dr.tradeNumber) {
    const trade = await prisma.trade.findUnique({ where: { id: dr.tradeId } });
    console.log("\n▶ TRADE:");
    console.log(`  Number:     ${dr.tradeNumber}`);
    console.log(`  Asset:      ${trade?.asset}`);
    console.log(`  Side:       ${trade?.action}`);
    console.log(`  Entry:      $${Number(trade?.entryPrice).toFixed(2)}`);
    console.log(`  Margin:     $${Number(trade?.positionSize).toFixed(2)}`);
    console.log(`  Leverage:   ${trade?.leverage}x`);
    console.log(`  Fee:        $${Number(trade?.fees).toFixed(4)}`);
    console.log(`  Status:     ${trade?.status}`);
  } else {
    console.log("\n▶ TRADE: None created");
  }

  // Treasury summary
  console.log("\n▶ TREASURY (PERSISTED):");
  console.log(`  Cash Balance:     $${postTreasury.currentBalance.toFixed(2)}`);
  console.log(`  Allocated Margin: $${postTreasury.allocatedMargin.toFixed(2)}`);
  console.log(`  Unrealized PnL:   $${postTreasury.unrealizedPnl.toFixed(2)}`);
  console.log(`  Total Equity:     $${postTreasury.totalEquity.toFixed(2)}`);
  console.log(`  PnL Dollar:       ${postTreasury.pnlDollar >= 0 ? "+" : ""}$${postTreasury.pnlDollar.toFixed(4)}`);
  console.log(`  PnL Percent:      ${postTreasury.pnlPercent >= 0 ? "+" : ""}${postTreasury.pnlPercent.toFixed(4)}%`);

  // Position summary
  console.log("\n▶ POSITIONS:");
  if (activePositions.positions.length === 0) {
    console.log("  None (no open positions)");
  } else {
    for (const pos of activePositions.positions) {
      console.log(`  ${pos.asset} · ${pos.side} ${pos.leverage}×`);
      console.log(`    Entry:          $${pos.entryPrice.toFixed(2)}`);
      console.log(`    Current:        $${pos.currentPrice.toFixed(2)}`);
      console.log(`    Margin:         $${pos.margin.toFixed(2)}`);
      console.log(`    Unrealized PnL: $${pos.unrealizedPnl.toFixed(2)} (${pos.unrealizedPnlPercent.toFixed(2)}%)`);
    }
  }

  // Onchain proof
  if (dr.transactionHash) {
    console.log("\n▶ ONCHAIN PROOF:");
    console.log(`  Decision Hash: ${dr.decisionHash}`);
    console.log(`  Tx Hash:       ${dr.transactionHash}`);
    console.log(`  Explorer:      ${dr.explorerUrl || "N/A"}`);
  }

  // Database invariant check
  console.log("\n▶ DATABASE INVARIANT CHECK:");
  const invariant = verifyDatabaseInvariant(postTreasury);
  console.log(`  cash ($${postTreasury.currentBalance.toFixed(2)}) + margin ($${postTreasury.allocatedMargin.toFixed(2)}) + unrealizedPnl ($${postTreasury.unrealizedPnl.toFixed(2)})`);
  console.log(`  = $${invariant.computed.toFixed(2)} (computed)`);
  console.log(`  totalEquity = $${invariant.reported.toFixed(2)} (reported)`);
  console.log(`  Delta: $${invariant.delta.toFixed(4)}`);
  if (invariant.valid) {
    console.log("  ✅ INVARIANT HOLDS");
  } else {
    console.error("  ❌ INVARIANT VIOLATED — database state is inconsistent!");
    process.exit(1);
  }

  console.log("\n===============================================================");
  console.log("🎉 AUTONOMOUS CYCLE COMPLETED — ALL STATE PERSISTED");
  console.log("   UI will now reflect the updated treasury and positions.");
  console.log("===============================================================\n");
}

main()
  .catch((err) => {
    console.error("\n❌ AUTONOMOUS CYCLE FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
