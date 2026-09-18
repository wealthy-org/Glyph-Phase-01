export type TradeAction = "LONG" | "SHORT";
export type ThesisStatus = "VALIDATED" | "INVALIDATED";
export type TradeFilter = "ALL" | "VALIDATED" | "INVALIDATED";

export interface Trade {
  id: string;
  date: string;
  asset: string;
  action: TradeAction;
  entry: string;
  exit: string;
  leverage: string;
  pnl: string;
  isPositive: boolean;
  thesis: ThesisStatus;
  proofUrl: string;
  positionSize?: string;
  notional?: string;
}

export interface TradeSummaryStats {
  totalExecuted: number;
  netPnl: string;
  winRatio: string;
  loggedRatio: string;
  network: string;
  networkChain: string;
}

export interface AnalysisScoreData {
  title: string;
  description: string;
  score: number;
  maxScore?: number;
}

export interface TradeDecisionDetail {
  id: string;
  tradeNumber: string;
  recordLabel?: string;
  asset: string;
  action: TradeAction;
  leverage: string;
  leverageLabel: string;
  resultPercent: string;
  isPositive: boolean;
  status: "CLOSED" | "OPEN";
  entryPrice: string;
  exitPrice: string;
  positionSize?: string;
  notional?: string;
  pnlValue: string;
  decisionThesis: string;
  fundamentalAnalysis: AnalysisScoreData;
  technicalAnalysis: AnalysisScoreData;
  catalyst: string;
  riskScore: number;
  invalidationLevel: string;
  onchainProof: {
    txHash: string;
    network: string;
    explorerUrl: string;
  };
  memory?: {
    outcome: "WIN" | "LOSS" | "BREAKEVEN";
    thesisResult: "CORRECT" | "INCORRECT" | "PARTIAL";
    lesson: string;
    confidenceCalibration: "GOOD" | "OVER_CONFIDENT" | "UNDER_CONFIDENT" | "NEUTRAL";
    adaptation?: string;
    weightShift?: string;
  };
}
