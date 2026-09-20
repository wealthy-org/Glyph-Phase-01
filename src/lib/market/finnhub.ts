import {
    Candle,
    Fundamentals,
    MarketDataProvider,
    MarketStatusResult,
    NewsItem,
    Quote,
} from "@/types/market";
import { TwelveDataProvider } from "./twelve-data";

interface FinnhubQuote {
    c?: number;
    d?: number;
    dp?: number;
    h?: number;
    l?: number;
    t?: number;
    v?: number;
}

interface FinnhubCandles {
    c?: number[];
    h?: number[];
    l?: number[];
    o?: number[];
    s?: string;
    t?: number[];
    v?: number[];
}

interface FinnhubProfile {
    name?: string;
    ticker?: string;
    exchange?: string;
    finnhubIndustry?: string;
    weburl?: string;
}

interface FinnhubNewsItem {
    headline?: string;
    source?: string;
    summary?: string;
    url?: string;
    datetime?: number;
}

export class FinnhubProvider implements MarketDataProvider {
    public name = "Finnhub";
    private readonly apiKey: string;
    private readonly baseUrl = "https://finnhub.io/api/v1";

    constructor(apiKey = process.env.FINNHUB_API_KEY) {
        if (!apiKey) {
            throw new Error("FINNHUB_API_KEY is not configured in environment variables.");
        }
        this.apiKey = apiKey;
    }

    private async request<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        url.searchParams.set("token", this.apiKey);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }

        const response = await fetch(url, {
            headers: { "User-Agent": "Glyph-Autonomous-Agent/1.0" },
        });
        const text = await response.text();
        let payload: T | { error?: string; message?: string };
        try {
            payload = JSON.parse(text) as T | { error?: string; message?: string };
        } catch {
            throw new Error(`Finnhub ${endpoint} error (${response.status}): ${text.slice(0, 160)}`);
        }

        if (!response.ok) {
            const errorPayload = payload as { error?: string; message?: string };
            throw new Error(`Finnhub ${endpoint} error (${response.status}): ${errorPayload.error || errorPayload.message || response.statusText}`);
        }
        return payload as T;
    }

    public async getQuote(symbol: string): Promise<Quote> {
        const sym = symbol.toUpperCase();
        const payload = await this.request<FinnhubQuote>("quote", { symbol: sym });
        if (!payload.c) throw new Error(`Finnhub returned no quote for ${sym}.`);

        return {
            symbol: sym,
            price: payload.c,
            change: payload.d || 0,
            changePercent: payload.dp || 0,
            volume: payload.v || 0,
            high: payload.h || 0,
            low: payload.l || 0,
            timestamp: payload.t ? new Date(payload.t * 1000).toISOString() : new Date().toISOString(),
        };
    }

    public async getOHLCV(symbol: string): Promise<Candle[]> {
        const now = Math.floor(Date.now() / 1000);
        let payload: FinnhubCandles;
        try {
            payload = await this.request<FinnhubCandles>("stock/candle", {
                symbol: symbol.toUpperCase(),
                resolution: "D",
                from: String(now - 180 * 24 * 60 * 60),
                to: String(now),
            });
        } catch (error) {
            if (String(error).includes("403") && process.env.TWELVE_DATA_API_KEY) {
                console.warn(`[Finnhub] Candle access denied; using Twelve Data candle fallback for ${symbol.toUpperCase()}.`);
                return new TwelveDataProvider().getOHLCV(symbol);
            }
            throw new Error(
                `Finnhub candle access denied for ${symbol.toUpperCase()}. ` +
                "The free Finnhub plan/key does not allow stock candles; configure TWELVE_DATA_API_KEY as a fallback or use a Finnhub plan with candle access."
            );
        }
        if (payload.s !== "ok" || !payload.t || !payload.c) {
            throw new Error(`Finnhub returned no daily candles for ${symbol.toUpperCase()}.`);
        }

        return payload.t.map((timestamp, index) => ({
            timestamp: new Date(timestamp * 1000).toISOString().slice(0, 10),
            open: payload.o?.[index] || 0,
            high: payload.h?.[index] || 0,
            low: payload.l?.[index] || 0,
            close: payload.c?.[index] || 0,
            volume: payload.v?.[index] || 0,
        }));
    }

    public async getFundamentals(symbol: string): Promise<Fundamentals> {
        const sym = symbol.toUpperCase();
        const profile = await this.request<FinnhubProfile>("stock/profile2", { symbol: sym });

        return {
            symbol: profile.ticker || sym,
            name: profile.name || sym,
            description: profile.weburl || "",
            sector: profile.finnhubIndustry || "Unknown",
            industry: profile.finnhubIndustry || "Unknown",
            marketCap: 0,
            peRatio: 0,
            pegRatio: 0,
            eps: 0,
            revenueGrowthTTM: 0,
            profitMargin: 0,
            quarterlyEarningsGrowthYOY: 0,
            week52High: 0,
            week52Low: 0,
            dividendYield: 0,
        };
    }

    public async getNews(symbol: string): Promise<NewsItem[]> {
        const today = new Date();
        const from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const formatDate = (date: Date) => date.toISOString().slice(0, 10);
        const payload = await this.request<FinnhubNewsItem[]>("company-news", {
            symbol: symbol.toUpperCase(),
            from: formatDate(from),
            to: formatDate(today),
        });

        return payload.slice(0, 10).map((item) => ({
            title: item.headline || "Untitled market news",
            url: item.url || "",
            source: item.source || "Finnhub",
            summary: item.summary || "",
            publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : today.toISOString(),
            sentimentScore: 0,
            sentimentLabel: "NEUTRAL" as const,
        }));
    }

    public async getMarketStatus(): Promise<MarketStatusResult> {
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
