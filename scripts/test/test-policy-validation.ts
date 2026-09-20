import assert from "node:assert/strict";
import { POLICY_CONFIG } from "../glyph-decision/policy-validation/config";
import { evaluatePolicy } from "../glyph-decision/policy-validation/policy";

const decision = (overrides: Record<string, unknown> = {}) => ({
    asset: "NVDA",
    action: "LONG",
    conviction: 75,
    thesis: {
        fundamental: "Fundamentals support the proposed direction.",
        technical: "Technical structure supports the proposed direction.",
        risk: "Risk context is present and has been assessed.",
        invalidation: "The thesis is invalidated below the defined level.",
    },
    source: { marketAnalysisSnapshotId: "snapshot-1" },
    ...overrides,
});

const state = (availableCash: number, overrides: Record<string, unknown> = {}) => ({
    availableCash,
    positions: [],
    marketPrice: 180,
    marketAnalysisValid: true,
    riskValid: true,
    ...overrides,
});

function expectRejected(result: ReturnType<typeof evaluatePolicy>, reason: string): void {
    assert.equal(result.result, "REJECTED");
    assert.equal(result.reason, reason);
    assert.equal(result.allocation, null);
}

const approved = evaluatePolicy(decision(), state(1000));
assert.equal(approved.result, "APPROVED");
assert.equal(approved.allocation?.amount, 100);

expectRejected(
    evaluatePolicy(decision(), state(800, { positions: [{ asset: "NVDA", side: "LONG" }] })),
    "Existing position already exists for NVDA"
);

assert.equal(approved.checks.noExistingPosition, true);
assert.equal(
    evaluatePolicy(decision(), state(800, { positions: [{ asset: "NVDA", side: "LONG" }] })).checks.noExistingPosition,
    false
);
expectRejected(
    evaluatePolicy(decision(), state(50)),
    "Allocation would leave less than the minimum remaining cash of $100.00"
);
expectRejected(
    evaluatePolicy(decision(), state(105)),
    "Allocation would leave less than the minimum remaining cash of $100.00"
);

const fiveHundred = evaluatePolicy(decision(), state(500));
assert.equal(fiveHundred.result, "APPROVED");
assert.equal(fiveHundred.allocation?.amount, 50);
assert.equal(fiveHundred.allocation?.remainingCash, 450);

expectRejected(
    evaluatePolicy(decision({ conviction: 40 }), state(1000)),
    "Conviction 40 is below minimum 60"
);
expectRejected(
    evaluatePolicy(decision({ action: "NO_TRADE" }), state(1000)),
    "LLM decision is NO_TRADE"
);
expectRejected(
    evaluatePolicy(decision({ action: "INVALID_ACTION" }), state(1000)),
    "action: Invalid option: expected one of \"LONG\"|\"SHORT\"|\"NO_TRADE\""
);
expectRejected(
    evaluatePolicy(decision(), state(1000, { riskValid: false })),
    "Required risk data is missing or invalid"
);

const lowCash = evaluatePolicy(decision(), state(100.01));
assert.equal(lowCash.result, "REJECTED");
assert.ok(lowCash.allocation === null || lowCash.allocation.remainingCash >= 0);

assert.equal(POLICY_CONFIG.positionAllocationPercent, 10);
console.log("Policy validation tests passed: 10 cases");