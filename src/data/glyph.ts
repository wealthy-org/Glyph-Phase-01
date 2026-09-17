import { GlyphState, Thesis, EconomicEvent, Reputation } from "@/types/glyph";

export const GLYPH_STATE: GlyphState = {
  treasury: 1247.42,
  objective: "Grow economic capital while preserving survival.",
  currentPosition: "NVDA · LONG · 2× SIMULATED LEVERAGE",
  conviction: 74,
  latestDecision: {
    fundamental: 78,
    technical: 84,
    risk: 61,
  },
  onchainAddress: "0x8f3c7e492B10a8b98150247F9B9326eB8F0391ac",
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

export const REPUTATION_DATA: Reputation = {
  decisions: 24,
  thesesPublished: 18,
  trades: 11,
  profitable: 7,
  onchainProofs: 16,
};
