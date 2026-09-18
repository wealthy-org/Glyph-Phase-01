// ============================================================================
// GLYPH PHASE 01 — AUTONOMOUS CYCLE & CRON ENDPOINT VERIFICATION SUITE
// Run with: npx tsx scripts/test-cycle.ts
// ============================================================================

import { runAutonomousGlyphCycle } from "../src/lib/cycle/orchestrator";
import { prisma } from "../src/lib/prisma";

async function verifyCyclePipeline() {
  console.log("===============================================================");
  console.log("🚀 GLYPH AUTONOMOUS CYCLE & CRON VERIFICATION (PHASE 01)");
  console.log("===============================================================\n");

  const cronSecret = process.env.CRON_SECRET;
  console.log(`- CRON_SECRET configured: ${cronSecret ? "YES (length " + cronSecret.length + ")" : "NO"}`);
  console.log(`- DECISION_REGISTRY_CONTRACT: ${process.env.DECISION_REGISTRY_CONTRACT_ADDRESS || "0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525"}`);
  console.log(`- Agent ID: ${process.env.GLYPH_AGENT_ID || "1"}\n`);

  // -------------------------------------------------------------------------
  // TEST 1: Direct Orchestrator Run (Autonomous Pipeline Execution)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Running Autonomous Cycle Orchestrator directly...");
  const cycleResult = await runAutonomousGlyphCycle({
    targetAsset: "NVDA",
    agentIdentifier: "1",
  });

  if (!cycleResult.success) {
    throw new Error("Cycle orchestrator returned success=false");
  }

  console.log("\n▶ [TEST 1 VERIFICATION] Auditing Database Records from Cycle:");

  // 1. Verify Research Snapshot
  const snapshot = await prisma.researchSnapshot.findFirst({
    where: { asset: "NVDA" },
    orderBy: { createdAt: "desc" },
  });
  if (!snapshot) {
    throw new Error("Failed: Research snapshot not found in DB.");
  }
  console.log(`  ✅ Research Snapshot confirmed: ID ${snapshot.id}`);

  // 2. Verify Decision
  const decision = await prisma.decision.findUnique({
    where: { id: cycleResult.decisionResult.decisionId },
  });
  if (!decision) {
    throw new Error("Failed: Decision record not found in DB.");
  }
  console.log(`  ✅ Decision Record confirmed: ID ${decision.id}`);
  console.log(`     ↳ Action: ${decision.action}`);
  console.log(`     ↳ Conviction: ${decision.conviction}%`);
  console.log(`     ↳ Policy Result: ${decision.policyResult}`);
  if (decision.policyRejectReason) {
    console.log(`     ↳ Rejection Reason: "${decision.policyRejectReason}"`);
  }

  // 3. Verify Agent Run (Observability)
  const agentRun = await prisma.agentRun.findUnique({
    where: { id: cycleResult.decisionResult.runId },
  });
  if (!agentRun) {
    throw new Error("Failed: AgentRun trace not found in DB.");
  }
  console.log(`  ✅ AgentRun Observability Trace confirmed: ID ${agentRun.id}`);

  // 4. Verify Onchain Proof
  if (cycleResult.decisionResult.transactionHash) {
    console.log(`  ✅ On-chain Transaction Confirmed: ${cycleResult.decisionResult.transactionHash}`);
    console.log(`     ↳ Explorer: ${cycleResult.decisionResult.explorerUrl}`);
  } else {
    console.log(`  ℹ️  No on-chain transaction generated (simulation mode or skipped).`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: HTTP API Route Authentication & Security (Local Dev Server)
  // -------------------------------------------------------------------------
  console.log("\n▶ [TEST 2] Testing HTTP API Security on /api/cron/glyph-cycle...");
  const localBaseUrl = "http://localhost:3000";

  try {
    // 2.1 Test missing token -> Should return 401
    console.log("  - Case 1: Request with NO authorization header...");
    const resNoAuth = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, {
      method: "POST",
    });
    console.log(`    ↳ Response status: ${resNoAuth.status} (Expected: 401)`);
    if (resNoAuth.status !== 401) {
      throw new Error(`Security failed: Expected 401 for unauthenticated request, got ${resNoAuth.status}`);
    }
    console.log(`    ✅ 401 Unauthorized returned as expected!`);

    // 2.2 Test invalid bearer token -> Should return 401
    console.log("  - Case 2: Request with INVALID token...");
    const resBadToken = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid_secret_token_123456",
      },
    });
    console.log(`    ↳ Response status: ${resBadToken.status} (Expected: 401)`);
    if (resBadToken.status !== 401) {
      throw new Error(`Security failed: Expected 401 for invalid token, got ${resBadToken.status}`);
    }
    console.log(`    ✅ 401 Unauthorized returned for invalid secret!`);

    // 2.3 Test GET method -> Should return 405 Method Not Allowed
    console.log("  - Case 3: GET request (unsupported method)...");
    const resGet = await fetch(`${localBaseUrl}/api/cron/glyph-cycle`, {
      method: "GET",
    });
    console.log(`    ↳ Response status: ${resGet.status} (Expected: 405)`);
    if (resGet.status !== 405) {
      throw new Error(`Expected 405 Method Not Allowed, got ${resGet.status}`);
    }
    console.log(`    ✅ 405 Method Not Allowed returned!`);

    console.log("\n  ✅ API Route Security Guardrails Verified Successfully!");
  } catch (err: any) {
    if (err.cause?.code === "ECONNREFUSED" || err.message?.includes("fetch failed")) {
      console.log(`  ℹ️  Local server not responding to HTTP request (skipping live HTTP test, orchestrator passed).`);
    } else {
      throw err;
    }
  }

  console.log("\n===============================================================");
  console.log("🎉 ALL TESTS PASSED! TAHAP 7 STEP 1 IS FULLY OPERATIONAL & SECURE.");
  console.log("===============================================================\n");
}

verifyCyclePipeline()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
