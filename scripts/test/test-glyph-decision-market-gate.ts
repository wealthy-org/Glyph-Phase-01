import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getGlyphDecisionMarketStatus } from "../glyph-decision/trade-cycle/market-gate";

const originalFetch = globalThis.fetch;
const originalMarketDataApiKey = process.env.MARKET_DATA_API_KEY;
const marketStatusCachePath = path.join(process.cwd(), ".cache", "market", "market_status.json");

function clearMarketStatusCache(): void {
    fs.rmSync(marketStatusCachePath, { force: true });
}

function alphaVantageResponse(currentStatus: string, region = "United States"): Response {
    return new Response(JSON.stringify({
        markets: [{
            market_type: "Equity",
            region,
            primary_exchanges: "NASDAQ, NYSE, AMEX, BATS",
            local_open: "09:30",
            local_close: "16:15",
            current_status: currentStatus,
            notes: "",
        }],
    }), { status: 200, headers: { "content-type": "application/json" } });
}

async function main(): Promise<void> {
    try {
        process.env.MARKET_DATA_API_KEY = "test-key";

        clearMarketStatusCache();
        globalThis.fetch = async () => alphaVantageResponse("open");
        const open = await getGlyphDecisionMarketStatus();
        assert.equal(open.isOpen, true);
        assert.equal(open.status, "open");
        assert.equal(open.currentStatus, "open");
        assert.equal(open.localClose, "16:15");
        assert.equal(open.primaryExchanges, "NASDAQ, NYSE, AMEX, BATS");

        clearMarketStatusCache();
        globalThis.fetch = async () => alphaVantageResponse("closed");
        const closed = await getGlyphDecisionMarketStatus();
        assert.equal(closed.isOpen, false);
        assert.equal(closed.status, "closed");
        assert.equal(closed.currentStatus, "closed");

        clearMarketStatusCache();
        globalThis.fetch = async () => alphaVantageResponse("closed");
        const providerClosedWeekendOrHoliday = await getGlyphDecisionMarketStatus();
        assert.equal(providerClosedWeekendOrHoliday.status, "closed");
        assert.notEqual(providerClosedWeekendOrHoliday.status, "unknown");

        clearMarketStatusCache();
        globalThis.fetch = async () => alphaVantageResponse("open", "Canada");
        const missingUsEquity = await getGlyphDecisionMarketStatus();
        assert.equal(missingUsEquity.isOpen, false);
        assert.equal(missingUsEquity.status, "unknown");

        clearMarketStatusCache();
        globalThis.fetch = async () => new Response(JSON.stringify({ markets: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
        const malformedMarketList = await getGlyphDecisionMarketStatus();
        assert.equal(malformedMarketList.status, "unknown");

        clearMarketStatusCache();
        globalThis.fetch = async () => new Response(JSON.stringify({ message: "Rate limit" }), {
            status: 429,
            headers: { "content-type": "application/json" },
        });
        const apiError = await getGlyphDecisionMarketStatus();
        assert.equal(apiError.status, "unknown");

        clearMarketStatusCache();
        globalThis.fetch = async () => new Response("not-json", { status: 200 });
        const malformedResponse = await getGlyphDecisionMarketStatus();
        assert.equal(malformedResponse.status, "unknown");

        console.log("Alpha Vantage market gate tests passed: open, closed, provider-closed, missing market, API error, and malformed response");
    } finally {
        globalThis.fetch = originalFetch;
        if (originalMarketDataApiKey === undefined) delete process.env.MARKET_DATA_API_KEY;
        else process.env.MARKET_DATA_API_KEY = originalMarketDataApiKey;
        clearMarketStatusCache();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
