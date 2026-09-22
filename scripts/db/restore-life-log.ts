// ============================================================================
// GLYPH PHASE 01 — RESTORE HISTORICAL LIFE LOG & RESEARCH DATA
// Restores exact 6 historical research snapshots, life log economic events,
// activity logs, and agent runs from audit history.
// ============================================================================

import { prisma } from "../../src/lib/prisma";

async function restore() {
  const agent = await prisma.agent.findFirst({
    select: { id: true, agentId: true },
  });

  if (!agent) {
    throw new Error("No agent found in database!");
  }

  const agentId = agent.id;
  console.log(`Target Agent: #${agent.agentId} (${agentId})`);

  // 1. Historical Research Snapshots
  const snapshots = [
    {
      id: "fb061bf5-2685-4542-a7dc-6c4ea51510d5",
      asset: "NVDA",
      cycleId: "market-analysis:5:1790003631144",
      createdAt: new Date("2026-09-21T15:13:53.434Z"),
      marketData: {
        quote: { price: 225.38, change: 3.11, changePercent: 1.4, volume: 85200000 },
      },
      fundamentalData: {
        score: 65,
        fundamentalScore: 65,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 80,
        technicalScore: 80,
        trend: "BULLISH",
        rsi14: 54.6,
        volatilityPercent: 2.83,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "moderate", regime: "bullish" },
      },
    },
    {
      id: "5d41b613-aeaf-473f-914f-33a5ef3cf6b9",
      asset: "AAPL",
      cycleId: "market-analysis:5:1790003631144",
      createdAt: new Date("2026-09-21T15:13:53.947Z"),
      marketData: {
        quote: { price: 337.30, change: 1.85, changePercent: 0.55, volume: 48900000 },
      },
      fundamentalData: {
        score: 60,
        fundamentalScore: 60,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 70,
        technicalScore: 70,
        trend: "BULLISH",
        rsi14: 52.1,
        volatilityPercent: 1.95,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "low", regime: "bullish" },
      },
    },
    {
      id: "acf92bd2-9288-46e7-93cd-a6da03f8278c",
      asset: "NVDA",
      cycleId: "market-analysis:5:1790010021750",
      createdAt: new Date("2026-09-21T17:00:23.245Z"),
      marketData: {
        quote: { price: 226.32, change: 4.05, changePercent: 1.82, volume: 92300000 },
      },
      fundamentalData: {
        score: 65,
        fundamentalScore: 65,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 80,
        technicalScore: 80,
        trend: "BULLISH",
        rsi14: 55.4,
        volatilityPercent: 2.75,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "moderate", regime: "bullish" },
      },
    },
    {
      id: "2e5865a8-8519-4043-8c91-3c59de261994",
      asset: "AAPL",
      cycleId: "market-analysis:5:1790010021750",
      createdAt: new Date("2026-09-21T17:00:24.150Z"),
      marketData: {
        quote: { price: 338.79, change: 3.34, changePercent: 1.0, volume: 52100000 },
      },
      fundamentalData: {
        score: 60,
        fundamentalScore: 60,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 65,
        technicalScore: 65,
        trend: "BULLISH",
        rsi14: 53.0,
        volatilityPercent: 1.9,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "low", regime: "bullish" },
      },
    },
    {
      id: "b1e83227-3324-4253-a20d-f09f80a20c21",
      asset: "NVDA",
      cycleId: "market-analysis:5:1790020818479",
      createdAt: new Date("2026-09-21T20:00:20.017Z"),
      marketData: {
        quote: { price: 227.32, change: 5.05, changePercent: 2.27, volume: 104500000 },
      },
      fundamentalData: {
        score: 65,
        fundamentalScore: 65,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 80,
        technicalScore: 80,
        trend: "BULLISH",
        rsi14: 56.1,
        volatilityPercent: 2.7,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "moderate", regime: "bullish" },
      },
    },
    {
      id: "e87bfff1-2efb-4e15-815a-b8b49c6371d1",
      asset: "AAPL",
      cycleId: "market-analysis:5:1790020818479",
      createdAt: new Date("2026-09-21T20:00:21.774Z"),
      marketData: {
        quote: { price: 338.99, change: 3.54, changePercent: 1.06, volume: 54200000 },
      },
      fundamentalData: {
        score: 60,
        fundamentalScore: 60,
        sector: "Technology",
        sentimentVerdict: "BULLISH",
      },
      technicalData: {
        score: 65,
        technicalScore: 65,
        trend: "BULLISH",
        rsi14: 53.4,
        volatilityPercent: 1.88,
      },
      sourceMetadata: {
        provider: "AlphaVantage",
        riskContext: { level: "low", regime: "bullish" },
      },
    },
  ];

  // 2. Historical Economic Events (Life Log)
  const economicEvents = [
    {
      id: "baa8f754-c4d2-4f68-94d6-7fae2ef93d08",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "NVDA Market Analysis Completed",
      description:
        "Glyph analyzed NVDA at $225.38. Fundamental: 65/100. Technical: 80/100. Risk: MODERATE. Signal: WATCH / QUALIFIED. Snapshot: fb061bf5-2685-4542-a7dc-6c4ea51510d5.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790003631144",
      timestamp: new Date("2026-09-21T15:13:54.128Z"),
    },
    {
      id: "58d2f392-7651-42da-8846-12dd5ee8cb15",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "AAPL Market Analysis Completed",
      description:
        "Glyph analyzed AAPL at $337.30. Fundamental: 60/100. Technical: 70/100. Risk: LOW. Signal: WATCH / QUALIFIED. Snapshot: 5d41b613-aeaf-473f-914f-33a5ef3cf6b9.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790003631144",
      timestamp: new Date("2026-09-21T15:13:54.193Z"),
    },
    {
      id: "f9dc98f2-903a-49fc-9938-22a6f5dcc274",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "NVDA Market Analysis Completed",
      description:
        "Glyph analyzed NVDA at $226.32. Fundamental: 65/100. Technical: 80/100. Risk: MODERATE. Signal: WATCH / QUALIFIED. Snapshot: acf92bd2-9288-46e7-93cd-a6da03f8278c.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790010021750",
      timestamp: new Date("2026-09-21T17:00:25.297Z"),
    },
    {
      id: "e4f3d475-ac5f-4fd0-a182-9629fdfbba02",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "AAPL Market Analysis Completed",
      description:
        "Glyph analyzed AAPL at $338.79. Fundamental: 60/100. Technical: 65/100. Risk: LOW. Signal: CAUTION. Snapshot: 2e5865a8-8519-4043-8c91-3c59de261994.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790010021750",
      timestamp: new Date("2026-09-21T17:00:25.755Z"),
    },
    {
      id: "3165377e-156c-4815-a10a-bcb9738bbc4c",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "NVDA Market Analysis Completed",
      description:
        "Glyph analyzed NVDA at $227.32. Fundamental: 65/100. Technical: 80/100. Risk: MODERATE. Signal: WATCH / QUALIFIED. Snapshot: b1e83227-3324-4253-a20d-f09f80a20c21.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790020818479",
      timestamp: new Date("2026-09-21T20:00:22.913Z"),
    },
    {
      id: "b8ad3a02-6325-4377-b879-60e171eba537",
      agentId,
      eventType: "RESEARCH_STARTED" as const,
      title: "AAPL Market Analysis Completed",
      description:
        "Glyph analyzed AAPL at $338.99. Fundamental: 60/100. Technical: 65/100. Risk: LOW. Signal: CAUTION. Snapshot: e87bfff1-2efb-4e15-815a-b8b49c6371d1.",
      day: 1,
      result: "COMPLETED",
      cycleId: "market-analysis:5:1790020818479",
      timestamp: new Date("2026-09-21T20:00:23.367Z"),
    },
  ];

  // 3. Historical Activity Logs
  const activityLogs = [
    {
      id: "e32ff516-67a3-4b95-9c21-23c0bb220bba",
      agentId,
      cycleId: "market-analysis:5:1790003631144",
      activityType: "ANALYSIS",
      asset: "NVDA",
      status: "COMPLETED",
      title: "Market Analysis Completed — NVDA",
      description: "Regime: bullish · Tech Score: 80/100 · Fund Score: 65/100",
      timestamp: new Date("2026-09-21T15:13:53.503Z"),
    },
    {
      id: "c8018611-790a-4213-b588-0db7c7cffaeb",
      agentId,
      cycleId: "market-analysis:5:1790003631144",
      activityType: "ANALYSIS",
      asset: "AAPL",
      status: "COMPLETED",
      title: "Market Analysis Completed — AAPL",
      description: "Regime: bullish · Tech Score: 70/100 · Fund Score: 60/100",
      timestamp: new Date("2026-09-21T15:13:54.020Z"),
    },
    {
      id: "c53b1194-6a02-4974-9296-c16fd7dd64bb",
      agentId,
      cycleId: "market-analysis:5:1790010021750",
      activityType: "ANALYSIS",
      asset: "NVDA",
      status: "COMPLETED",
      title: "Market Analysis Completed — NVDA",
      description: "Regime: bullish · Tech Score: 80/100 · Fund Score: 65/100",
      timestamp: new Date("2026-09-21T17:00:23.708Z"),
    },
    {
      id: "65c52bf2-51bd-409b-b58b-5edb818d64c0",
      agentId,
      cycleId: "market-analysis:5:1790010021750",
      activityType: "ANALYSIS",
      asset: "AAPL",
      status: "COMPLETED",
      title: "Market Analysis Completed — AAPL",
      description: "Regime: bullish · Tech Score: 65/100 · Fund Score: 60/100",
      timestamp: new Date("2026-09-21T17:00:24.610Z"),
    },
    {
      id: "7f6f6729-5503-49b9-8342-4143e01aaa84",
      agentId,
      cycleId: "market-analysis:5:1790020818479",
      activityType: "ANALYSIS",
      asset: "NVDA",
      status: "COMPLETED",
      title: "Market Analysis Completed — NVDA",
      description: "Regime: bullish · Tech Score: 80/100 · Fund Score: 65/100",
      timestamp: new Date("2026-09-21T20:00:21.343Z"),
    },
    {
      id: "d52198af-db8e-4633-aeeb-44c4a15a33ee",
      agentId,
      cycleId: "market-analysis:5:1790020818479",
      activityType: "ANALYSIS",
      asset: "AAPL",
      status: "COMPLETED",
      title: "Market Analysis Completed — AAPL",
      description: "Regime: bullish · Tech Score: 65/100 · Fund Score: 60/100",
      timestamp: new Date("2026-09-21T20:00:22.233Z"),
    },
  ];

  // 4. Historical Agent Runs
  const agentRuns = [
    {
      id: "92395612-d453-42f0-943c-2ea0ca333111",
      agentId,
      cycleKey: "market-analysis:5:1790003631144",
      startedAt: new Date("2026-09-21T15:13:51.144Z"),
      completedAt: new Date("2026-09-21T15:13:54.250Z"),
    },
    {
      id: "5012b134-d48b-4a8d-8096-63c3d972c23d",
      agentId,
      cycleKey: "market-analysis:5:1790010021750",
      startedAt: new Date("2026-09-21T17:00:21.750Z"),
      completedAt: new Date("2026-09-21T17:00:25.800Z"),
    },
    {
      id: "f1b20b4b-8601-49c4-879d-2f37d2f07389",
      agentId,
      cycleKey: "market-analysis:5:1790020818479",
      startedAt: new Date("2026-09-21T20:00:18.479Z"),
      completedAt: new Date("2026-09-21T20:00:23.400Z"),
    },
  ];

  console.log("Restoring in a single database transaction...");
  await prisma.$transaction(async (tx) => {
    // Upsert Snapshots
    for (const s of snapshots) {
      await tx.researchSnapshot.upsert({
        where: { id: s.id },
        create: s,
        update: s,
      });
    }

    // Upsert Economic Events
    for (const e of economicEvents) {
      await tx.economicEvent.upsert({
        where: { id: e.id },
        create: e,
        update: e,
      });
    }

    // Upsert Activity Logs
    for (const a of activityLogs) {
      await tx.activityLog.upsert({
        where: { id: a.id },
        create: a,
        update: a,
      });
    }

    // Upsert Agent Runs
    for (const r of agentRuns) {
      await tx.agentRun.upsert({
        where: { id: r.id },
        create: r,
        update: r,
      });
    }
  });

  console.log("✅ Successfully restored historical Life Log and Research data!");

  // Verify counts
  const [ssCount, eeCount, alCount, arCount] = await Promise.all([
    prisma.researchSnapshot.count(),
    prisma.economicEvent.count(),
    prisma.activityLog.count(),
    prisma.agentRun.count(),
  ]);

  console.log("\n=== POST-RESTORE VERIFICATION ===");
  console.log(`Research Snapshots : ${ssCount} (expected: 6)`);
  console.log(`Economic Events    : ${eeCount} (expected: 10)`);
  console.log(`Activity Logs      : ${alCount} (expected: 6+)`);
  console.log(`Agent Runs         : ${arCount}`);
}

restore()
  .catch((err) => {
    console.error("❌ Restore failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
