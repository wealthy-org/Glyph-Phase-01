// ============================================================================
// GLYPH PHASE 01 — HOMEPAGE / LANDING DATA TYPES
// Derived from: BRIEF.md (§2.1, §2.2, §2.3, §2.5, §3.0A) & TODO.md
// Read-only public observation terminal types with strict nullability.
// ============================================================================

export interface LandingTreasuryData {
  currency: string;
  initialCapital: number;
  cashBalance: number; // Available unallocated cash from agent_treasuries
  allocatedMargin: number; // Locked margin across open positions
  unrealizedPnl: number; // Total floating PnL
  totalEquity: number; // Net NAV = cash + allocatedMargin + unrealizedPnl
  pnlDollar: number; // Net total return vs initial capital
  pnlPercent: number; // Total return percentage
  realizedPnl: number; // Cumulative realized PnL from closed trades
}

export interface LandingPositionItem {
  id: string;
  tradeId: string;
  tradeNumber: string;
  asset: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  margin: number;
  leverage: number;
  notional: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: string;
}

export interface LandingLatestDecision {
  id: string;
  asset: string;
  action: "LONG" | "SHORT" | "NO_TRADE";
  conviction: number;
  fundamentalScore: number | null;
  technicalScore: number | null;
  riskScore: number | null;
  policyResult: "APPROVED" | "REJECTED";
  policyRejectReason: string | null;
  thesis: {
    fundamental?: string;
    technical?: string;
    catalyst?: string;
    risk?: string;
    invalidation?: string;
  };
  decisionHash: string | null;
  transactionHash: string | null;
  explorerUrl: string | null;
  tradeId: string | null;
  tradeNumber: string | null;
  createdAt: string;
}

export interface LandingEconomicEvent {
  id: string;
  day: number;
  date: string;
  time: string;
  timestamp: string;
  eventType: string;
  title: string;
  description: string;
  result: string | null;
  txHash: string | null;
}

export interface LandingMemoryItem {
  id: string;
  tradeId: string | null;
  outcome: "WIN" | "LOSS" | "BREAKEVEN";
  pnlPercent: number | null;
  thesisResult: string;
  lesson: string;
  adaptation: string | null;
  weightShift: string | null;
  createdAt: string;
}

export interface LandingReputationData {
  decisionsCount: number;
  tradesCount: number;
  closedTradesCount: number;
  winningTradesCount: number;
  winRate: number | null; // null if 0 closed trades (renders as "—")
  thesesPublished: number;
  onchainAttestationsCount: number;
  realizedPnl: number;
}

export interface LandingAgentMeta {
  id: string;
  agentId: string;
  name: string;
  status: string;
  objective: string;
  activeDays: number;
  activeHours: number;
  createdAt: string;
}

export interface LandingPageData {
  agent: LandingAgentMeta;
  treasury: LandingTreasuryData;
  openPositions: LandingPositionItem[];
  latestDecision: LandingLatestDecision | null;
  recentEvents: LandingEconomicEvent[];
  latestMemory: LandingMemoryItem | null;
  adaptiveLearnings: LandingMemoryItem[];
  reputation: LandingReputationData;
  cognitiveCycleCount: number;
}
