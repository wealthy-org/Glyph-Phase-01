// ============================================================================
// GLYPH PHASE 01 — SEED HISTORICAL DECISIONS & DECISION EVENTS
// Safely populates decision records and DECISION_MADE economic events
// linked to historical research snapshots for the Autonomous Life Log.
// ============================================================================

import { prisma } from "../../src/lib/prisma";

const HISTORICAL_DECISIONS = [
  {
    id: "a1100001-dec1-4000-8000-000000000001",
    eventId: "e1100001-evt1-4000-8000-000000000001",
    snapshotId: "417f3464-7534-4928-8ae7-d1db9a59c794",
    cycleId: "market-analysis:485:1790193619376",
    asset: "NVDA",
    action: "OPEN_LONG" as const,
    conviction: 85,
    fundamentalScore: 85,
    technicalScore: 88,
    riskScore: 58,
    day: 3,
    createdAt: new Date("2026-09-23T20:00:22.000Z"),
    thesis: {
      fundamental:
        "NVIDIA sustains high accelerated compute capex guidance from hyperscalers with 55%+ operating margins and pricing power.",
      technical:
        "Bullish continuation breakout above 20-day EMA with constructive RSI momentum around 58 and expanding volume.",
      catalyst:
        "Enterprise inference software partnerships and Blackwell production ramp guidance acceleration.",
      risk: "Macro volatility and semiconductor supply chain bottleneck sensitivity.",
      invalidation:
        "Decisive daily close below the $218.00 horizontal support shelf invalidates structural expansion thesis.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100002-dec2-4000-8000-000000000002",
    eventId: "e1100002-evt2-4000-8000-000000000002",
    snapshotId: "67d7309d-97bf-4dab-bc65-1382b2fa8616",
    cycleId: "market-analysis:485:1790193619376",
    asset: "AAPL",
    action: "HOLD" as const,
    conviction: 74,
    fundamentalScore: 75,
    technicalScore: 72,
    riskScore: 52,
    day: 3,
    createdAt: new Date("2026-09-23T20:00:23.000Z"),
    thesis: {
      fundamental:
        "Apple demonstrates steady services revenue growth (+12% YoY) and solid free cash flow generation.",
      technical:
        "Range-bound consolidation above 50-day moving average; momentum balanced without overbought signals.",
      catalyst:
        "Institutional accumulation into product cycle and developer ecosystem monetization.",
      risk: "Broad market tech beta compression and consumer replacement cycle elongation.",
      invalidation:
        "Break below $324.00 structural swing support shelf invalidates holding bias.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100003-dec3-4000-8000-000000000003",
    eventId: "e1100003-evt3-4000-8000-000000000003",
    snapshotId: "6c2f4ee0-ddca-4821-81fe-9c55957a9552",
    cycleId: "market-analysis:485:1790182820808",
    asset: "NVDA",
    action: "OPEN_LONG" as const,
    conviction: 82,
    fundamentalScore: 82,
    technicalScore: 85,
    riskScore: 60,
    day: 3,
    createdAt: new Date("2026-09-23T17:00:24.000Z"),
    thesis: {
      fundamental:
        "Data center revenue trajectory reinforced by upgraded cloud infrastructure orders and sovereign AI initiatives.",
      technical:
        "Consolidation resolution above key swing resistance with expanding volume profile.",
      catalyst:
        "Enterprise demand announcements for next-generation architecture deployment.",
      risk: "Short-term valuation multiple expansion headwinds.",
      invalidation:
        "Breach below $214.00 invalidates immediate bullish continuation.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100004-dec4-4000-8000-000000000004",
    eventId: "e1100004-evt4-4000-8000-000000000004",
    snapshotId: "6bda78ea-9813-44ed-863a-d3eb51efd546",
    cycleId: "market-analysis:485:1790182820808",
    asset: "AAPL",
    action: "NO_TRADE" as const,
    conviction: 58,
    fundamentalScore: 65,
    technicalScore: 58,
    riskScore: 65,
    day: 3,
    createdAt: new Date("2026-09-23T17:00:25.000Z"),
    thesis: {
      fundamental:
        "Resilient ecosystem but near-term growth catalysts remain balanced by valuation.",
      technical:
        "Sideways compression within narrow Bollinger bands, waiting for clear directional confirmation.",
      catalyst:
        "Upcoming quarterly earnings release and developer preview announcements.",
      risk: "Choppy range whipsaws during low-volatility compression.",
      invalidation: "N/A — Capital preserved under deterministic risk threshold.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100005-dec5-4000-8000-000000000005",
    eventId: "e1100005-evt5-4000-8000-000000000005",
    snapshotId: "b1e83227-3324-4253-a20d-f09f80a20c21",
    cycleId: "market-analysis:5:1790020818479",
    asset: "NVDA",
    action: "OPEN_LONG" as const,
    conviction: 84,
    fundamentalScore: 84,
    technicalScore: 86,
    riskScore: 62,
    day: 1,
    createdAt: new Date("2026-09-21T20:00:22.000Z"),
    thesis: {
      fundamental:
        "Hyperscaler capex commitment upgrades affirm multi-quarter order visibility and robust net margin resilience.",
      technical:
        "Bull flag consolidation breakout with volume surging 1.45x above 20-day moving average.",
      catalyst:
        "Production shipment acceleration and institutional volume expansion.",
      risk: "High sector beta and interest rate macro sensitivity.",
      invalidation:
        "Breach below $218.00 horizontal floor invalidates active trade premise.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100006-dec6-4000-8000-000000000006",
    eventId: "e1100006-evt6-4000-8000-000000000006",
    snapshotId: "e87bfff1-2efb-4e15-815a-b8b49c6371d1",
    cycleId: "market-analysis:5:1790020818479",
    asset: "AAPL",
    action: "HOLD" as const,
    conviction: 72,
    fundamentalScore: 70,
    technicalScore: 68,
    riskScore: 50,
    day: 1,
    createdAt: new Date("2026-09-21T20:00:23.000Z"),
    thesis: {
      fundamental:
        "Expanding high-margin digital ecosystem subscriptions and aggressive corporate share repurchase program.",
      technical:
        "Constructive higher low formation above 20-day EMA with RSI stabilizing near 53.",
      catalyst:
        "Consumer hardware cycle expansion and AI software integration updates.",
      risk: "Geographic consumer spending compression.",
      invalidation:
        "Daily close below $325.00 support shelf invalidates holding premise.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100007-dec7-4000-8000-000000000007",
    eventId: "e1100007-evt7-4000-8000-000000000007",
    snapshotId: "fb061bf5-2685-4542-a7dc-6c4ea51510d5",
    cycleId: "market-analysis:5:1790003631144",
    asset: "NVDA",
    action: "OPEN_LONG" as const,
    conviction: 80,
    fundamentalScore: 80,
    technicalScore: 82,
    riskScore: 56,
    day: 1,
    createdAt: new Date("2026-09-21T15:13:55.000Z"),
    thesis: {
      fundamental:
        "Accelerated computing demand remains robust across enterprise and cloud hyperscaler footprints.",
      technical:
        "Ascending triangle breakout confirmation on the 4-hour chart with positive momentum divergence.",
      catalyst:
        "Industry developer conference keynote and supply chain capacity expansion.",
      risk: "Export restriction headline volatility.",
      invalidation:
        "Decisive breakdown below $218.00 horizontal support shelf.",
    },
    policyResult: "APPROVED" as const,
  },
  {
    id: "a1100008-dec8-4000-8000-000000000008",
    eventId: "e1100008-evt8-4000-8000-000000000008",
    snapshotId: "5d41b613-aeaf-473f-914f-33a5ef3cf6b9",
    cycleId: "market-analysis:5:1790003631144",
    asset: "AAPL",
    action: "OPEN_LONG" as const,
    conviction: 78,
    fundamentalScore: 76,
    technicalScore: 74,
    riskScore: 54,
    day: 1,
    createdAt: new Date("2026-09-21T15:13:56.000Z"),
    thesis: {
      fundamental:
        "Services revenue expansion (+12% YoY) and solid balance sheet with strong net cash generation.",
      technical:
        "Breakout from 2-week consolidation base with rising volume and RSI above 52.",
      catalyst:
        "Institutional portfolio rebalancing into mega-cap quality factors.",
      risk: "Global hardware demand fluctuation.",
      invalidation:
        "Decisive close below $324.00 support shelf invalidates long continuation.",
    },
    policyResult: "APPROVED" as const,
  },
];

async function seedDecisions() {
  const agent = await prisma.agent.findFirst({
    select: { id: true, agentId: true },
  });

  if (!agent) {
    throw new Error("No agent found in database!");
  }

  const agentId = agent.id;
  console.log(`Target Agent: #${agent.agentId} (${agentId})`);
  console.log(`Seeding ${HISTORICAL_DECISIONS.length} historical decision records...`);

  await prisma.$transaction(async (tx) => {
    for (const d of HISTORICAL_DECISIONS) {
      // 1. Upsert Decision Record
      await tx.decision.upsert({
        where: { id: d.id },
        create: {
          id: d.id,
          agentId,
          asset: d.asset,
          action: d.action,
          conviction: d.conviction,
          timeHorizon: "1d_to_14d",
          fundamentalScore: d.fundamentalScore,
          technicalScore: d.technicalScore,
          riskScore: d.riskScore,
          thesis: d.thesis,
          policyResult: d.policyResult,
          researchSnapshotId: d.snapshotId,
          cycleId: d.cycleId,
          promptVersion: "GLYPH_DECISION_PROMPT_V1",
          createdAt: d.createdAt,
        },
        update: {
          asset: d.asset,
          action: d.action,
          conviction: d.conviction,
          fundamentalScore: d.fundamentalScore,
          technicalScore: d.technicalScore,
          riskScore: d.riskScore,
          thesis: d.thesis,
          policyResult: d.policyResult,
          researchSnapshotId: d.snapshotId,
          cycleId: d.cycleId,
          createdAt: d.createdAt,
        },
      });

      // 2. Upsert EconomicEvent Record (DECISION_MADE)
      await tx.economicEvent.upsert({
        where: { id: d.eventId },
        create: {
          id: d.eventId,
          agentId,
          eventType: "DECISION_MADE",
          title: `Evaluated ${d.asset} — Proposed ${d.action} (${d.conviction}%)`,
          description: `Autonomous decision engine committed ${d.action} on ${d.asset} following algorithmic risk check. Conviction: ${d.conviction}%. Invalidation: ${d.thesis.invalidation}`,
          day: d.day,
          result: d.policyResult,
          decisionId: d.id,
          cycleId: d.cycleId,
          timestamp: d.createdAt,
        },
        update: {
          title: `Evaluated ${d.asset} — Proposed ${d.action} (${d.conviction}%)`,
          description: `Autonomous decision engine committed ${d.action} on ${d.asset} following algorithmic risk check. Conviction: ${d.conviction}%. Invalidation: ${d.thesis.invalidation}`,
          day: d.day,
          result: d.policyResult,
          decisionId: d.id,
          cycleId: d.cycleId,
          timestamp: d.createdAt,
        },
      });
    }
  });

  const [dCount, eCount] = await Promise.all([
    prisma.decision.count(),
    prisma.economicEvent.count({ where: { eventType: "DECISION_MADE" } }),
  ]);

  console.log(`✅ Successfully seeded historical decisions!`);
  console.log(`- Decisions in DB: ${dCount}`);
  console.log(`- DECISION_MADE Events in DB: ${eCount}`);
}

seedDecisions()
  .catch((err) => {
    console.error("❌ Seed decisions failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
