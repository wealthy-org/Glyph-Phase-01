// ============================================================================
// GLYPH PHASE 01 — HISTORICAL RESEARCH SELECTION TEST SUITE
// Verifies 6 critical requirements:
// 1. Correct asset filtering (strict isolation)
// 2. Chronological ordering (newest -> previous -> oldest)
// 3. Insufficient snapshots (< 3 -> NO_TRADE)
// 4. Cross-asset contamination prevention
// 5. Exact historical references persisted
// 6. Immutability of past decision references when new snapshots arrive
// ============================================================================

import { prisma } from "../../src/lib/prisma";
import {
  getHistoricalResearchSnapshots,
  validateSnapshotCandidate,
  formatHistoricalResearchForPrompt,
} from "../../src/lib/research/historical-context";
import { runSingleAssetDecision } from "../glyph-decision/llm-decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
}

const TEST_PREFIX = `TST_${Date.now().toString().slice(-6)}`;

async function createMockSnapshot(
  asset: string,
  createdAt: Date,
  cycleId: string,
  price = 100
) {
  return prisma.researchSnapshot.create({
    data: {
      asset: asset.toUpperCase(),
      cycleId,
      createdAt,
      marketData: {
        quote: {
          price,
          change: 1.5,
          changePercent: 1.5,
          volume: 5000000,
          low: price - 2,
          high: price + 2,
        },
      },
      fundamentalData: {
        marketCap: 2000000000,
        peRatio: 30,
        revenueGrowthPercent: 25,
        profitMarginPercent: 20,
        earningsPerShare: 3.5,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
        sentimentAverage: 0.5,
        keyHeadlines: ["Strong earnings reported"],
        fundamentalScore: 80,
      },
      technicalData: {
        trend: "BULLISH",
        sma20: price - 1,
        sma50: price - 3,
        rsi14: 60,
        supportLevel: price - 5,
        resistanceLevel: price + 5,
        volatilityPercent: 2.1,
        volumeRatio: 1.2,
        technicalScore: 75,
      },
      newsData: [],
      sourceMetadata: {
        provider: "StockFit Free + Twelve Data Free",
        dataQuality: "PROVIDER_DATA",
        riskContext: {
          regime: "bullish",
          level: "moderate",
        },
      },
    },
  });
}

async function runTests() {
  console.log("===============================================================");
  console.log("🧪 STARTING HISTORICAL RESEARCH CONTEXT TEST SUITE");
  console.log(`🔑 Test Run Prefix: ${TEST_PREFIX}`);
  console.log("===============================================================\n");

  const createdSnapshotIds: string[] = [];
  const createdDecisionIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Correct Asset Filtering (Strict Isolation)
    // -------------------------------------------------------------------------
    console.log("▶ TEST 1: Correct Asset Filtering...");
    const assetA = `${TEST_PREFIX}_NVDA`;
    const assetB = `${TEST_PREFIX}_AAPL`;
    const assetC = `${TEST_PREFIX}_MSFT`;

    const baseTime = Date.now();
    const s1 = await createMockSnapshot(assetA, new Date(baseTime + 5000), "cycle-1", 105);
    const s2 = await createMockSnapshot(assetB, new Date(baseTime + 4000), "cycle-2", 150);
    const s3 = await createMockSnapshot(assetA, new Date(baseTime + 3000), "cycle-3", 103);
    const s4 = await createMockSnapshot(assetC, new Date(baseTime + 2000), "cycle-4", 300);
    const s5 = await createMockSnapshot(assetA, new Date(baseTime + 1000), "cycle-5", 100);

    createdSnapshotIds.push(s1.id, s2.id, s3.id, s4.id, s5.id);

    const filterResult = await getHistoricalResearchSnapshots(assetA, 3);
    assert(filterResult.ok === true, "Filter result should be ok");
    if (filterResult.ok) {
      assert(filterResult.snapshots.length === 3, "Should return exactly 3 snapshots");
      assert(
        filterResult.snapshots.every((s) => s.asset === assetA),
        "Every returned snapshot must strictly belong to target asset"
      );
      assert(
        !filterResult.snapshots.some((s) => s.asset === assetB || s.asset === assetC),
        "Never include snapshots from other assets"
      );
      assert(filterResult.snapshotIds[0] === s1.id, "First snapshot should be s1");
      assert(filterResult.snapshotIds[1] === s3.id, "Second snapshot should be s3");
      assert(filterResult.snapshotIds[2] === s5.id, "Third snapshot should be s5");
    }
    console.log("  ✅ PASS: Strict asset isolation verified. Other assets excluded.\n");

    // -------------------------------------------------------------------------
    // TEST 2: Chronological Ordering (Newest -> Previous -> Oldest)
    // -------------------------------------------------------------------------
    console.log("▶ TEST 2: Chronological Ordering...");
    if (filterResult.ok) {
      const [newest, previous, oldest] = filterResult.snapshots;
      assert(
        newest.createdAt.getTime() > previous.createdAt.getTime(),
        "Newest snapshot must have newer timestamp than previous"
      );
      assert(
        previous.createdAt.getTime() > oldest.createdAt.getTime(),
        "Previous snapshot must have newer timestamp than oldest"
      );
      const promptBlock = formatHistoricalResearchForPrompt(filterResult.snapshots);
      assert(promptBlock.includes("1. Latest Research (Newest)"), "Prompt format includes label 1");
      assert(promptBlock.includes("2. Previous Research"), "Prompt format includes label 2");
      assert(promptBlock.includes("3. Older Research (Oldest)"), "Prompt format includes label 3");
    }
    console.log("  ✅ PASS: Snapshots strictly ordered newest → previous → oldest.\n");

    // -------------------------------------------------------------------------
    // TEST 3: Insufficient Snapshots (< 3 -> NO_TRADE)
    // -------------------------------------------------------------------------
    console.log("▶ TEST 3: Insufficient Snapshots (< 3 -> NO_TRADE)...");
    const assetSparse = `${TEST_PREFIX}_SPARSE`;
    const sparse1 = await createMockSnapshot(assetSparse, new Date(baseTime + 2000), "sparse-1");
    const sparse2 = await createMockSnapshot(assetSparse, new Date(baseTime + 1000), "sparse-2");
    createdSnapshotIds.push(sparse1.id, sparse2.id);

    const sparseResult = await getHistoricalResearchSnapshots(assetSparse, 3);
    assert(sparseResult.ok === false, "Sparse query must return ok: false");
    if (!sparseResult.ok) {
      assert(sparseResult.availableSnapshots === 2, "Should report 2 available snapshots");
      assert(sparseResult.requiredSnapshots === 3, "Should report 3 required snapshots");
      assert(
        sparseResult.reason.includes("Insufficient historical research"),
        "Reason must state insufficient historical research"
      );
    }

    const decisionSparse = await runSingleAssetDecision(assetSparse, true);
    assert(decisionSparse.action === "NO_TRADE", "Action must be NO_TRADE when snapshots < 3");
    assert(decisionSparse.conviction === 0, "Conviction must be 0 for insufficient history");
    assert(
      decisionSparse.insufficientHistory?.reason === "INSUFFICIENT_HISTORICAL_RESEARCH",
      "insufficientHistory reason must be recorded"
    );
    console.log("  ✅ PASS: Insufficient snapshots (< 3) cleanly triggers NO_TRADE.\n");

    // -------------------------------------------------------------------------
    // TEST 4: Cross-Asset Contamination Prevention
    // -------------------------------------------------------------------------
    console.log("▶ TEST 4: Cross-Asset Contamination Prevention...");
    const assetContam = `${TEST_PREFIX}_CONTAM`;
    const assetOther = `${TEST_PREFIX}_OTHER`;

    // Target has only 2 snapshots
    const c1 = await createMockSnapshot(assetContam, new Date(baseTime + 2000), "c-1");
    const c2 = await createMockSnapshot(assetContam, new Date(baseTime + 1000), "c-2");
    createdSnapshotIds.push(c1.id, c2.id);

    // Other asset has 10 snapshots
    for (let i = 0; i < 10; i++) {
      const o = await createMockSnapshot(assetOther, new Date(baseTime + i * 100), `other-${i}`);
      createdSnapshotIds.push(o.id);
    }

    const contamResult = await getHistoricalResearchSnapshots(assetContam, 3);
    assert(
      contamResult.ok === false,
      "Target asset with 2 snapshots must fail even if other assets have 10+"
    );
    if (!contamResult.ok) {
      assert(contamResult.availableSnapshots === 2, "Only target asset snapshots are counted");
      assert(
        contamResult.snapshots.every((s) => s.asset === assetContam),
        "Returned candidate snapshots must never contain other assets"
      );
    }
    console.log("  ✅ PASS: Other asset records are never borrowed to satisfy minimum 3.\n");

    // -------------------------------------------------------------------------
    // TEST 5: Exact Historical References Persisted
    // -------------------------------------------------------------------------
    console.log("▶ TEST 5: Exact Historical References Persisted...");
    const agent = await prisma.agent.findFirst({ select: { id: true } });
    if (!agent) throw new Error("No agent found in database");

    const assetPersist = `${TEST_PREFIX}_PERSIST`;
    const p1 = await createMockSnapshot(assetPersist, new Date(baseTime + 3000), "p-1");
    const p2 = await createMockSnapshot(assetPersist, new Date(baseTime + 2000), "p-2");
    const p3 = await createMockSnapshot(assetPersist, new Date(baseTime + 1000), "p-3");
    createdSnapshotIds.push(p1.id, p2.id, p3.id);

    const persistHistory = await getHistoricalResearchSnapshots(assetPersist, 3);
    assert(persistHistory.ok === true, "Persist history must be ok");

    if (persistHistory.ok) {
      const createdDecision = await prisma.decision.create({
        data: {
          agentId: agent.id,
          asset: assetPersist,
          action: "OPEN_LONG",
          conviction: 85,
          thesis: {
            fundamental: "Strong margin expansion",
            technical: "Bullish breakout above SMA20",
            risk: "Low regime volatility",
            invalidation: "Drop below support level",
            researchSnapshotIds: persistHistory.snapshotIds,
          },
          policyResult: "APPROVED",
          researchSnapshotId: persistHistory.snapshots[0].id,
          promptVersion: "LLM_DECISION_PHASE01",
        },
      });
      createdDecisionIds.push(createdDecision.id);

      const fetchedDecision = await prisma.decision.findUnique({
        where: { id: createdDecision.id },
      });
      assert(fetchedDecision !== null, "Decision must be found in database");
      assert(fetchedDecision?.researchSnapshotId === p1.id, "Primary researchSnapshotId must be p1 (newest)");

      const thesisData = fetchedDecision?.thesis as any;
      assert(Array.isArray(thesisData?.researchSnapshotIds), "thesis.researchSnapshotIds must be an array");
      assert(thesisData.researchSnapshotIds.length === 3, "thesis.researchSnapshotIds must have 3 IDs");
      assert(thesisData.researchSnapshotIds[0] === p1.id, "ID 1 must match p1");
      assert(thesisData.researchSnapshotIds[1] === p2.id, "ID 2 must match p2");
      assert(thesisData.researchSnapshotIds[2] === p3.id, "ID 3 must match p3");
    }
    console.log("  ✅ PASS: Exact 3 snapshot IDs permanently stored in decision record.\n");

    // -------------------------------------------------------------------------
    // TEST 6: Historical Integrity (New Snapshot Does Not Alter Old Decision)
    // -------------------------------------------------------------------------
    console.log("▶ TEST 6: Historical Integrity When New Snapshot Created...");
    // Now create a 4th snapshot (p4, newer than p1) for the same asset
    const p4 = await createMockSnapshot(assetPersist, new Date(baseTime + 5000), "p-4");
    createdSnapshotIds.push(p4.id);

    // Re-fetch the previously created decision from the database
    const pastDecision = await prisma.decision.findUnique({
      where: { id: createdDecisionIds[createdDecisionIds.length - 1] },
    });
    assert(pastDecision !== null, "Past decision must exist");

    const pastThesis = pastDecision?.thesis as any;
    assert(
      pastDecision?.researchSnapshotId === p1.id,
      "Past decision researchSnapshotId must remain p1 (must NOT change to p4)"
    );
    assert(
      pastThesis.researchSnapshotIds[0] === p1.id &&
      pastThesis.researchSnapshotIds[1] === p2.id &&
      pastThesis.researchSnapshotIds[2] === p3.id,
      "Past decision must preserve [p1, p2, p3] and must NOT dynamically update to [p4, p1, p2]"
    );
    console.log("  ✅ PASS: Historical decision integrity maintained after new snapshot creation.\n");

    console.log("===============================================================");
    console.log("🎉 ALL 6 HISTORICAL RESEARCH TESTS PASSED SUCCESSFULLY!");
    console.log("===============================================================\n");
  } finally {
    console.log("🧹 Cleaning up test artifacts from database...");
    if (createdDecisionIds.length > 0) {
      await prisma.decision.deleteMany({
        where: { id: { in: createdDecisionIds } },
      });
    }
    if (createdSnapshotIds.length > 0) {
      await prisma.researchSnapshot.deleteMany({
        where: { id: { in: createdSnapshotIds } },
      });
    }
    await prisma.$disconnect();
    console.log("✅ Cleanup complete.");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exitCode = 1;
});
