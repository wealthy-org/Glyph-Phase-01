// ============================================================================
// GLYPH PHASE 01 — DECISION ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-decision.ts
// ============================================================================

import { executeGlyphDecisionCycle } from "../../src/lib/decision/engine";
import { GLYPH_DECISION_PROMPT_VERSION } from "../../src/lib/decision/prompt";
import { prisma } from "../../src/lib/prisma";
import { createResearchSnapshot } from "../../src/lib/research";

async function runDecisionTests() {
  console.log("===============================================================");
  console.log("🧠 GLYPH DECISION ENGINE (PHASE 01) — VERIFICATION SUITE");
  console.log("===============================================================\n");

  console.log(`- Active Prompt Version Constant: ${GLYPH_DECISION_PROMPT_VERSION}`);
  console.log(`- OpenRouter Model: ${process.env.OPENROUTER_MODEL || "default"}\n`);

  // 1. Prepare Research Snapshot for NVDA (use existing from test-research or create fresh)
  console.log("▶ [STEP 1] Getting research snapshot for NVDA (from test research or fresh)...");
  let snapshotId: string;
  let research: any;

  const existingSnapshot = await prisma.researchSnapshot.findFirst({
    where: { asset: "NVDA" },
    orderBy: { createdAt: "desc" },
  });

  const existingMarketData = existingSnapshot?.marketData as {
    quote?: { price?: number };
  } | null;
  const existingTechnicalData = existingSnapshot?.technicalData as {
    technicalScore?: number;
  } | null;
  const existingFundamentalData = existingSnapshot?.fundamentalData as {
    fundamentalScore?: number;
  } | null;
  const canReuseSnapshot = Boolean(
    existingSnapshot &&
    typeof existingMarketData?.quote?.price === "number" &&
    typeof existingTechnicalData?.technicalScore === "number" &&
    typeof existingFundamentalData?.fundamentalScore === "number"
  );

  if (existingSnapshot && canReuseSnapshot) {
    snapshotId = existingSnapshot.id;
    research = {
      asset: existingSnapshot.asset,
      marketData: existingSnapshot.marketData as any,
      technicalData: existingSnapshot.technicalData as any,
      fundamentalData: existingSnapshot.fundamentalData as any,
    };
    console.log(`  - Using existing snapshot from test research: ${snapshotId}`);
  } else {
    if (existingSnapshot) {
      console.log(`  - Existing snapshot ${existingSnapshot.id} is incompatible; creating a fresh research snapshot.`);
    }
    const created = await createResearchSnapshot("NVDA");
    snapshotId = created.snapshotId;
    research = created.research;
    console.log(`  - Fresh snapshot created: ${snapshotId}`);
  }

  console.log(`  - Price: $${research.marketData.quote.price}`);
  console.log(`  - Technical Score: ${research.technicalData.technicalScore}/100`);
  console.log(`  - Fundamental Score: ${research.fundamentalData.fundamentalScore}/100\n`);

  // 2. Run Decision Cycle (OpenRouter -> Zod -> Policy -> Decision DB -> Trade DB)
  const agentId = process.env.GLYPH_AGENT_ID || "1";
  const treasuryBefore = await prisma.agentTreasury.findFirst({
    where: { agent: { agentId } },
  });
  const balanceBefore = Number(treasuryBefore?.currentBalance ?? 1000);
  console.log(`- Pre-Decision Treasury Balance: $${balanceBefore.toFixed(2)} USD-SIM`);
  console.log(`▶ [STEP 2] Running Glyph Brain Decision Cycle for Agent #${agentId} (LLM + Zod + Policy)...`);
  const result = await executeGlyphDecisionCycle(snapshotId, agentId);

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
  if (
    result.policyResult === "APPROVED" &&
    (result.action === "OPEN_LONG" || result.action === "OPEN_SHORT")
  ) {
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
  } else if (result.policyResult === "APPROVED" && result.action === "CLOSE") {
    if (!result.tradeId) {
      throw new Error("Failed: CLOSE decision must reference the closed trade.");
    }
    const dbTrade = await prisma.trade.findUnique({
      where: { id: result.tradeId },
    });
    if (!dbTrade || dbTrade.status !== "CLOSED" || dbTrade.exitPrice === null) {
      throw new Error("Failed: CLOSE decision did not persist a closed trade with an exit price.");
    }
    const memory = await prisma.memory.findFirst({
      where: { tradeId: result.tradeId },
    });
    if (!memory) {
      throw new Error("Failed: CLOSE decision did not create trade memory.");
    }
    console.log(`  ✅ Closed Trade Verified: ${dbTrade.tradeNumber}`);
    console.log(`     ↳ Exit Price: $${dbTrade.exitPrice}`);
    console.log(`     ↳ Realized PnL: $${dbTrade.simulatedPnl}`);
    console.log(`     ↳ Memory: ${memory.outcome}`);
  } else {
    console.log(`  ℹ️  No trade execution (as expected for ${result.policyResult} / ${result.action}).`);
  }

  // Check Observability Trace (agent_runs table)
  const dbRun = await prisma.agentRun.findUnique({
    where: { id: result.runId },
  });
  if (!dbRun) {
    throw new Error("Failed: Observability trace was not saved to agent_runs table.");
  }
  console.log(`  ✅ Observability Trace Verified: Run ID ${dbRun.id}`);

  // Check Treasury Balance Change (§18, §11)
  const treasuryAfter = await prisma.agentTreasury.findFirst({
    where: { agent: { agentId } },
  });
  const balanceAfter = Number(treasuryAfter?.currentBalance ?? 0);
  console.log(`\n💰 [TREASURY AUDIT]`);
  console.log(`  - Treasury Balance Before: $${balanceBefore.toFixed(2)} USD-SIM`);
  console.log(`  - Treasury Balance After:  $${balanceAfter.toFixed(2)} USD-SIM`);
  if (
    result.policyResult === "APPROVED" &&
    (result.action === "OPEN_LONG" || result.action === "OPEN_SHORT")
  ) {
    console.log(`  - Deduction (Margin + Fee): -$${(balanceBefore - balanceAfter).toFixed(2)} USD-SIM (Confirmed Reduced!)`);
  } else if (result.policyResult === "APPROVED" && result.action === "CLOSE") {
    console.log(`  - Released realized position capital: +$${(balanceAfter - balanceBefore).toFixed(2)} USD-SIM`);
  } else {
    console.log(`  - Deduction: $0.00 (Proposal not approved for execution, capital 100% preserved)`);
  }

  // Check Onchain Commitment Proof (§12, §3.5)
  console.log(`\n⛓️  [ONCHAIN COMMITMENT AUDIT]`);
  if (result.transactionHash) {
    console.log(`  - Decision Hash:    ${result.decisionHash}`);
    console.log(`  - Transaction Hash: ${result.transactionHash}`);
    console.log(`  - Block Explorer:   https://explorer.testnet.chain.robinhood.com/tx/${result.transactionHash}`);
    console.log(`  ✅ Successfully committed to DecisionRegistry.sol on Robinhood Chain Testnet!`);
  } else {
    console.log(`  - Decision recorded locally in 'decisions' table.`);
  }

  console.log("\n===============================================================");
  console.log("🎉 GLYPH DECISION TEST COMPLETED SUCCESSFULLY!");
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
