import assert from "node:assert/strict";
import { getGlyphDecisionMarketStatus } from "../glyph-decision/trade-cycle/market-gate";

const originalFetch = globalThis.fetch;

async function main(): Promise<void> {
    try {
        const weekend = await getGlyphDecisionMarketStatus(new Date("2026-09-20T15:00:00.000Z"));
        assert.equal(weekend.isOpen, false);
        assert.equal(weekend.status, "closed");
        assert.match(weekend.notes || "", /Weekend/);

        process.env.TWELVE_DATA_API_KEY = "test-key";
        globalThis.fetch = async () => new Response(JSON.stringify([
            {
                name: "NYSE",
                code: "XNYS",
                country: "United States",
                is_market_open: true,
                time_to_open: "00:00:00",
                time_to_close: "06:00:00",
            },
        ]), { status: 200, headers: { "content-type": "application/json" } });

        const open = await getGlyphDecisionMarketStatus(new Date("2026-09-21T14:00:00.000Z"));
        assert.equal(open.isOpen, true);
        assert.equal(open.status, "open");

        globalThis.fetch = async () => new Response(JSON.stringify([
            {
                name: "NYSE",
                code: "XNYS",
                country: "United States",
                is_market_open: false,
                time_to_open: "18:00:00",
                time_to_close: "00:00:00",
            },
        ]), { status: 200, headers: { "content-type": "application/json" } });

        const closed = await getGlyphDecisionMarketStatus(new Date("2026-09-21T20:00:00.000Z"));
        assert.equal(closed.isOpen, false);
        assert.equal(closed.status, "closed");
        assert.match(closed.notes || "", /next open/);

        console.log("Glyph Decision market gate tests passed: weekend, open, and closed sessions");
    } finally {
        globalThis.fetch = originalFetch;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
