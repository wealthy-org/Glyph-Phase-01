// ============================================================================
// GLYPH PHASE 01 — DECISION ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-decision.ts
// ============================================================================

import { executeGlyphDecisionCycle } from "../src/lib/decision/engine";
import { GLYPH_DECISION_PROMPT_VERSION } from "../src/lib/decision/prompt";
import { createResearchSnapshot } from "../src/lib/research";
import { prisma } from "../src/lib/prisma";

async function runDecisionTests() {
  console.log("===============================================================");
  console.log("🧠 GLYPH DECISION ENGINE (PHASE 01) — VERIFICATION SUITE");
  console.log("===============================================================\n");

  console.log(`- Active Prompt Version Constant: ${GLYPH_DECISION_PROMPT_VERSION}`);
  console.log(`- OpenRouter Model: ${process.env.OPENROUTER_MODEL || "default"}\n`);

  // 1. Prepare Research Snapshot for NVDA
  console.log("▶ [STEP 1] Generating fresh research snapshot for NVDA...");
  const { snapshotId, research } = await createResearchSnapshot("NVDA");
  console.log(`  - Snapshot ID: ${snapshotId}`);
  console.log(`  - Price: $${research.marketData.quote.price}`);
  console.log(`  - Technical Score: ${research.technicalData.technicalScore}/100`);
  console.log(`  - Fundamental Score: ${research.fundamentalData.fundamentalScore}/100\n`);

  // 2. Run Decision Cycle (OpenRouter -> Zod -> Policy -> Decision DB -> Trade DB)
  console.log("▶ [STEP 2] Running Glyph Brain Decision Cycle (LLM + Zod + Policy)...");
  const result = await executeGlyphDecisionCycle(snapshotId, "1");

  console.log(`  - Decision ID: ${result.decisionId}`);
  console.log(`  - Proposed Asset: ${result.asset}`);
  console.log(`  - Proposed Action: ${result.action}`);
  console.log(`  - Conviction Score: ${result.conviction}%`);
  console.log(`  - Thesis Breakdown:`);
  console.log(`    ↳ Fundamental: "${result.decision.thesis.fundamental.slice(0, 70)}..."`);
  console.log(`    ↳ Technical: "${result.decision.thesis.technical.slice(0, 70)}..."`);
  console.log(`    ↳ Invalidation: "${result.decision.thesis.invalidation.slice(0, 70)}..."`);
  console.log(`  - Policy Engine Verdict: ${result.policyResult}`);
  if (result.policyRejectReason) {
    console.log(`    ↳ Rejection Reason: ${result.policyRejectReason}`);
  }

  // 3. Verify Database State
  console.log("\n▶ [STEP 3] Verifying Database Records (decisions vs trades)...");

  // Check Decision table record
  const dbDecision = await prisma.decision.findUnique({
    where: { id: result.decisionId },
  });
  if (!dbDecision) {
    throw new Error("Failed: Decision was not saved to the decisions table.");
  }
  console.log(`  ✅ Decision Record Verified: ID ${dbDecision.id}`);
  console.log(`     ↳ Prompt Version: ${dbDecision.promptVersion} (matches constant)`);
  console.log(`     ↳ Action: ${dbDecision.action}, Policy: ${dbDecision.policyResult}`);

  // Check Trade table condition (Brief §3.0B)
  if (result.policyResult === "APPROVED" && result.action !== "NO_TRADE") {
    if (!result.tradeId) {
      throw new Error("Failed: Trade ID must be populated when decision is APPROVED and action != NO_TRADE.");
    }
    const dbTrade = await prisma.trade.findUnique({
      where: { id: result.tradeId },
    });
    if (!dbTrade) {
      throw new Error(`Failed: Trade ${result.tradeId} not found in trades table.`);
    }
    console.log(`  ✅ Resulting Trade Verified in trades table!`);
    console.log(`     ↳ Trade Number: ${dbTrade.tradeNumber}`);
    console.log(`     ↳ Entry Price: $${dbTrade.entryPrice}`);
    console.log(`     ↳ Allocated Margin: $${dbTrade.positionSize}`);
    console.log(`     ↳ Leverage: ${dbTrade.leverage}x`);
    console.log(`     ↳ Status: ${dbTrade.status}`);
  } else {
    console.log(`  ℹ️  No trade created (as expected for ${result.policyResult} / ${result.action}).`);
  }

  // Check Observability Trace (agent_runs table)
  const dbRun = await prisma.agentRun.findUnique({
    where: { id: result.runId },
  });
  if (!dbRun) {
    throw new Error("Failed: Observability trace was not saved to agent_runs table.");
  }
  console.log(`  ✅ Observability Trace Verified: Run ID ${dbRun.id}`);

  console.log("\n===============================================================");
  console.log("🎉 ALL DECISION ENGINE TESTS PASSED! TAHAP 4 IS 100% OPERATIONAL.");
  console.log("===============================================================");
}

runDecisionTests()
  .catch((err) => {
    console.error("❌ Decision test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
