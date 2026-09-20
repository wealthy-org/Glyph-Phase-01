import { PolicyConfig } from "./config";
import { PolicyDecision, PolicyPosition, PolicyState } from "./types";

export function validateDecision(decision: unknown): { valid: boolean; reason?: string } {
    if (!decision || typeof decision !== "object") return { valid: false, reason: "Decision is not an object" };
    return { valid: true };
}

export function validateConviction(conviction: number, config: PolicyConfig): boolean {
    return Number.isInteger(conviction) && conviction >= config.minConviction && conviction <= 100;
}

export function calculateAllocation(availableCash: number, config: PolicyConfig): number {
    if (!Number.isFinite(availableCash) || availableCash < 0) return 0;
    return Number((availableCash * config.positionAllocationPercent / 100).toFixed(4));
}

export function validateTreasury(availableCash: number, allocation: number): boolean {
    return Number.isFinite(availableCash) && availableCash >= 0 && allocation > 0 && allocation <= availableCash;
}

export function validateRemainingCash(
    availableCash: number,
    allocation: number,
    minimumRemainingCash: number
): boolean {
    const remainingCash = Number((availableCash - allocation).toFixed(4));
    return Number.isFinite(remainingCash) && remainingCash >= minimumRemainingCash && remainingCash >= 0;
}

export function hasExistingPosition(asset: string, positions: PolicyPosition[]): boolean {
    return positions.some((position) => position.asset.toUpperCase() === asset.toUpperCase());
}

export function validateRisk(state: PolicyState): boolean {
    return state.riskValid === true;
}

export function validateMarketAnalysis(state: PolicyState): boolean {
    return state.marketAnalysisValid === true && Number.isFinite(state.marketPrice) && state.marketPrice > 0;
}

export function findRejectionReason(
    decision: PolicyDecision,
    state: PolicyState,
    config: PolicyConfig,
    allocation: number
): string | undefined {
    if (decision.action === "NO_TRADE") return "LLM decision is NO_TRADE";
    if (!validateConviction(decision.conviction, config)) return `Conviction ${decision.conviction} is below minimum ${config.minConviction}`;
    if (!validateMarketAnalysis(state)) return "Market-analysis snapshot is invalid or missing a valid market price";
    if (!validateRisk(state)) return "Required risk data is missing or invalid";
    if (hasExistingPosition(decision.asset, state.positions)) return `Existing position already exists for ${decision.asset}`;
    if (!validateTreasury(state.availableCash, allocation)) return "Available treasury cash is insufficient for allocation";
    if (!validateRemainingCash(state.availableCash, allocation, config.minRemainingCash)) {
        return `Allocation would leave less than the minimum remaining cash of $${config.minRemainingCash.toFixed(2)}`;
    }
    return undefined;
}