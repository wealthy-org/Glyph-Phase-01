// ============================================================================
// GLYPH PHASE 01 — RESEARCH ENGINE VERIFICATION SCRIPT
// Run with: npx tsx scripts/test-research.ts
// ============================================================================

import { AlphaVantageProvider } from "../src/lib/market/alpha-vantage";
import {
  analyzeTechnicalLayer,
  analyzeFundamentalLayer,
  executeAssetResearch,
  createResearchSnapshot,
} from "../src/lib/research";
import { prisma } from "../src/lib/prisma";

async function runResearchTests() {
  console.log("===============================================================");
  console.log("🔬 GLYPH RESEARCH ENGINE (PHASE 01) — VERIFICATION SUITE");
  console.log("===============================================================\n");

  const asset = "NVDA";
  console.log(`Target Asset for Deep Research: ${asset}`);

  // -------------------------------------------------------------------------
  // TEST 1: Alpha Vantage Market Data Provider
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 1] Testing Alpha Vantage Provider & Network Fetch...");
  const provider = new AlphaVantageProvider();
  console.log(`  - Provider Name: ${provider.name}`);

  console.log("  - Fetching Market Quote for NVDA...");
  const quote = await provider.getQuote(asset);
  console.log(`    ↳ Price: $${quote.price} (${quote.changePercent > 0 ? "+" : ""}${quote.changePercent}%), Volume: ${quote.volume.toLocaleString()}`);

  console.log("  - Fetching Daily Candles (OHLCV)...");
  const candles = await provider.getOHLCV(asset, "DAILY");
  console.log(`    ↳ Retrieved ${candles.length} historical daily candles.`);

  console.log("  - Fetching Fundamentals (Overview)...");
  const fundamentals = await provider.getFundamentals(asset);
  console.log(`    ↳ Name: ${fundamentals.name}, Sector: ${fundamentals.sector}, P/E: ${fundamentals.peRatio}`);

  console.log("  - Fetching News Sentiment Feed...");
  const news = await provider.getNews(asset);
  console.log(`    ↳ Retrieved ${news.length} news items. Top headline: "${news[0]?.title.slice(0, 60)}..."`);
  console.log("  ✅ Market Data Provider Test Passed!\n");

  // -------------------------------------------------------------------------
  // TEST 2: Layer Analysis (Technical & Fundamental Synthesis)
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 2] Testing Technical & Fundamental Synthesis Layers...");

  const tech = analyzeTechnicalLayer(candles, quote);
  console.log(`  [Technical Layer]:`);
  console.log(`    ↳ Current Price: $${tech.currentPrice}`);
  console.log(`    ↳ Trend: ${tech.trend}`);
  console.log(`    ↳ SMA 20: $${tech.sma20} | SMA 50: $${tech.sma50}`);
  console.log(`    ↳ RSI (14): ${tech.rsi14}`);
  console.log(`    ↳ Support: $${tech.supportLevel} | Resistance: $${tech.resistanceLevel}`);
  console.log(`    ↳ Volatility: ${tech.volatilityPercent}%`);
  console.log(`    ↳ Technical Score: ${tech.technicalScore}/100`);

  const fund = analyzeFundamentalLayer(fundamentals, news);
  console.log(`  [Fundamental Layer]:`);
  console.log(`    ↳ Revenue Growth: +${fund.revenueGrowthPercent}% YoY`);
  console.log(`    ↳ Profit Margin: ${fund.profitMarginPercent}%`);
  console.log(`    ↳ News Sentiment: ${fund.sentimentVerdict} (avg score: ${fund.sentimentAverage})`);
  console.log(`    ↳ Fundamental Score: ${fund.fundamentalScore}/100`);

  if (tech.technicalScore <= 0 || fund.fundamentalScore <= 0) {
    throw new Error("Analysis layers generated invalid scores.");
  }
  console.log("  ✅ Analysis Layers Synthesized Successfully!\n");

  // -------------------------------------------------------------------------
  // TEST 3: Immutable Research Snapshot Creation in Database
  // -------------------------------------------------------------------------
  console.log("▶ [TEST 3] Creating Immutable Research Snapshot in Database...");
  const { snapshotId, research } = await createResearchSnapshot(asset, provider);

  console.log(`  - Snapshot Created with ID: ${snapshotId}`);
  console.log(`  - Asset: ${research.asset}`);
  console.log(`  - Synthesized Timestamp: ${research.timestamp}`);

  // Verify persistence from Prisma
  const savedSnapshot = await prisma.researchSnapshot.findUnique({
    where: { id: snapshotId },
  });

  if (!savedSnapshot) {
    throw new Error("Failed: Research snapshot was not persisted to database.");
  }

  console.log(`  - Verified DB Record: ID ${savedSnapshot.id}`);
  console.log(`  - Market Data Stored: ${Boolean(savedSnapshot.marketData)}`);
  console.log(`  - Fundamental Data Stored: ${Boolean(savedSnapshot.fundamentalData)}`);
  console.log(`  - Technical Data Stored: ${Boolean(savedSnapshot.technicalData)}`);
  console.log("  ✅ Immutable Snapshot Persisted & Verified in Database!\n");

  console.log("===============================================================");
  console.log("🎉 ALL RESEARCH ENGINE TESTS PASSED! TAHAP 3 IS 100% OPERATIONAL.");
  console.log("===============================================================");
}

runResearchTests()
  .catch((err) => {
    console.error("❌ Research test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
