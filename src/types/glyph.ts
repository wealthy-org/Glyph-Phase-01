export type GlyphState = {
  treasury: number;
  objective: string;
  currentPosition: string;
  conviction: number;
  latestDecision: {
    fundamental: number;
    technical: number;
    risk: number;
  };
  onchainAddress: string;
  cognitiveCycle?: number;
  beingStatus?: string;
  lastHeartbeat?: string;
  simulatedPortfolio?: number;
  simulatedPnL?: string;
  simulatedPnLPercent?: string;
  paperEconomyLabel?: string;
  latestDecisionId?: string;
  latestDecisionLabel?: string;
  decisionProof?: {
    txHash: string;
    network: string;
    blockNumber: number;
    stateRoot: string;
    timestamp: string;
    explorerUrl: string;
  };
};

export type Thesis = {
  asset: string;
  direction: "LONG" | "SHORT";
  fundamental: number;
  technical: number;
  catalyst: string;
  risk: number;
  invalidation: string;
  summary: string;
};

export type EconomicEvent = {
  id: string;
  day: number;
  title: string;
  description?: string;
  result?: string;
};

export type Reputation = {
  decisions: number;
  thesesPublished: number;
  trades: number;
  profitable: number;
  onchainProofs: number;
};

export type AdaptiveLearning = {
  id: string;
  decisionId: string;
  triggerEvent: string;
  insight: string;
  adaptation: string;
  weightShift: string;
};

