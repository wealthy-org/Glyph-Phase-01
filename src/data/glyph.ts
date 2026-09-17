import { GlyphState, Thesis, EconomicEvent, Reputation, AdaptiveLearning } from "@/types/glyph";

export const GLYPH_STATE: GlyphState = {
  treasury: 1247.42,
  simulatedPortfolio: 1351.63,
  simulatedPnL: "+$104.21",
  simulatedPnLPercent: "+8.4%",
  paperEconomyLabel: "USD-SIM",
  objective: "Grow economic capital while preserving survival.",
  currentPosition: "NVDA · LONG · 2× SIMULATED LEVERAGE",
  conviction: 74,
  cognitiveCycle: 849,
  beingStatus: "ACTIVE & OBSERVING",
  lastHeartbeat: "4s ago",
  latestDecisionId: "0012",
  latestDecisionLabel: "BUY NVDA · 2× SIMULATED LEVERAGE",
  latestDecision: {
    fundamental: 78,
    technical: 84,
    risk: 61,
  },
  onchainAddress: "0x8f3c7e492B10a8b98150247F9B9326eB8F0391ac",
  decisionProof: {
    txHash: "0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
    network: "Robinhood Chain Testnet (Simulated Proof)",
    blockNumber: 19482014,
    stateRoot: "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3",
    timestamp: "Sep 17, 2026 · 11:42:09 UTC",
    explorerUrl: "https://sepolia.basescan.org/tx/0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
  },
};

export const CURRENT_THESIS: Thesis = {
  asset: "NVDA",
  direction: "LONG",
  fundamental: 78,
  technical: 84,
  catalyst: "Positive",
  risk: 61,
  invalidation: "Price breaks below $168",
  summary:
    "Revenue growth and AI infrastructure demand continue to support the long thesis, while valuation and volatility remain the primary risks.",
};

export const RECENT_EVENTS: EconomicEvent[] = [
  {
    id: "evt-06",
    day: 13,
    title: "Trade closed",
    result: "+8.4%",
    description: "System exited NVDA swing tranche following upper volatility threshold breach.",
  },
  {
    id: "evt-05",
    day: 12,
    title: "First trade decision committed",
    description: "Evaluated 4 equity symbols; committed capital to long thesis with 2x simulated leverage.",
  },
  {
    id: "evt-04",
    day: 12,
    title: "First market thesis published",
    description: "Fundamental and technical models converged on AI infrastructure supply constraints.",
  },
  {
    id: "evt-03",
    day: 7,
    title: "Capital entered treasury",
    description: "Initial seed liquidity allocated to autonomous economic pool.",
  },
  {
    id: "evt-02",
    day: 4,
    title: "Identity registered onchain",
    description: "Cryptographic identifier anchored to autonomous agent registry.",
  },
  {
    id: "evt-01",
    day: 1,
    title: "Glyph born",
    description: "Economic engine initialized. Autonomous observation and decision loop activated.",
  },
];

export const ADAPTIVE_LEARNINGS: AdaptiveLearning[] = [
  {
    id: "learn-02",
    decisionId: "0012",
    triggerEvent: "POST-TRADE CALIBRATION (DAY 13)",
    insight: "NVDA swing tranche hit target exit (+8.4%) faster than projected horizon (3 days vs 14 days estimated).",
    adaptation: "Increased model weighting on datacenter shipment delivery velocity; reduced volatility dampener coefficient by 6%.",
    weightShift: "+4.2% Momentum / -2.1% Macro Drag",
  },
  {
    id: "learn-01",
    decisionId: "0010",
    triggerEvent: "INVALIDATION RETROSPECTIVE (DAY 10)",
    insight: "ETH short stopped out at -2.3% due to sticky L2 blob demand countering mainnet fee contraction.",
    adaptation: "Added L2 fee migration velocity as a required input before shorting smart contract platform benchmarks.",
    weightShift: "+8.5% Cross-L2 Gas Heuristic",
  },
];

export const REPUTATION_DATA: Reputation = {
  decisions: 24,
  thesesPublished: 18,
  trades: 11,
  profitable: 7,
  onchainProofs: 16,
};

