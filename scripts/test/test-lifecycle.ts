import { validateTradeProposal } from "../../src/lib/policy";
import { calculatePnL } from "../../src/lib/simulation-math";

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
}

function runLifecycleTests() {
    const noPosition = null;
    const longPosition = { asset: "NVDA", side: "LONG" as const };
    const shortPosition = { asset: "NVDA", side: "SHORT" as const };
    const economicContext = { availableCapital: 1000, totalEquity: 1000 };

    assert(
        validateTradeProposal({ asset: "NVDA", action: "OPEN_LONG", conviction: 80 }, 0, 0, noPosition, true, economicContext).approved,
        "NO_POSITION -> OPEN_LONG should be approved"
    );
    assert(
        validateTradeProposal({ asset: "NVDA", action: "OPEN_SHORT", conviction: 80 }, 0, 0, noPosition, true, economicContext).approved,
        "NO_POSITION -> OPEN_SHORT should be approved"
    );
    assert(
        validateTradeProposal({ asset: "NVDA", action: "HOLD", conviction: 80 }, 1, 0, longPosition).approved,
        "OPEN_LONG -> HOLD should be approved"
    );
    assert(
        validateTradeProposal({ asset: "NVDA", action: "CLOSE", conviction: 80 }, 1, 0, longPosition).approved,
        "OPEN_LONG -> CLOSE should be approved"
    );
    assert(
        validateTradeProposal({ asset: "NVDA", action: "HOLD", conviction: 80 }, 1, 0, shortPosition).approved,
        "OPEN_SHORT -> HOLD should be approved"
    );
    assert(
        validateTradeProposal({ asset: "NVDA", action: "CLOSE", conviction: 80 }, 1, 0, shortPosition).approved,
        "OPEN_SHORT -> CLOSE should be approved"
    );
    assert(
        !validateTradeProposal({ asset: "NVDA", action: "CLOSE", conviction: 80 }, 0, 0, noPosition).approved,
        "NO_POSITION -> CLOSE should be rejected"
    );
    assert(
        !validateTradeProposal({ asset: "NVDA", action: "OPEN_LONG", conviction: 80 }, 1, 0, longPosition).approved,
        "OPEN_LONG -> OPEN_LONG should be rejected"
    );
    assert(
        !validateTradeProposal({ asset: "NVDA", action: "OPEN_SHORT", conviction: 80 }, 1, 0, longPosition).approved,
        "OPEN_LONG -> OPEN_SHORT reversal should be rejected"
    );
    assert(
        !validateTradeProposal({ asset: "NVDA", action: "OPEN_LONG", conviction: 80 }, 1, 0, shortPosition).approved,
        "OPEN_SHORT -> OPEN_LONG reversal should be rejected"
    );

    const longPnl = calculatePnL("LONG", 100, 108, 100, 100);
    const shortPnl = calculatePnL("SHORT", 100, 92, 100, 100);
    assert(longPnl.pnlDollar === 8 && longPnl.pnlPercent === 8, "LONG PnL should be +8");
    assert(shortPnl.pnlDollar === 8 && shortPnl.pnlPercent === 8, "SHORT PnL should be +8");

    console.log("Lifecycle transitions and LONG/SHORT realized PnL checks passed.");
}

try {
    runLifecycleTests();
} catch (error) {
    console.error("Lifecycle test failed:", error);
    process.exit(1);
}
