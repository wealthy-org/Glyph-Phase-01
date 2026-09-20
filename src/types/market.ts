// ============================================================================
// GLYPH PHASE 01 — MARKET DATA INTERFACES & TYPES
// Derived from: BRIEF.md (§5, §8, §14)
// Vendor-agnostic abstractions for market data providers.
// ============================================================================

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Fundamentals {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  pegRatio: number;
  eps: number;
  revenueGrowthTTM: number;
  profitMargin: number;
  quarterlyEarningsGrowthYOY: number;
  analystTargetPrice?: number;
  week52High: number;
  week52Low: number;
  dividendYield: number;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  sentimentScore: number; // e.g. -1.0 (very bearish) to +1.0 (very bullish)
  sentimentLabel: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export interface MarketStatusResult {
  isOpen: boolean;
  status: "open" | "closed" | "unknown";
  region: string;
  primaryExchanges: string;
  localOpen: string;
  localClose: string;
  currentStatus: string;
  notes?: string;
  source: "API" | "FALLBACK";
  checkedAt: string;
}

/**
 * Standard MarketDataProvider interface required by BRIEF §5.
 * Keeps the application decoupled from any specific market data provider.
 */
export interface MarketDataProvider {
  name: string;
  getQuote(symbol: string): Promise<Quote>;
  getOHLCV(symbol: string, timeframe?: string): Promise<Candle[]>;
  getFundamentals(symbol: string): Promise<Fundamentals>;
  getNews(symbol: string): Promise<NewsItem[]>;
  getMarketStatus?(region?: string): Promise<MarketStatusResult>;
}

export interface TechnicalSummary {
  currentPrice: number;
  sma20: number;
  sma50: number;
  rsi14: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  supportLevel: number;
  resistanceLevel: number;
  volatilityPercent: number;
  volumeRatio: number; // vs 20-day average
  technicalScore: number; // 0-100
}

export interface FundamentalSummary {
  marketCap: number;
  peRatio: number;
  revenueGrowthPercent: number;
  profitMarginPercent: number;
  earningsPerShare: number;
  sector: string;
  sentimentAverage: number; // -1 to +1
  sentimentVerdict: "BULLISH" | "BEARISH" | "NEUTRAL";
  keyHeadlines: string[];
  fundamentalScore: number; // 0-100
}

export interface RiskContext {
  regime: "bullish" | "bearish" | "volatile" | "sideways" | "uncertain";
  level: "low" | "moderate" | "high" | "extreme";
  details?: string;
}

export interface SynthesizedResearch {
  asset: string;
  timestamp: string;
  marketData: {
    quote: Quote;
    candles: Candle[];
  };
  fundamentalData: FundamentalSummary;
  technicalData: TechnicalSummary;
  riskContext?: RiskContext;
  newsData: NewsItem[];
  sourceMetadata: {
    provider: string;
    fetchedAt: string;
    isCached: boolean;
  };
}

