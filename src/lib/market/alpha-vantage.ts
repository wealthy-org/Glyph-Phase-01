// ============================================================================
// GLYPH PHASE 01 — ALPHA VANTAGE MARKET DATA PROVIDER
// Derived from: BRIEF.md (§5, §3.3, §68 TIPS)
// Implements MarketDataProvider with persistent disk caching to preserve the 25 req/day limit.
// ============================================================================

import {
  Candle,
  Fundamentals,
  MarketDataProvider,
  MarketStatusResult,
  NewsItem,
  Quote,
} from "@/types/market";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".cache", "market");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours caching (§68 TIPS)
const MARKET_STATUS_CACHE_TTL_MS = 5 * 60 * 1000;

interface AlphaVantageMarketStatusEntry {
  market_type?: unknown;
  region?: unknown;
  primary_exchanges?: unknown;
  local_open?: unknown;
  local_close?: unknown;
  current_status?: unknown;
  notes?: unknown;
}

interface AlphaVantageMarketStatusResponse {
  markets?: unknown;
  market_type?: unknown;
  region?: unknown;
  primary_exchanges?: unknown;
  local_open?: unknown;
  local_close?: unknown;
  current_status?: unknown;
  notes?: unknown;
}

export class AlphaVantageProvider implements MarketDataProvider {
  public name = "AlphaVantage";
  private apiKeys: string[] = [];
  private activeKeyIndex = 0;
  private baseUrl = "https://www.alphavantage.co/query";
  private rateLimitUntil = 0;
  private rateLimitMessage = "";

  constructor(apiKey?: string) {
    const rawKeys = [
      apiKey,
      process.env.MARKET_DATA_API_KEY,
      process.env.MARKET_DATA_BACKUP_API_KEY,
      process.env.ALPHA_VANTAGE_API_KEY,
      process.env.ALPHA_VANTAGE_BACKUP_API_KEY,
    ]
      .filter(Boolean)
      .flatMap((k) => (k as string).split(","))
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    this.apiKeys = Array.from(new Set(rawKeys));

    // Ensure cache directory exists
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
    } catch {
      // Ignore directory creation failure in read-only environments
    }
  }

  /**
   * Reads fresh cached payload from disk if valid.
   */
  private getCachedData<T>(cacheKey: string, ttlMs: number = CACHE_TTL_MS): T | null {
    try {
      const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const isFresh = Date.now() - stats.mtimeMs < ttlMs;
        if (isFresh) {
          const content = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(content) as any;
          // Guard against corrupted cache containing rate limit errors or info strings
          if (parsed && typeof parsed === "object" && !parsed.Information && !parsed.Note && !parsed["Error Message"]) {
            return parsed as T;
          }
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Writes API response to local disk cache.
   */
  private setCachedData<T>(cacheKey: string, data: T): void {
    try {
      if (!data || typeof data !== "object") return;
      const anyData = data as any;
      if (anyData.Information || anyData.Note || anyData["Error Message"]) {
        return; // Never cache rate-limit notices or error messages
      }
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Non-critical, ignore disk write failure
    }
  }

  /**
   * Fetches JSON from Alpha Vantage with caching, multi-key failover, and rate-limit handling.
   */
  private async fetchApi<T>(
    params: Record<string, string>,
    cacheKey: string,
    customTtlMs?: number,
    allowStaleOnError = true
  ): Promise<{ data: T; isCached: boolean }> {
    // 1. Check local cache first to protect 25 req/day limit
    const cached = this.getCachedData<T>(cacheKey, customTtlMs ?? CACHE_TTL_MS);
    if (cached) {
      return { data: cached, isCached: true };
    }

    if (this.apiKeys.length === 0) {
      throw new Error(
        "MARKET_DATA_API_KEY is not configured in environment variables."
      );
    }

    if (this.rateLimitUntil > Date.now()) {
      const stale = this.getCachedData<T>(cacheKey);
      if (stale && allowStaleOnError) {
        return { data: stale, isCached: true };
      }

      console.warn(
        `[AlphaVantage] Rate-limit cooldown active for ${cacheKey}. Skipping live request and using fallback data only.`
      );
      throw new Error(
        `Alpha Vantage is currently rate-limited. Using fallback data for ${cacheKey}.`
      );
    }

    // 2. Perform live network fetch with automatic key failover
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      const keyIndex = (this.activeKeyIndex + attempt) % this.apiKeys.length;
      const currentKey = this.apiKeys[keyIndex];

      const url = new URL(this.baseUrl);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      url.searchParams.set("apikey", currentKey);

      try {
        const response = await fetch(url.toString(), {
          headers: { "User-Agent": "Glyph-Autonomous-Agent/1.0" },
        });

        if (!response.ok) {
          if (response.status === 429) {
            const reason = "Alpha Vantage rate limit reached for this API key.";
            this.rateLimitUntil = Date.now() + 60_000;
            this.rateLimitMessage = reason;
            console.warn(
              `[AlphaVantage] Rate limit note on key ending ...${currentKey.slice(-4)}: ${reason}`
            );
          }
          throw new Error(`Alpha Vantage HTTP error: ${response.statusText}`);
        }

        const json = await response.json();

        // Check if Alpha Vantage returned rate-limit notice
        if (json.Note || json.Information) {
          const note = json.Note || json.Information;
          this.rateLimitUntil = Date.now() + 60_000;
          this.rateLimitMessage = note;
          console.warn(
            `[AlphaVantage] Rate limit note on key ending ...${currentKey.slice(-4)}: ${note}`
          );

          // If another API key is configured, failover immediately!
          if (attempt < this.apiKeys.length - 1) {
            console.log(
              `[AlphaVantage] Failing over to backup API key... (Attempt ${attempt + 2}/${this.apiKeys.length})`
            );
            continue;
          }

          // Fallback to existing cache if exists, or return parsed payload
          const stale = this.getCachedData<T>(cacheKey);
          if (stale) return { data: stale, isCached: true };
        } else {
          // Success! Update activeKeyIndex to current working key
          this.activeKeyIndex = keyIndex;
          this.setCachedData(cacheKey, json);
          return { data: json as T, isCached: false };
        }
      } catch (error) {
        console.error(
          `[AlphaVantage] Fetch error with key ending ...${currentKey.slice(-4)}:`,
          error
        );
        if (attempt < this.apiKeys.length - 1) {
          console.log(`[AlphaVantage] Trying next backup API key...`);
          continue;
        }
        const stale = this.getCachedData<T>(cacheKey);
        if (stale && allowStaleOnError) {
          return { data: stale, isCached: true };
        }
        throw error;
      }
    }

    const stale = this.getCachedData<T>(cacheKey);
    if (stale) {
      return { data: stale, isCached: true };
    }
    throw new Error(`All Alpha Vantage API keys rate-limited or failed for ${cacheKey}`);
  }

  /**
   * 1. Get Latest Market Quote (GLOBAL_QUOTE)
   */
  public async getQuote(symbol: string): Promise<Quote> {
    const sym = symbol.toUpperCase();
    const cacheKey = `${sym}_quote`;

    try {
      const { data } = await this.fetchApi<any>(
        { function: "GLOBAL_QUOTE", symbol: sym },
        cacheKey
      );

      const gq = data["Global Quote"];
      if (gq && gq["05. price"]) {
        return {
          symbol: sym,
          price: Number(parseFloat(gq["05. price"]).toFixed(2)),
          change: Number(parseFloat(gq["09. change"]).toFixed(2)),
          changePercent: Number(
            parseFloat(gq["10. change percent"]?.replace("%", "") || "0").toFixed(2)
          ),
          volume: parseInt(gq["06. volume"] || "0", 10),
          high: Number(parseFloat(gq["03. high"] || "0").toFixed(2)),
          low: Number(parseFloat(gq["04. low"] || "0").toFixed(2)),
          timestamp: gq["07. latest trading day"] || new Date().toISOString(),
        };
      }
    } catch (e) {
      throw new Error(
        `[AlphaVantage] Live quote unavailable for ${sym}: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    throw new Error(`[AlphaVantage] Live quote payload missing for ${sym}.`);
  }

  /**
   * 2. Get Historical OHLCV Candles (TIME_SERIES_DAILY)
   */
  public async getOHLCV(symbol: string, _timeframe = "DAILY"): Promise<Candle[]> {
    const sym = symbol.toUpperCase();
    const cacheKey = `${sym}_daily`;

    try {
      const { data } = await this.fetchApi<any>(
        { function: "TIME_SERIES_DAILY", symbol: sym, outputsize: "compact" },
        cacheKey
      );

      const timeSeries = data["Time Series (Daily)"];
      if (timeSeries) {
        const candles: Candle[] = [];
        for (const [date, values] of Object.entries<any>(timeSeries)) {
          candles.push({
            timestamp: date,
            open: parseFloat(values["1. open"]),
            high: parseFloat(values["2. high"]),
            low: parseFloat(values["3. low"]),
            close: parseFloat(values["4. close"]),
            volume: parseInt(values["5. volume"], 10),
          });
        }
        // Return sorted oldest to newest for indicator analysis
        return candles.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
    } catch (e) {
      throw new Error(
        `[AlphaVantage] Live candles unavailable for ${sym}: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    throw new Error(`[AlphaVantage] Live candles payload missing for ${sym}.`);
  }

  /**
   * 3. Get Fundamental Analysis Metrics (OVERVIEW)
   */
  public async getFundamentals(symbol: string): Promise<Fundamentals> {
    const sym = symbol.toUpperCase();
    const cacheKey = `${sym}_overview`;

    try {
      const { data } = await this.fetchApi<any>(
        { function: "OVERVIEW", symbol: sym },
        cacheKey
      );

      if (data && data.Symbol) {
        return {
          symbol: data.Symbol,
          name: data.Name || sym,
          description: data.Description || `${sym} company overview`,
          sector: data.Sector || "Technology",
          industry: data.Industry || "Semiconductors",
          marketCap: parseFloat(data.MarketCapitalization || "0"),
          peRatio: parseFloat(data.PERatio || "0"),
          pegRatio: parseFloat(data.PEGRatio || "0"),
          eps: parseFloat(data.EPS || "0"),
          revenueGrowthTTM: parseFloat(data.QuarterlyRevenueGrowthYOY || "0") * 100,
          profitMargin: parseFloat(data.ProfitMargin || "0") * 100,
          quarterlyEarningsGrowthYOY:
            parseFloat(data.QuarterlyEarningsGrowthYOY || "0") * 100,
          analystTargetPrice: parseFloat(data.AnalystTargetPrice || "0"),
          week52High: parseFloat(data["52WeekHigh"] || "0"),
          week52Low: parseFloat(data["52WeekLow"] || "0"),
          dividendYield: parseFloat(data.DividendYield || "0") * 100,
        };
      }
    } catch (e) {
      throw new Error(
        `[AlphaVantage] Live fundamentals unavailable for ${sym}: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    throw new Error(`[AlphaVantage] Live fundamentals payload missing for ${sym}.`);
  }

  /**
   * 4. Get News & Sentiment (NEWS_SENTIMENT)
   */
  public async getNews(symbol: string): Promise<NewsItem[]> {
    const sym = symbol.toUpperCase();
    const cacheKey = `${sym}_news`;

    try {
      const { data } = await this.fetchApi<any>(
        { function: "NEWS_SENTIMENT", tickers: sym, limit: "10" },
        cacheKey
      );

      if (data && Array.isArray(data.feed)) {
        return data.feed.slice(0, 10).map((item: any) => {
          let label: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
          const score = parseFloat(item.overall_sentiment_score || "0");
          if (score >= 0.15) label = "BULLISH";
          else if (score <= -0.15) label = "BEARISH";

          return {
            title: item.title,
            url: item.url,
            source: item.source,
            summary: item.summary,
            publishedAt: item.time_published,
            sentimentScore: score,
            sentimentLabel: label,
          };
        });
      }
    } catch (e) {
      throw new Error(
        `[AlphaVantage] Live news unavailable for ${sym}: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    throw new Error(`[AlphaVantage] Live news payload missing for ${sym}.`);
  }

  /**
   * Queries real-time Global Market Open & Close Status from Alpha Vantage API.
   * Caches response for 5 minutes to avoid exhausting daily quota.
   * Fallback calculates US Eastern Time hours deterministically if API is rate-limited.
   */
  public async getMarketStatus(
    region: string = "United States"
  ): Promise<MarketStatusResult> {
    const checkedAt = new Date().toISOString();
    const unknown = (reason: string): MarketStatusResult => {
      console.error(`[AlphaVantage] Market status is unknown: ${reason}`);
      return {
        isOpen: false,
        status: "unknown",
        region,
        primaryExchanges: "",
        localOpen: "",
        localClose: "",
        currentStatus: "unknown",
        notes: reason,
        source: "FALLBACK",
        checkedAt,
      };
    };

    try {
      const { data } = await this.fetchApi<AlphaVantageMarketStatusResponse>(
        { function: "MARKET_STATUS" },
        "market_status",
        MARKET_STATUS_CACHE_TTL_MS,
        false
      );

      const response = data as AlphaVantageMarketStatusResponse;
      const marketEntries: AlphaVantageMarketStatusEntry[] = Array.isArray(response.markets)
        ? response.markets.filter((entry): entry is AlphaVantageMarketStatusEntry => Boolean(entry && typeof entry === "object"))
        : response.market_type || response.region || response.current_status
          ? [response]
          : [];
      const target = marketEntries.find(
        (market) =>
          typeof market.market_type === "string" &&
          market.market_type.toLowerCase() === "equity" &&
          typeof market.region === "string" &&
          market.region.toLowerCase() === region.toLowerCase()
      );

      if (!target) {
        return unknown(`Alpha Vantage did not return an Equity market for ${region}.`);
      }

      if (typeof target.current_status !== "string") {
        return unknown("Alpha Vantage returned no current_status for the US Equity market.");
      }

      const currentStatus = target.current_status.toLowerCase();
      if (currentStatus !== "open" && currentStatus !== "closed") {
        return unknown(`Alpha Vantage returned unsupported market status: ${target.current_status}.`);
      }

      return {
        isOpen: currentStatus === "open",
        status: currentStatus,
        region: String(target.region),
        primaryExchanges: String(target.primary_exchanges || ""),
        localOpen: String(target.local_open || ""),
        localClose: String(target.local_close || ""),
        currentStatus,
        notes: typeof target.notes === "string" && target.notes.length > 0 ? target.notes : undefined,
        source: "API",
        checkedAt,
      };
    } catch (error) {
      return unknown(error instanceof Error ? error.message : String(error));
    }
  }
}
