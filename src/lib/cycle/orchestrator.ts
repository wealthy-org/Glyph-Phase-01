// ============================================================================
// GLYPH PHASE 01 — AUTONOMOUS CYCLE ORCHESTRATOR
// Derived from: BRIEF.md (§3.0B, §3.5, §3.7, §7, §8, §10, §12, §19, §25)
// and TODO.md (Tahap 7 line 122-126)
//
// Orchestrates the complete daily autonomous loop:
// 1. Check open positions & update market prices (floating PnL / liquidations)
// 2. Perform fresh market research & create immutable snapshot
// 3. Consult LLM (Glyph Brain) with past memories
// 4. Validate proposal via deterministic Policy Engine
// 5. Open/close simulated position & adjust treasury balance
// 6. Commit decision hash on-chain (DecisionRegistry on Robinhood Testnet)
// 7. Record observability trace in agent_runs table
// ============================================================================

import { DecisionRunResult, executeGlyphDecisionCycle } from "@/lib/decision/engine";
import { AlphaVantageProvider } from "@/lib/market/alpha-vantage";
import { ALLOWED_ASSETS } from "@/lib/policy";
import {
  getActivePositions,
  updatePositionsMarketPrices,
} from "@/lib/portfolio";
import { prisma } from "@/lib/prisma";
import { createResearchSnapshot } from "@/lib/research";

export interface CycleOptions {
  agentIdentifier?: string; // Default: "1"
  targetAsset?: string;      // Whitelisted asset, default: "NVDA"
  cycleKey?: string;
}

export interface CycleSummary {
  success: boolean;
  cycleKey: string;
  timestamp: string;
  agentId: string;
  targetAsset: string;
  positionsChecked: number;
  liquidatedCount: number;
  decisionResult: DecisionRunResult;
  executionDurationMs: number;
}

/**
 * Runs the complete autonomous cycle for Glyph.
 */
export async function runAutonomousGlyphCycle(
  options: CycleOptions = {}
): Promise<CycleSummary> {
  const startTime = Date.now();
  const agentIdentifier = options.agentIdentifier || process.env.GLYPH_AGENT_ID || "1";
  const marketProvider = new AlphaVantageProvider();

  // 1. Verify agent existence
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: { treasury: true, policy: true },
  });

  if (!agent) {
    throw new Error(`Agent #${agentIdentifier} not found in database.`);
  }

  const cycleKey = options.cycleKey || `${agentIdentifier}:${new Date().toISOString().slice(0, 10)}`;
  const claimedRun = await prisma.agentRun.create({
    data: { agentId: agent.id, cycleKey, startedAt: new Date() },
  });

  // Determine target asset for research & decision
  let selectedAsset = (options.targetAsset || "NVDA").toUpperCase();
  if (!(ALLOWED_ASSETS as readonly string[]).includes(selectedAsset)) {
    console.warn(
      `[Cycle] Asset '${selectedAsset}' not in ALLOWED_ASSETS. Defaulting to 'NVDA'.`
    );
    selectedAsset = "NVDA";
  }

  console.log(`\n===============================================================`);
  console.log(`🤖 GLYPH AUTONOMOUS CYCLE STARTING (AGENT #${agentIdentifier})`);
  console.log(`🎯 Target Asset for Decision: ${selectedAsset}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`===============================================================\n`);

  let positionsChecked = 0;
  let liquidatedCount = 0;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Check Open Positions & Update Floating PnL / Liquidations
    // -------------------------------------------------------------------------
    console.log(`▶ [STEP 1] Auditing active portfolio positions...`);
    const activeData = await getActivePositions(agentIdentifier);
    const activePositions = activeData.positions;
    positionsChecked = activePositions.length;

    if (activePositions.length > 0) {
      console.log(`  - Found ${activePositions.length} open position(s). Fetching live quotes...`);
      const uniqueAssets = Array.from(new Set(activePositions.map((p) => p.asset)));
      const quotes: Record<string, number> = {};

      for (const sym of uniqueAssets) {
        try {
          const q = await marketProvider.getQuote(sym);
          quotes[sym] = q.price;
          console.log(`    ↳ ${sym} current price: $${q.price}`);
        } catch (err: any) {
          console.warn(`    ⚠️ Failed to fetch quote for open position asset ${sym}:`, err.message);
        }
      }

      if (Object.keys(quotes).length > 0) {
        const updateResult = await updatePositionsMarketPrices(quotes, agentIdentifier);
        liquidatedCount = updateResult.liquidatedCount;
        console.log(
          `  ✅ Evaluated ${updateResult.updatedCount} position(s). Liquidations: ${liquidatedCount}`
        );
      }
    } else {
      console.log(`  ℹ️ No active positions currently open.`);
    }

    // -------------------------------------------------------------------------
    // STEP 2: Execute Fresh Market Research & Save Immutable Snapshot
    // -------------------------------------------------------------------------
    console.log(`\n▶ [STEP 2] Conducting deep market research for ${selectedAsset}...`);
    const { snapshotId, research } = await createResearchSnapshot(selectedAsset, marketProvider);
    console.log(`  ✅ Research Snapshot created (ID: ${snapshotId})`);
    console.log(`     ↳ Price: $${research.marketData.quote.price}`);
    console.log(`     ↳ Technical Trend: ${research.technicalData.trend}`);
    console.log(`     ↳ Technical Score: ${research.technicalData.technicalScore}/100`);
    console.log(`     ↳ Fundamental Score: ${research.fundamentalData.fundamentalScore}/100`);

    // -------------------------------------------------------------------------
    // STEP 3: Execute Reasoning, Policy Gate, Paper Trade, & On-Chain Proof
    // -------------------------------------------------------------------------
    console.log(`\n▶ [STEP 3] Running Glyph Brain reasoning & policy gate...`);
    const decisionResult = await executeGlyphDecisionCycle(snapshotId, agentIdentifier, claimedRun.id);

    console.log(`  ✅ Decision reached:`);
    console.log(`     ↳ Action: ${decisionResult.action}`);
    console.log(`     ↳ Conviction: ${decisionResult.conviction}%`);
    console.log(`     ↳ Policy Result: ${decisionResult.policyResult}`);
    if (decisionResult.policyRejectReason) {
      console.log(`     ↳ Rejection Reason: "${decisionResult.policyRejectReason}"`);
    }
    if (decisionResult.tradeId) {
      console.log(`     ↳ Trade Created: ${decisionResult.tradeNumber} (ID: ${decisionResult.tradeId})`);
    } else {
      console.log(`     ↳ Trade: None (Position not opened)`);
    }

    if (decisionResult.transactionHash) {
      console.log(`  ⛓️  On-chain Proof Committed:`);
      console.log(`     ↳ Tx Hash: ${decisionResult.transactionHash}`);
      console.log(`     ↳ Explorer: ${decisionResult.explorerUrl || "N/A"}`);
    }

    const duration = Date.now() - startTime;
    console.log(`\n===============================================================`);
    console.log(`🎉 GLYPH CYCLE COMPLETED SUCCESSFULLY IN ${duration}ms`);
    console.log(`===============================================================\n`);

    return {
      success: true,
      cycleKey,
      timestamp: new Date().toISOString(),
      agentId: agentIdentifier,
      targetAsset: selectedAsset,
      positionsChecked,
      liquidatedCount,
      decisionResult,
      executionDurationMs: duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ [Cycle Error] Glyph Autonomous Cycle failed:`, error);

    // Record failure in agent_runs table so no run is silently dropped (Brief §25)
    try {
      await prisma.agentRun.update({
        where: { id: claimedRun.id },
        data: {
          completedAt: new Date(),
          cycleKey: null,
          error: error.message || String(error),
          errorCode: error.code || "CYCLE_EXECUTION_FAILURE",
        },
      });
    } catch (logErr) {
      console.error(`Failed to record error trace in agent_runs:`, logErr);
    }

    throw error;
  }
}
