import {
    Candle,
    Fundamentals,
    MarketDataProvider,
    MarketStatusResult,
    NewsItem,
    Quote,
} from "@/types/market";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
    return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function numberValue(value: unknown): number {
    return typeof value === "number" ? value : Number(value || 0);
}

export class StockfitProvider implements MarketDataProvider {
    public name = "StockFit";
    private readonly apiKey: string;
    private readonly baseUrl = "https://api.stockfit.io/v1";

    constructor(apiKey = process.env.STOCKFIT_API_KEY) {
        if (!apiKey) throw new Error("STOCKFIT_API_KEY is not configured in environment variables.");
        this.apiKey = apiKey;
    }

    private async request<T>(endpoint: string, params: Record<string, string>): Promise<T> {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: "application/json",
            },
        });
        const text = await response.text();
        let payload: unknown;
        try {
            payload = JSON.parse(text);
        } catch {
            throw new Error(`StockFit ${endpoint} error (${response.status}): ${text.slice(0, 160)}`);
        }
        if (!response.ok) {
            const error = asRecord(payload);
            throw new Error(`StockFit ${endpoint} error (${response.status}): ${String(error.message || error.error || response.statusText)}`);
        }
        return payload as T;
    }

    public async getQuote(symbol: string): Promise<Quote> {
        const sym = symbol.toUpperCase();
        const payload = asRecord(await this.request<unknown>("/api/price/quote", { symbols: sym }));
        const quote = asRecord(payload[sym] || payload.data || payload);
        const price = numberValue(quote.price || quote.close || quote.last);
        if (!price) throw new Error(`StockFit returned no quote for ${sym}.`);

        return {
            symbol: String(quote.symbol || sym),
            price,
            change: numberValue(quote.change),
            changePercent: numberValue(quote.changePercent || quote.percentChange),
            volume: numberValue(quote.volume),
            high: numberValue(quote.high),
            low: numberValue(quote.low),
            timestamp: String(quote.timestamp || quote.datetime || new Date().toISOString()),
        };
    }

    public async getOHLCV(symbol: string): Promise<Candle[]> {
        const payload = asRecord(await this.request<unknown>("/api/price/history", {
            symbol: symbol.toUpperCase(),
            resolution: "1d",
            limit: "100",
        }));
        const values = Array.isArray(payload.data) ? payload.data : Array.isArray(payload.values) ? payload.values : [];
        const latest = asRecord(payload.latest);
        const candles = values.flatMap((value): Candle[] => {
            if (!Array.isArray(value) || value.length < 2) return [];
            return [{
                timestamp: new Date(numberValue(value[0])).toISOString(),
                open: 0,
                high: 0,
                low: 0,
                close: numberValue(value[1]),
                volume: 0,
            }];
        });
        if (candles.length === 0 && numberValue(latest.close)) {
            candles.push({
                timestamp: String(latest.timestamp || new Date().toISOString()),
                open: numberValue(latest.open),
                high: numberValue(latest.high),
                low: numberValue(latest.low),
                close: numberValue(latest.close),
                volume: numberValue(latest.volume),
            });
        }
        if (candles.length === 0) throw new Error(`StockFit returned no price history for ${symbol.toUpperCase()}.`);
        return candles;
    }

    public async getFundamentals(symbol: string): Promise<Fundamentals> {
        const sym = symbol.toUpperCase();
        const [detailsPayload, incomePayload] = await Promise.all([
            this.request<unknown>("/api/company/details", { symbol: sym }),
            this.request<unknown>("/api/financials/income-statement", { symbol: sym, period: "annual", limit: "3" }),
        ]);
        const details = asRecord(detailsPayload);
        const incomeList = Array.isArray(incomePayload) ? incomePayload : asRecord(incomePayload).data;
        const periods = Array.isArray(incomeList) ? incomeList : [];
        const latest = asRecord(periods[0]);
        const previous = asRecord(periods[1]);
        const facts = asRecord(latest.facts || latest);
        const revenue = numberValue(facts.revenue || facts.totalRevenue || facts.sales);
        const netIncome = numberValue(facts.netIncome || facts.netIncomeCommon);
        const previousFacts = asRecord(previous.facts || previous);
        const previousRevenue = numberValue(previousFacts.revenue || previousFacts.totalRevenue || previousFacts.sales);
        const revenueGrowth = revenue && previousRevenue
            ? ((revenue - previousRevenue) / previousRevenue) * 100
            : 0;
        const profitMargin = revenue ? (netIncome / revenue) * 100 : 0;

        return {
            symbol: String(details.symbol || sym),
            name: String(details.name || details.companyName || sym),
            description: String(details.description || ""),
            sector: String(details.sector || details.sicDescription || "Unknown"),
            industry: String(details.industry || details.sicDescription || "Unknown"),
            marketCap: numberValue(details.marketCap || details.marketCapitalization),
            peRatio: numberValue(details.peRatio),
            pegRatio: 0,
            eps: numberValue(facts.dilutedEps || facts.epsDiluted || facts.eps),
            revenueGrowthTTM: Number(revenueGrowth.toFixed(2)),
            profitMargin: Number(profitMargin.toFixed(2)),
            quarterlyEarningsGrowthYOY: 0,
            week52High: 0,
            week52Low: 0,
            dividendYield: 0,
        };
    }

    public async getNews(symbol: string): Promise<NewsItem[]> {
        const payload = await this.request<unknown>("/api/lookup/news", { symbol: symbol.toUpperCase() });
        const response = asRecord(payload);
        const data = response.data || response.news || response.items || response.results;
        const values: unknown[] = Array.isArray(payload) ? payload : Array.isArray(data) ? data : [];
        return values.slice(0, 10).map((item) => {
            const news = asRecord(item);
            return {
                title: String(news.headline || news.title || "Untitled market news"),
                url: String(news.url || news.link || ""),
                source: String(news.publisher || news.source || "StockFit"),
                summary: String(news.summary || ""),
                publishedAt: String(news.publishedAt || news.published_at || news.datetime || new Date().toISOString()),
                sentimentScore: 0,
                sentimentLabel: "NEUTRAL" as const,
            };
        });
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
