export type PolicyAction = "LONG" | "SHORT" | "NO_TRADE";

export interface PolicyDecision {
    asset: string;
    action: PolicyAction;
    conviction: number;
    thesis: {
        fundamental: string;
        technical: string;
        risk: string;
        invalidation: string;
    };
    source: {
        marketAnalysisSnapshotId: string;
    };
}

export interface PolicyPosition {
    asset: string;
    side: "LONG" | "SHORT";
}

export interface PolicyState {
    availableCash: number;
    positions: PolicyPosition[];
    marketPrice: number;
    marketOpen: boolean;
    marketAnalysisValid: boolean;
    riskValid: boolean;
}

export interface PolicyChecks {
    decisionValid: boolean;
    minimumConviction: boolean;
    treasurySufficient: boolean;
    minimumRemainingCash: boolean;
    noExistingPosition: boolean;
    marketOpen: boolean;
    riskValid: boolean;
    marketAnalysisValid: boolean;
}

export interface PolicyResult {
    asset: string;
    action: PolicyAction;
    conviction: number;
    result: "APPROVED" | "REJECTED";
    allocation: {
        percent: number;
        amount: number;
        quantity: number;
        remainingCash: number;
    } | null;
    paperTradeInstruction: {
        asset: string;
        action: "LONG" | "SHORT";
        executionPrice: number;
        allocationAmount: number;
        quantity: number;
    } | null;
    checks: PolicyChecks;
    reason?: string;
}

