import { POLICY_CONFIG, PolicyConfig, validatePolicyConfig } from "./config";
import {
    calculateAllocation,
    findRejectionReason,
    hasExistingPosition,
    validateConviction,
    validateMarketAnalysis,
    validateRemainingCash,
    validateRisk,
    validateTreasury,
} from "./rules";
import { PolicyDecisionSchema } from "./schema";
import { PolicyDecision, PolicyResult, PolicyState } from "./types";

export function evaluatePolicy(
    rawDecision: unknown,
    state: PolicyState,
    config: PolicyConfig = POLICY_CONFIG
): PolicyResult {
    validatePolicyConfig(config);
    const parsed = PolicyDecisionSchema.safeParse(rawDecision);
    const decision = parsed.success ? parsed.data as PolicyDecision : {
        asset: typeof (rawDecision as { asset?: unknown })?.asset === "string" ? String((rawDecision as { asset: string }).asset).toUpperCase() : "UNKNOWN",
        action: "NO_TRADE" as const,
        conviction: typeof (rawDecision as { conviction?: unknown })?.conviction === "number" ? (rawDecision as { conviction: number }).conviction : 0,
    } as PolicyDecision;

    const allocationAmount = parsed.success ? calculateAllocation(state.availableCash, config) : 0;
    const checks = {
        decisionValid: parsed.success,
        minimumConviction: parsed.success && validateConviction(decision.conviction, config),
        treasurySufficient: parsed.success && validateTreasury(state.availableCash, allocationAmount),
        minimumRemainingCash: parsed.success && validateRemainingCash(state.availableCash, allocationAmount, config.minRemainingCash),
        noExistingPosition: parsed.success && !hasExistingPosition(decision.asset, state.positions),
        riskValid: parsed.success && validateRisk(state),
        marketAnalysisValid: parsed.success && validateMarketAnalysis(state),
    };
    const reason = !parsed.success
        ? parsed.error.issues.map((issue) => `${issue.path.join(".") || "decision"}: ${issue.message}`).join(", ")
        : findRejectionReason(decision, state, config, allocationAmount);
    const approved = parsed.success && !reason && Object.values(checks).every(Boolean);
    const remainingCash = Number((state.availableCash - allocationAmount).toFixed(4));

    return {
        asset: decision.asset,
        action: decision.action,
        conviction: decision.conviction,
        result: approved ? "APPROVED" : "REJECTED",
        allocation: approved ? {
            percent: config.positionAllocationPercent,
            amount: allocationAmount,
            quantity: Number((allocationAmount / state.marketPrice).toFixed(8)),
            remainingCash: Math.max(0, remainingCash),
        } : null,
        paperTradeInstruction: approved && (decision.action === "LONG" || decision.action === "SHORT") ? {
            asset: decision.asset,
            action: decision.action,
            executionPrice: state.marketPrice,
            allocationAmount,
            quantity: Number((allocationAmount / state.marketPrice).toFixed(8)),
        } : null,
        checks,
        ...(reason ? { reason } : {}),
    };
}