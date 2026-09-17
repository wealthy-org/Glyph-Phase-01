// ============================================================================
// GLYPH PHASE 01 — RESEARCH & ANALYSIS ENGINE
// Derived from: BRIEF.md (§8, §14, §18)
// Synthesizes fundamental & technical layers into immutable research snapshots.
// ============================================================================

import { prisma } from "@/lib/prisma";
import {
  Candle,
  Fundamentals,
  MarketDataProvider,
  NewsItem,
  Quote,
  SynthesizedResearch,
  TechnicalSummary,
  FundamentalSummary,
} from "@/types/market";
import { AlphaVantageProvider } from "./market/alpha-vantage";

/**
 * Technical Analysis Layer (§8)
 * Evaluates trend, moving averages, momentum (RSI), support/resistance, and volatility.
 */
export function analyzeTechnicalLayer(
  candles: Candle[],
  quote: Quote
): TechnicalSummary {
  const closes = candles.map((c) => c.close);
  const currentPrice = quote.price;

  // 1. Calculate Simple Moving Averages
  const calcSMA = (period: number): number => {
    if (closes.length < period) {
      const sum = closes.reduce((a, b) => a + b, 0);
      return Number((sum / closes.length).toFixed(2));
    }
    const slice = closes.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Number((sum / period).toFixed(2));
  };

  const sma20 = calcSMA(20);
  const sma50 = calcSMA(50);

  // 2. Trend determination
  let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  if (currentPrice > sma20 && sma20 >= sma50) {
    trend = "BULLISH";
  } else if (currentPrice < sma20 && sma20 <= sma50) {
    trend = "BEARISH";
  }

  // 3. 14-period RSI (Relative Strength Index)
  let rsi14 = 50;
  if (closes.length >= 15) {
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - 14; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    if (avgLoss === 0) {
      rsi14 = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi14 = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }

  // 4. Support and Resistance (20-period Low / High)
  const recentCandles = candles.slice(-20);
  const supportLevel = Math.min(...recentCandles.map((c) => c.low));
  const resistanceLevel = Math.max(...recentCandles.map((c) => c.high));

  // 5. Volatility (Standard Deviation of % returns)
  const returns: number[] = [];
  for (let i = 1; i < recentCandles.length; i++) {
    returns.push(
      (recentCandles[i].close - recentCandles[i - 1].close) /
        recentCandles[i - 1].close
    );
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
    (returns.length || 1);
  const volatilityPercent = Number((Math.sqrt(variance) * 100).toFixed(2));

  // 6. Volume Ratio vs 20-day Average
  const avgVolume =
    recentCandles.reduce((acc, c) => acc + c.volume, 0) /
    (recentCandles.length || 1);
  const volumeRatio = Number((quote.volume / (avgVolume || 1)).toFixed(2));

  // 7. Deterministic Technical Score (0-100)
  let technicalScore = 50;
  if (trend === "BULLISH") technicalScore += 15;
  if (trend === "BEARISH") technicalScore -= 15;
  if (rsi14 >= 45 && rsi14 <= 65) technicalScore += 10; // Healthy momentum
  else if (rsi14 > 70) technicalScore -= 5; // Overbought
  else if (rsi14 < 30) technicalScore += 5; // Oversold potential bounce
  if (volumeRatio > 1.2) technicalScore += 10; // Strong volume participation
  if (currentPrice > supportLevel * 1.02) technicalScore += 5;

  technicalScore = Math.min(100, Math.max(10, technicalScore));

  return {
    currentPrice,
    sma20,
    sma50,
    rsi14,
    trend,
    supportLevel: Number(supportLevel.toFixed(2)),
    resistanceLevel: Number(resistanceLevel.toFixed(2)),
    volatilityPercent,
    volumeRatio,
    technicalScore,
  };
}

/**
 * Fundamental Analysis Layer (§8)
 * Evaluates revenue growth, margins, valuation ratios, and news sentiment.
 */
export function analyzeFundamentalLayer(
  fundamentals: Fundamentals,
  news: NewsItem[]
): FundamentalSummary {
  // 1. News Sentiment Aggregation
  let totalSentiment = 0;
  for (const item of news) {
    totalSentiment += item.sentimentScore;
  }
  const sentimentAverage =
    news.length > 0 ? Number((totalSentiment / news.length).toFixed(3)) : 0;

  let sentimentVerdict: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  if (sentimentAverage > 0.1) sentimentVerdict = "BULLISH";
  else if (sentimentAverage < -0.1) sentimentVerdict = "BEARISH";

  // 2. Fundamental Score (0-100)
  let fundamentalScore = 50;

  // High revenue growth rewards
  if (fundamentals.revenueGrowthTTM > 30) fundamentalScore += 15;
  else if (fundamentals.revenueGrowthTTM > 10) fundamentalScore += 10;
  else if (fundamentals.revenueGrowthTTM < 0) fundamentalScore -= 15;

  // Profit margins
  if (fundamentals.profitMargin > 30) fundamentalScore += 15;
  else if (fundamentals.profitMargin > 15) fundamentalScore += 10;
  else if (fundamentals.profitMargin < 0) fundamentalScore -= 15;

  // Sentiment contribution
  if (sentimentVerdict === "BULLISH") fundamentalScore += 10;
  else if (sentimentVerdict === "BEARISH") fundamentalScore -= 10;

  fundamentalScore = Math.min(100, Math.max(10, fundamentalScore));

  return {
    marketCap: fundamentals.marketCap,
    peRatio: fundamentals.peRatio,
    revenueGrowthPercent: Number(fundamentals.revenueGrowthTTM.toFixed(2)),
    profitMarginPercent: Number(fundamentals.profitMargin.toFixed(2)),
    earningsPerShare: fundamentals.eps,
    sector: fundamentals.sector,
    sentimentAverage,
    sentimentVerdict,
    keyHeadlines: news.slice(0, 3).map((n) => n.title),
    fundamentalScore,
  };
}

/**
 * Main Pipeline: Fetches market data, synthesizes technical & fundamental layers.
 */
export async function executeAssetResearch(
  symbol: string,
  provider?: MarketDataProvider
): Promise<SynthesizedResearch> {
  const dataProvider = provider || new AlphaVantageProvider();
  const sym = symbol.toUpperCase();

  // Run data fetches in parallel
  const [quote, candles, fundamentals, news] = await Promise.all([
    dataProvider.getQuote(sym),
    dataProvider.getOHLCV(sym, "DAILY"),
    dataProvider.getFundamentals(sym),
    dataProvider.getNews(sym),
  ]);

  const technicalData = analyzeTechnicalLayer(candles, quote);
  const fundamentalData = analyzeFundamentalLayer(fundamentals, news);

  return {
    asset: sym,
    timestamp: new Date().toISOString(),
    marketData: {
      quote,
      candles: candles.slice(-30), // Retain 30 days for snapshot
    },
    fundamentalData,
    technicalData,
    newsData: news,
    sourceMetadata: {
      provider: dataProvider.name,
      fetchedAt: new Date().toISOString(),
      isCached: false,
    },
  };
}

/**
 * Stores immutable research snapshot in Prisma database (BRIEF §8, §14).
 * Ensures "What Glyph knew when it made the decision" is never silently overwritten.
 */
export async function createResearchSnapshot(
  symbol: string,
  provider?: MarketDataProvider
) {
  const research = await executeAssetResearch(symbol, provider);

  const snapshot = await prisma.researchSnapshot.create({
    data: {
      asset: research.asset,
      marketData: research.marketData as any,
      fundamentalData: research.fundamentalData as any,
      technicalData: research.technicalData as any,
      newsData: research.newsData as any,
      sourceMetadata: research.sourceMetadata as any,
    },
  });

  return {
    snapshotId: snapshot.id,
    research,
  };
}
