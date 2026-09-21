import { MarketStatusResult } from "../../../src/types/market";

interface TwelveDataMarketState {
    name?: string;
    code?: string;
    country?: string;
    is_market_open?: boolean;
    time_to_open?: string;
    time_to_close?: string;
    time_after_open?: string;
}

function isNewYorkWeekend(date: Date): boolean {
    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "short",
    }).format(date);
    return weekday === "Sat" || weekday === "Sun";
}

export async function getGlyphDecisionMarketStatus(
    now = new Date()
): Promise<MarketStatusResult> {
    const checkedAt = now.toISOString();
    if (isNewYorkWeekend(now)) {
        return {
            isOpen: false,
            status: "closed",
            region: "United States",
            primaryExchanges: "NYSE, NASDAQ",
            localOpen: "09:30",
            localClose: "16:00",
            currentStatus: "closed",
            notes: "Weekend in America/New_York.",
            source: "API",
            checkedAt,
        };
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
        throw new Error("TWELVE_DATA_API_KEY is not configured; market status cannot be verified.");
    }

    const url = new URL("https://api.twelvedata.com/market_state");
    url.searchParams.set("exchange", "NYSE");
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url, {
        headers: { "User-Agent": "Glyph-Decision-Cron/1.0" },
    });
    const payload = await response.json() as TwelveDataMarketState[] | { status?: string; message?: string };
    if (!response.ok || !Array.isArray(payload)) {
        const message = !Array.isArray(payload) && payload.message ? payload.message : response.statusText;
        throw new Error(`Twelve Data market status failed (${response.status}): ${message}`);
    }

    const nyse = payload.find((market) => market.code === "XNYS") || payload[0];
    if (!nyse || typeof nyse.is_market_open !== "boolean") {
        throw new Error("Twelve Data returned no usable NYSE market status.");
    }

    const status = nyse.is_market_open ? "open" : "closed";
    const sessionNote = nyse.is_market_open
        ? "Regular or currently active NYSE session."
        : `NYSE closed; next open in ${nyse.time_to_open || "an unknown interval"}. Holiday and early-close state is provided by the exchange status API.`;

    return {
        isOpen: nyse.is_market_open,
        status,
        region: "United States",
        primaryExchanges: "NYSE, NASDAQ",
        localOpen: "09:30",
        localClose: "16:00",
        currentStatus: status,
        notes: sessionNote,
        source: "API",
        checkedAt,
    };
}
