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
