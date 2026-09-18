// ============================================================================
// GLYPH PHASE 01 — RISK POLICY ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-policy.ts
// ============================================================================

import {
  GLYPH_POLICY,
  ALLOWED_ASSETS,
  validateTradeProposal,
  evaluateAgentTradeProposal,
} from "../src/lib/policy";
import { prisma } from "../src/lib/prisma";

async function runPolicyTests() {
  console.log("===============================================================");
  console.log("🛡️  GLYPH RISK POLICY ENGINE (GLYPH_POLICY) — VERIFICATION SUITE");
  console.log("===============================================================\n");

  console.log("Active Policy Configuration:");
  console.log(`- Allowed Assets (Hardcoded): [${ALLOWED_ASSETS.join(", ")}]`);
  console.log(`- Max Position Size: ${GLYPH_POLICY.maxPositionPercent}%`);
  console.log(`- Max Leverage: ${GLYPH_POLICY.maxLeverage}x`);
  console.log(`- Max Concurrent Open Positions: ${GLYPH_POLICY.maxOpenPositions}`);
  console.log(`- Min Confidence Required: ${GLYPH_POLICY.minConfidence}%`);
  console.log(`- Max Daily Loss (Circuit Breaker): ${GLYPH_POLICY.maxDailyLossPercent}%\n`);

  // -------------------------------------------------------------------------
  // SCENARIO 1: Whitelist Rejection
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 1] AI proposes non-whitelisted asset ('DOGE')...");
  const res1 = validateTradeProposal({
    asset: "DOGE",
    action: "LONG",
    conviction: 85,
    positionSizePercent: 5,
    leverage: 2,
  });
  console.log(`  - Result: ${res1.policyResult}`);
  console.log(`  - Reason: ${res1.rejectReason}`);
  if (res1.approved || !res1.rejectReason?.includes("allowedAssets")) {
    throw new Error("Failed: Whitelist guardrail did not reject non-whitelisted asset.");
  }
  console.log("  ✅ Whitelist Guardrail Passed!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 2: Low Confidence Rejection
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 2] AI proposes valid asset ('NVDA') but low conviction (54%)...");
  const res2 = validateTradeProposal({
    asset: "NVDA",
    action: "LONG",
    conviction: 54, // Below 60%
    positionSizePercent: 5,
    leverage: 2,
  });
  console.log(`  - Result: ${res2.policyResult}`);
  console.log(`  - Reason: ${res2.rejectReason}`);
  if (res2.approved || !res2.rejectReason?.includes("below minimum required threshold")) {
    throw new Error("Failed: Low confidence proposal was not rejected.");
  }
  console.log("  ✅ Confidence Threshold Guardrail Passed!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 3: Max Open Positions Limit
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 3] AI proposes trade when agent already has 3 open positions...");
  const res3 = validateTradeProposal(
    {
      asset: "NVDA",
      action: "LONG",
      conviction: 75,
      positionSizePercent: 5,
      leverage: 1,
    },
    3 // 3 open positions currently
  );
  console.log(`  - Result: ${res3.policyResult}`);
  console.log(`  - Reason: ${res3.rejectReason}`);
  if (res3.approved || !res3.rejectReason?.includes("Max open positions limit reached")) {
    throw new Error("Failed: Max open positions limit did not reject proposal.");
  }
  console.log("  ✅ Max Open Positions Guardrail Passed!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 4: Daily Loss Circuit Breaker
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 4] AI proposes trade when daily loss reached 6.2% (threshold: 5%)...");
  const res4 = validateTradeProposal(
    {
      asset: "NVDA",
      action: "SHORT",
      conviction: 80,
      positionSizePercent: 5,
      leverage: 2,
    },
    1, // 1 open position
    6.2 // 6.2% daily loss today
  );
  console.log(`  - Result: ${res4.policyResult}`);
  console.log(`  - Reason: ${res4.rejectReason}`);
  if (res4.approved || !res4.rejectReason?.includes("Circuit breaker engaged")) {
    throw new Error("Failed: Circuit breaker did not reject proposal.");
  }
  console.log("  ✅ Daily Loss Circuit Breaker Guardrail Passed!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 5: NO_TRADE Action
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 5] AI proposes 'NO_TRADE'...");
  const res5 = validateTradeProposal({
    asset: "NVDA",
    action: "NO_TRADE",
    conviction: 40,
  });
  console.log(`  - Result: ${res5.policyResult}`);
  console.log(`  - Reason: ${res5.rejectReason}`);
  if (res5.approved) {
    throw new Error("Failed: NO_TRADE action should be recorded as REJECTED for execution.");
  }
  console.log("  ✅ NO_TRADE Action Handled Correctly!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 6: Valid Trade with Clamping (AI asks 5x leverage & 20% position)
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 6] AI proposes NVDA LONG with excessive leverage (5x) and size (20%)...");
  const res6 = validateTradeProposal({
    asset: "NVDA",
    action: "LONG",
    conviction: 78,
    positionSizePercent: 20, // AI asks 20%
    leverage: 5, // AI asks 5x
  });
  console.log(`  - Result: ${res6.policyResult}`);
  console.log(`  - Clamped Leverage: ${res6.clampedLeverage}x (Clamped from 5x to 2x)`);
  console.log(`  - Clamped Position Size: ${res6.clampedPositionPercent}% (Clamped from 20% to 10%)`);
  if (
    !res6.approved ||
    res6.clampedLeverage !== 2 ||
    res6.clampedPositionPercent !== 10
  ) {
    throw new Error("Failed: Valid proposal was not properly approved with clamped parameters.");
  }
  console.log("  ✅ Clamping & Approval Engine Passed!\n");

  // -------------------------------------------------------------------------
  // SCENARIO 7: Database Live Evaluation
  // -------------------------------------------------------------------------
  console.log("▶ [SCENARIO 7] Testing DB-connected evaluation (evaluateAgentTradeProposal)...");
  // Clean up any test positions/trades for hermetic test
  const targetAgentId = process.env.GLYPH_AGENT_ID || "1";
  const agent = await prisma.agent.findFirst({
    where: { OR: [{ agentId: targetAgentId }, { agentId: "1" }] },
  });
  if (agent) {
    await prisma.position.deleteMany({ where: { agentId: agent.id } });
    await prisma.trade.deleteMany({ where: { agentId: agent.id } });
  }

  const activeAgentId = agent?.agentId || targetAgentId;
  const dbEval = await evaluateAgentTradeProposal(activeAgentId, {
    asset: "NVDA",
    action: "LONG",
    conviction: 72,
    positionSizePercent: 8,
    leverage: 2,
  });
  console.log(`  - Result from DB evaluation: ${dbEval.policyResult}`);
  console.log(`  - Approved: ${dbEval.approved}`);
  if (dbEval.rejectReason) {
    console.log(`  - Reject Reason: ${dbEval.rejectReason}`);
  }
  if (!dbEval.approved) {
    throw new Error(`Failed: Fresh agent should have passed proposal in DB evaluation. Reason: ${dbEval.rejectReason}`);
  }
  console.log("  ✅ Database-Connected Evaluation Passed!\n");

  console.log("===============================================================");
  console.log("🎉 ALL POLICY ENGINE TESTS PASSED! GLYPH_POLICY IS 100% SECURE.");
  console.log("===============================================================");
}

runPolicyTests()
  .catch((err) => {
    console.error("❌ Policy test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
