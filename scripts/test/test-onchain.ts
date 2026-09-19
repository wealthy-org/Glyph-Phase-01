// ============================================================================
// GLYPH PHASE 01 — ONCHAIN PROOF VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-onchain.ts
// ============================================================================

import {
  calculateDecisionHash,
  canonicalJsonStringify,
} from "../../src/lib/onchain/hash";
import {
  commitDecisionOnchain,
  getExplorerTxUrl,
  robinhoodTestnet,
} from "../../src/lib/onchain/registry";
import { executeGlyphDecisionCycle } from "../../src/lib/decision/engine";
import { createResearchSnapshot } from "../../src/lib/research";
import { prisma } from "../../src/lib/prisma";

async function runOnchainTests() {
  console.log("===============================================================");
  console.log("⛓️  GLYPH ONCHAIN PROOF ENGINE (PHASE 01) — VERIFICATION SUITE");
  console.log("===============================================================\n");

  console.log(`- Target Network: ${robinhoodTestnet.name} (Chain ID: ${robinhoodTestnet.id})`);
  console.log(`- Contract: ${process.env.DECISION_REGISTRY_CONTRACT_ADDRESS || "0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525"}`);
  console.log(`- Block Explorer: ${robinhoodTestnet.blockExplorers.default.url}\n`);

  // -------------------------------------------------------------------------
  // TEST 1: Deterministic Canonical JSON & keccak256 Hash
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Testing Canonical Serialization & keccak256 Hashing...");

  const payloadA = {
    decisionId: "dec-001",
    agentId: "1",
    asset: "NVDA",
    action: "LONG" as const,
    conviction: 82,
    thesis: {
      fundamental: "Strong GPU data center revenue momentum.",
      technical: "Bullish breakout above 20d moving average.",
      catalyst: "Earnings release and AI infrastructure CAPEX.",
      risk: "Macro drag or sudden valuation multiple compression.",
      invalidation: "Breakdown below $110 support level.",
    },
    policyResult: "APPROVED" as const,
    promptVersion: "V1",
    createdAt: "2026-09-18T00:00:00.000Z",
  };

  // In payloadB, keys are purposely scrambled to verify canonical sorting
  const payloadB = {
    createdAt: "2026-09-18T00:00:00.000Z",
    asset: "NVDA",
    conviction: 82,
    decisionId: "dec-001",
    policyResult: "APPROVED" as const,
    promptVersion: "V1",
    agentId: "1",
    action: "LONG" as const,
    thesis: {
      invalidation: "Breakdown below $110 support level.",
      risk: "Macro drag or sudden valuation multiple compression.",
      catalyst: "Earnings release and AI infrastructure CAPEX.",
      fundamental: "Strong GPU data center revenue momentum.",
      technical: "Bullish breakout above 20d moving average.",
    },
  };

  const hashA = calculateDecisionHash(payloadA);
  const hashB = calculateDecisionHash(payloadB);

  console.log(`  - Canonical Hash A: ${hashA.decisionHash}`);
  console.log(`  - Canonical Hash B: ${hashB.decisionHash}`);

  if (hashA.decisionHash !== hashB.decisionHash) {
    throw new Error("Failed: Canonical hashing did not produce identical hashes for scrambled keys.");
  }
  if (!hashA.decisionHash.startsWith("0x") || hashA.decisionHash.length !== 66) {
    throw new Error("Failed: keccak256 hash must be a valid 32-byte hex string (66 chars).");
  }
  console.log("  ✅ Canonical Hash Invariance Verified!\n");

  // -------------------------------------------------------------------------
  // TEST 2: End-to-End Decision Cycle with Automatic Onchain Commitment
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 2] Executing Full Cycle: Research -> Brain -> Onchain Commit...");

  const { snapshotId } = await createResearchSnapshot("NVDA");
  console.log(`  - Research Snapshot Created: ${snapshotId}`);

  const agentId = process.env.GLYPH_AGENT_ID || "1";
  const cycleResult = await executeGlyphDecisionCycle(snapshotId, agentId);

  console.log(`  - Decision ID: ${cycleResult.decisionId}`);
  console.log(`  - Action: ${cycleResult.action} (Policy: ${cycleResult.policyResult})`);
  console.log(`  - Decision Hash: ${cycleResult.decisionHash}`);
  console.log(`  - Transaction Hash: ${cycleResult.transactionHash}`);
  console.log(`  - Block Explorer Link: ${cycleResult.explorerUrl}`);

  if (!cycleResult.decisionHash || !cycleResult.transactionHash) {
    throw new Error("Failed: Decision cycle did not return decisionHash or transactionHash.");
  }
  console.log("  ✅ Decision Committed Onchain Successfully!\n");

  // -------------------------------------------------------------------------
  // TEST 3: Database Verification (decisions, trades, transactions)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 3] Verifying Database Proof Records...");

  // 3.1 Verify decisions table
  const dbDecision = await prisma.decision.findUnique({
    where: { id: cycleResult.decisionId },
  });
  if (!dbDecision?.decisionHash || !dbDecision?.transactionHash) {
    throw new Error("Failed: Decision table does not have decisionHash or transactionHash.");
  }
  console.log(`  ✅ decisions table verified (tx: ${dbDecision.transactionHash.slice(0, 18)}...)`);

  // 3.2 Verify trades table (if approved and not NO_TRADE)
  if (cycleResult.tradeId) {
    const dbTrade = await prisma.trade.findUnique({
      where: { id: cycleResult.tradeId },
    });
    if (!dbTrade?.decisionHash || !dbTrade?.transactionHash) {
      throw new Error("Failed: Trade table does not have decisionHash or transactionHash.");
    }
    console.log(`  ✅ trades table verified for ${dbTrade.tradeNumber} (tx: ${dbTrade.transactionHash.slice(0, 18)}...)`);
  }

  // 3.3 Verify transactions table (§18)
  const dbTx = await prisma.transaction.findUnique({
    where: { transactionHash: cycleResult.transactionHash },
  });
  if (!dbTx) {
    throw new Error(`Failed: Transaction record ${cycleResult.transactionHash} not found in transactions table.`);
  }
  console.log(`  ✅ transactions table record verified!`);
  console.log(`     ↳ Tx Hash: ${dbTx.transactionHash}`);
  console.log(`     ↳ Chain ID: ${dbTx.chainId}`);
  console.log(`     ↳ Block: ${dbTx.blockNumber}`);
  console.log(`     ↳ Event: ${dbTx.eventType}`);

  // 3.4 Verify Explorer URL formatting (§12)
  const explorerUrl = getExplorerTxUrl(dbTx.transactionHash);
  console.log(`  ✅ "Verify Onchain" Explorer URL: ${explorerUrl}`);
  if (!explorerUrl.includes(dbTx.transactionHash)) {
    throw new Error("Failed: Explorer URL does not contain transaction hash.");
  }

  console.log("\n===============================================================");
  console.log("🎉 ALL ONCHAIN PROOF TESTS PASSED! TAHAP 5 IS 100% OPERATIONAL.");
  console.log("===============================================================");
}

runOnchainTests()
  .catch((err) => {
    console.error("❌ Onchain test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
