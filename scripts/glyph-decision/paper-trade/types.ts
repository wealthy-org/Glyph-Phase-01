export interface PaperTradeInstruction {
    agentId: string;
    decisionId: string;
    asset: string;
    action: "LONG" | "SHORT";
    executionPrice: string;
    allocationAmount: string;
    quantity: string;
    researchSnapshotId: string;
    cycleId?: string;
    conviction: number;
    thesis: Record<string, unknown>;
}

export interface PaperTradeExecution {
    status: "CONFIRMED";
    tradeId: string;
    positionId: string;
    tradeNumber: string;
    asset: string;
    action: "LONG" | "SHORT";
    executionPrice: string;
    allocationAmount: string;
    quantity: string;
    remainingCash: string;
}