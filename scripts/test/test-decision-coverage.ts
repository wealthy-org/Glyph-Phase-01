import { buildDecisionUserPrompt } from "../../src/lib/decision/prompt";
import { GlyphDecisionSchema } from "../../src/lib/decision/schema";
import { validateTradeProposal } from "../../src/lib/policy";
import { SynthesizedResearch } from "../../src/types/market";

const research: SynthesizedResearch = {
    asset: "NVDA",
    timestamp: "2026-09-19T00:00:00.000Z",
    marketData: {
        quote: {
            symbol: "NVDA",
            price: 200,
            change: 1,
            changePercent: 0.5,
            volume: 1000000,
            high: 205,
            low: 195,
            timestamp: "2026-09-19T00:00:00.000Z",
        },
        candles: [],
    },
    technicalData: {
        currentPrice: 200,
        sma20: 198,
        sma50: 190,
        rsi14: 55,
        trend: "NEUTRAL",
        supportLevel: 190,
        resistanceLevel: 210,
        volatilityPercent: 2,
        volumeRatio: 1,
        technicalScore: 65,
    },
    fundamentalData: {
        marketCap: 1000000,
        peRatio: 30,
        revenueGrowthPercent: 10,
        profitMarginPercent: 20,
        earningsPerShare: 5,
        sector: "Technology",
        sentimentAverage: 0,
        sentimentVerdict: "NEUTRAL",
        keyHeadlines: ["Neutral market update"],
        fundamentalScore: 65,
    },
    newsData: [],
    sourceMetadata: {
        provider: "deterministic-test",
        fetchedAt: "2026-09-19T00:00:00.000Z",
        isCached: false,
    },
};

const thesis = {
    fundamental: "Fundamental evidence is sufficient for a structured decision.",
    technical: "Technical evidence is sufficient for a structured decision.",
    catalyst: "Current market catalyst remains observable and relevant.",
    risk: "Risk remains bounded by the simulated policy limits.",
    invalidation: "The thesis is invalidated if the current support level breaks.",
};

function decision(action: "OPEN_LONG" | "OPEN_SHORT" | "HOLD" | "CLOSE" | "NO_TRADE") {
    return {
        asset: "NVDA",
        action,
        conviction: 80,
        time_horizon: "1d_to_14d",
        fundamental_score: 65,
        technical_score: 65,
        risk_score: 40,
        thesis,
        position_size_percent: 5,
        leverage: 1,
    };
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
}

function runDecisionCoverageTests() {
    const noPositionPrompt = buildDecisionUserPrompt(
        research,
        { cash: 1000, equity: 1000 },
        null
    );
    assert(noPositionPrompt.includes("OPEN_LONG, OPEN_SHORT, or NO_TRADE"), "No-position prompt omits open action space");
    assert(!noPositionPrompt.includes("Allowed actions for this asset: HOLD or CLOSE"), "No-position prompt exposes active-position actions");

    const longPositionPrompt = buildDecisionUserPrompt(
        research,
        { cash: 900, equity: 1000 },
        {
            asset: "NVDA",
            side: "LONG",
            entryPrice: 190,
            currentPrice: 200,
            unrealizedPnl: 10,
            unrealizedPnlPercent: 5.26,
            openedAt: "2026-09-18T00:00:00.000Z",
        }
    );
    assert(longPositionPrompt.includes("Side: LONG"), "LONG position context is missing");
    assert(longPositionPrompt.includes("Allowed actions for this asset: HOLD or CLOSE"), "LONG prompt omits HOLD/CLOSE");

    const shortPositionPrompt = buildDecisionUserPrompt(
        research,
        { cash: 900, equity: 1000 },
        {
            asset: "NVDA",
            side: "SHORT",
            entryPrice: 210,
            currentPrice: 200,
            unrealizedPnl: 10,
            unrealizedPnlPercent: 4.76,
            openedAt: "2026-09-18T00:00:00.000Z",
        }
    );
    assert(shortPositionPrompt.includes("Side: SHORT"), "SHORT position context is missing");
    assert(shortPositionPrompt.includes("Allowed actions for this asset: HOLD or CLOSE"), "SHORT prompt omits HOLD/CLOSE");

    const cases = [
        { action: "OPEN_LONG" as const, position: null, expectedApproved: true },
        { action: "OPEN_SHORT" as const, position: null, expectedApproved: true },
        { action: "NO_TRADE" as const, position: null, expectedApproved: true },
        { action: "HOLD" as const, position: { asset: "NVDA", side: "LONG" as const }, expectedApproved: true },
        { action: "CLOSE" as const, position: { asset: "NVDA", side: "LONG" as const }, expectedApproved: true },
        { action: "HOLD" as const, position: { asset: "NVDA", side: "SHORT" as const }, expectedApproved: true },
        { action: "CLOSE" as const, position: { asset: "NVDA", side: "SHORT" as const }, expectedApproved: true },
    ];

    for (const testCase of cases) {
        const parsed = GlyphDecisionSchema.safeParse(decision(testCase.action));
        assert(parsed.success, `${testCase.action} was rejected by the decision schema`);

        const result = validateTradeProposal(
            {
                asset: "NVDA",
                action: testCase.action,
                conviction: 80,
                positionSizePercent: 5,
                leverage: 1,
            },
            testCase.position ? 1 : 0,
            0,
            testCase.position,
            true,
            { availableCapital: 1000, totalEquity: 1000 }
        );
        assert(result.approved === testCase.expectedApproved, `${testCase.action} policy result was unexpected`);
    }

    // Zero-Capital Economic Precondition Coverage
    const zeroCapitalActions = ["OPEN_LONG", "OPEN_SHORT"] as const;
    for (const act of zeroCapitalActions) {
        const zeroRes = validateTradeProposal(
            { asset: "NVDA", action: act, conviction: 80, positionSizePercent: 5, leverage: 1 },
            0,
            0,
            null,
            true,
            { availableCapital: 0, totalEquity: 0 }
        );
        assert(!zeroRes.approved, `${act} with $0 capital should be rejected`);
        assert(
            zeroRes.rejectReason?.includes("INSUFFICIENT_TREASURY") === true,
            `${act} rejection reason should mention INSUFFICIENT_TREASURY`
        );
    }

    console.log("Decision coverage passed: schema, no-position, LONG, SHORT, all five actions, and zero-treasury guard.");
}

try {
    runDecisionCoverageTests();
} catch (error) {
    console.error("Decision coverage failed:", error);
    process.exit(1);
}
