export type TradeAction = "LONG" | "SHORT";
export type ThesisStatus = "VALIDATED" | "INVALIDATED";
export type TradeFilter = "ALL" | "VALIDATED" | "INVALIDATED";
export type TradeLedgerFilter = "ALL" | "OPEN" | "CLOSED" | "PROFIT" | "LOSS";
export type TradeStatus = "OPEN" | "CLOSED" | "LIQUIDATED";

export interface Trade {
  id: string;
  tradeNumber?: string;
  dbId?: string;
  date: string;
  time?: string;
  timestamp?: string;
  asset: string;
  action: TradeAction;
  status?: TradeStatus;
  entry: string;
  exit: string;
  size?: string;
  leverage: string;
  pnl: string;
  pnlDollar?: string;
  pnlPercent?: string;
  pnlNumber?: number;
  isPositive: boolean | null;
  thesis: ThesisStatus;
  proofUrl?: string | null;
  refNumber?: string;
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
  score: number | null;
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
  isPositive: boolean | null;
  status: TradeStatus;
  entryPrice: string;
  exitPrice: string;
  positionSize?: string;
  notional?: string;
  quantity: string;
  currentPrice: string;
  marketValue: string;
  pnlValue: string;
  decisionThesis: string;
  fundamentalAnalysis: AnalysisScoreData;
  technicalAnalysis: AnalysisScoreData;
  catalyst: string;
  riskScore: number | null;
  invalidationLevel: string;
  onchainProof: {
    txHash: string | null;
    network: string;
    explorerUrl: string | null;
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
