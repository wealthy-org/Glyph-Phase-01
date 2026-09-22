// ============================================================================
// GLYPH PHASE 01 — BUNDLED FALLBACK MARKET DATA
// Pre-bundled market snapshots used when live Alpha Vantage free-tier rate limits
// (5 req/min or 25 req/day) are triggered in serverless/cron environments.
// ============================================================================

import aaplDaily from "@/data/market-fallback/AAPL_daily.json";
import aaplNews from "@/data/market-fallback/AAPL_news.json";
import aaplOverview from "@/data/market-fallback/AAPL_overview.json";
import aaplQuote from "@/data/market-fallback/AAPL_quote.json";
import marketStatus from "@/data/market-fallback/market_status.json";
import msftOverview from "@/data/market-fallback/MSFT_overview.json";
import nvdaDaily from "@/data/market-fallback/NVDA_daily.json";
import nvdaNews from "@/data/market-fallback/NVDA_news.json";
import nvdaOverview from "@/data/market-fallback/NVDA_overview.json";
import nvdaQuote from "@/data/market-fallback/NVDA_quote.json";
import tslaNews from "@/data/market-fallback/TSLA_news.json";

export const BUNDLED_FALLBACK_DATA: Record<string, unknown> = {
  AAPL_daily: aaplDaily,
  AAPL_news: aaplNews,
  AAPL_overview: aaplOverview,
  AAPL_quote: aaplQuote,
  MSFT_overview: msftOverview,
  NVDA_daily: nvdaDaily,
  NVDA_news: nvdaNews,
  NVDA_overview: nvdaOverview,
  NVDA_quote: nvdaQuote,
  TSLA_news: tslaNews,
  market_status: marketStatus,
};

export function getBundledFallbackData<T>(cacheKey: string): T | null {
  const data = BUNDLED_FALLBACK_DATA[cacheKey];
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  if (raw.Information || raw.Note || raw["Error Message"]) {
    return null;
  }
  return data as T;
}
