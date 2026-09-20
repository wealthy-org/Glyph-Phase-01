import {
    Candle,
    Fundamentals,
    MarketDataProvider,
    MarketStatusResult,
    NewsItem,
    Quote,
} from "@/types/market";

interface TwelveDataQuote {
    symbol?: string;
    price?: string | number;
    close?: string | number;
    previous_close?: string | number;
    change?: string | number;
    percent_change?: string | number;
    volume?: string | number;
    high?: string | number;
    low?: string | number;
    datetime?: string;
    timestamp?: string | number;
}

interface TwelveDataTimeSeries {
    values?: Array<{
        datetime: string;
        open?: string | number;
        high?: string | number;
        low?: string | number;
        close?: string | number;
        volume?: string | number;
    }>;
}

interface TwelveDataProfile {
    symbol?: string;
    name?: string;
    description?: string;
    sector?: string;
    industry?: string;
}

interface TwelveDataStatistics {
    statistics?: {
        valuations_metrics?: {
            market_capitalization?: number;
            trailing_pe?: number;
        };
        financials?: {
            profit_margin?: number;
            income_statement?: {
                diluted_eps_ttm?: number;
                quarterly_revenue_growth?: number;
            };
        };
    };
}

interface TwelveDataPressRelease {
    title?: string;
    body?: string;
    datetime?: string;
}

export class TwelveDataProvider implements MarketDataProvider {
    public name = "Twelve Data";
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.twelvedata.com";

    constructor(apiKey = process.env.TWELVE_DATA_API_KEY) {
        if (!apiKey) {
            throw new Error("TWELVE_DATA_API_KEY is not configured in environment variables.");
        }
        this.apiKey = apiKey;
    }

    private async request<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        url.searchParams.set("apikey", this.apiKey);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {
            headers: { "User-Agent": "Glyph-Autonomous-Agent/1.0" },
        });
        const payload = await response.json() as T & { code?: number; message?: string; status?: string };
        if (!response.ok || payload.status === "error") {
            throw new Error(
                `Twelve Data ${endpoint} error (${response.status}): ${payload.message || response.statusText}`
            );
        }
        return payload;
    }

    public async getQuote(symbol: string): Promise<Quote> {
        const payload = await this.request<TwelveDataQuote>("quote", {
            symbol: symbol.toUpperCase(),
            interval: "1day",
            eod: "true",
        });
        const price = Number(payload.close ?? payload.price ?? 0);
        if (!price) throw new Error(`Twelve Data returned no quote for ${symbol}.`);

        return {
            symbol: payload.symbol || symbol.toUpperCase(),
            price,
            change: Number(payload.change || 0),
            changePercent: Number(payload.percent_change || 0),
            volume: Number(payload.volume || 0),
            high: Number(payload.high || 0),
            low: Number(payload.low || 0),
            timestamp: payload.datetime || (payload.timestamp
                ? new Date(Number(payload.timestamp) * 1000).toISOString()
                : new Date().toISOString()),
        };
    }

    public async getOHLCV(symbol: string, _timeframe = "DAILY"): Promise<Candle[]> {
        const payload = await this.request<TwelveDataTimeSeries>("time_series", {
            symbol: symbol.toUpperCase(),
            interval: "1day",
            outputsize: "100",
            order: "asc",
        });
        const candles = (payload.values || [])
            .filter((value) => value.close !== undefined)
            .map((value) => ({
                timestamp: value.datetime,
                open: Number(value.open || 0),
                high: Number(value.high || 0),
                low: Number(value.low || 0),
                close: Number(value.close),
                volume: Number(value.volume || 0),
            }));
        if (candles.length === 0) {
            throw new Error(`Twelve Data returned no daily candles for ${symbol.toUpperCase()}.`);
        }
        return candles;
    }

    public async getFundamentals(symbol: string): Promise<Fundamentals> {
        const sym = symbol.toUpperCase();
        const [profile, statistics] = await Promise.all([
            this.request<TwelveDataProfile>("profile", { symbol: sym }),
            this.request<TwelveDataStatistics>("statistics", { symbol: sym }),
        ]);
        const metrics = statistics.statistics;
        const income = metrics?.financials?.income_statement;

        return {
            symbol: profile.symbol || sym,
            name: profile.name || sym,
            description: profile.description || "",
            sector: profile.sector || "Unknown",
            industry: profile.industry || "Unknown",
            marketCap: Number(metrics?.valuations_metrics?.market_capitalization || 0),
            peRatio: Number(metrics?.valuations_metrics?.trailing_pe || 0),
            pegRatio: 0,
            eps: Number(income?.diluted_eps_ttm || 0),
            revenueGrowthTTM: Number(income?.quarterly_revenue_growth || 0) * 100,
            profitMargin: Number(metrics?.financials?.profit_margin || 0) * 100,
            quarterlyEarningsGrowthYOY: 0,
            week52High: 0,
            week52Low: 0,
            dividendYield: 0,
        };
    }

    public async getNews(symbol: string): Promise<NewsItem[]> {
        const payload = await this.request<{ press_releases?: TwelveDataPressRelease[] }>("press_releases", {
            symbol: symbol.toUpperCase(),
            outputsize: "10",
        });
        return (payload.press_releases || []).map((item) => ({
            title: item.title || "Untitled market news",
            url: "",
            source: "Twelve Data",
            summary: item.body || "",
            publishedAt: item.datetime || new Date().toISOString(),
            sentimentScore: 0,
            sentimentLabel: "NEUTRAL" as const,
        }));
    }

    public async getMarketStatus(_region = "United States"): Promise<MarketStatusResult> {
        return {
            isOpen: false,
            status: "unknown",
            region: "US",
            primaryExchanges: "",
            localOpen: "",
            localClose: "",
            currentStatus: "Unknown",
            source: "FALLBACK",
            checkedAt: new Date().toISOString(),
        };
    }
}
