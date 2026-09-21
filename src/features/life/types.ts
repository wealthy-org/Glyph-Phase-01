export type StreamFilterCategory =
  | "ALL"
  | "ANALYSIS"
  | "TRADE"
  | "MEMORY"
  | "SYSTEM"
  | "TREASURY";

// Backwards compatibility aliases
export type LifeCategory =
  | "ALL EVENTS"
  | "GENESIS"
  | "TREASURY"
  | "THESIS"
  | "DECISION"
  | "TRADE"
  | "MEMORY";

export type EventCategory =
  | "GENESIS"
  | "TREASURY"
  | "THESIS"
  | "DECISION"
  | "TRADE"
  | "MEMORY";

export interface DecisionDetail {
  id: string;
  asset: string;
  action: string;
  conviction: number;
  timeHorizon?: string | null;
  fundamentalScore?: number | null;
  technicalScore?: number | null;
  riskScore?: number | null;
  policyResult: string;
  policyRejectReason?: string | null;
  thesis?: {
    fundamental?: string;
    technical?: string;
    catalyst?: string;
    risk?: string;
    invalidation?: string;
  };
  decisionHash?: string | null;
  transactionHash?: string | null;
}

export interface TradeDetail {
  id: string;
  tradeNumber: string;
  asset: string;
  action: string;
  entryPrice: number;
  quantity: number | null;
  exitPrice?: number | null;
  positionSize: number;
  leverage: number;
  status: string;
  simulatedPnl?: number | null;
  simulatedPnlPercent?: number | null;
  stopLoss?: number | null;
  targetPrice?: number | null;
  invalidationLevel?: number | null;
}

export interface MemoryDetail {
  id: string;
  outcome: string;
  thesisResult: string;
  lesson: string;
  adaptation?: string | null;
  weightShift?: string | null;
  confidenceCalibration?: string | null;
}

export interface AnalysisDetail {
  asset: string;
  snapshotId: string | null;
  status: "COMPLETED" | "FAILED";
  classification: string | null;
  price: number | null;
  trend: string | null;
  sma20: number | null;
  sma50: number | null;
  rsi14: number | null;
  support: number | null;
  resistance: number | null;
  volatilityPercent: number | null;
  volumeRatio: number | null;
  fundamentalScore: number | null;
  earningsPerShare: number | null;
  profitMarginPercent: number | null;
  technicalScore: number | null;
  regime: string | null;
  riskLevel: string | null;
  riskDetails: string | null;
  decisionSignal: string | null;
}

export interface LifeEvent {
  id: string;
  day: number;
  date: string;
  time: string;
  timestamp: string;
  eventType: string;
  category: EventCategory;
  streamType: "MARKET" | "ANALYSIS" | "DECISION" | "TRADE" | "RISK" | "MEMORY" | "SYSTEM" | "TREASURY";
  refNumber: string;
  status: string;
  statusTone?: "positive" | "negative" | "neutral" | "warning";
  title: string;
  description: string;
  shortMeta?: string;
  actionLabel?: string | null;
  tx?: string | null;
  txHash?: string | null;
  result?: string | null;
  tradeId?: string | null;
  decisionId?: string | null;
  cycleId?: string | null;
  decision?: DecisionDetail | null;
  trade?: TradeDetail | null;
  memory?: MemoryDetail | null;
  analysis?: AnalysisDetail | null;
}

