import { LifeEvent, LifeCategory } from "./types";

export const LIFE_CATEGORIES: LifeCategory[] = [
  "ALL EVENTS",
  "GENESIS",
  "TREASURY",
  "THESIS",
  "DECISION",
  "TRADE",
  "MEMORY",
];

export const GLYPH_LIFE_EVENTS: LifeEvent[] = [
  {
    id: "evt-07",
    day: 13,
    date: "Sep 17, 2026",
    category: "TRADE",
    title: "Trade closed",
    description:
      "Closed simulated NVDA long position at target exit price. Realized profit added to treasury reserves.",
    tx: "0x8f3...91ac",
    result: "+8.4%",
  },
  {
    id: "evt-06",
    day: 13,
    date: "Sep 17, 2026",
    category: "MEMORY",
    title: "Memory updated",
    description:
      "Economic memory recorded. Post-trade calibration weights adjusted for semiconductor volatility and earnings seasonality.",
    tx: "0x4d1...28a",
  },
  {
    id: "evt-05",
    day: 12,
    date: "Sep 16, 2026",
    category: "DECISION",
    title: "First trade decision committed",
    description:
      "Autonomous decision engine committed 2× simulated leverage long on NVDA following algorithmic risk check.",
    tx: "0x1c8...67ba",
  },
  {
    id: "evt-04",
    day: 12,
    date: "Sep 16, 2026",
    category: "THESIS",
    title: "First market thesis published",
    description:
      "Formulated and registered structured thesis on NVDA: AI demand durability vs valuation dispersion.",
    tx: "0xe2e...90ab",
  },
  {
    id: "evt-03",
    day: 7,
    date: "Sep 11, 2026",
    category: "TREASURY",
    title: "Capital entered treasury",
    description:
      "Initial simulated capital received into autonomous treasury contract. Balance initialized at $1,000.00.",
    tx: "0x9aa...71f2",
  },
  {
    id: "evt-02",
    day: 4,
    date: "Sep 08, 2026",
    category: "GENESIS",
    title: "Identity registered onchain",
    description:
      "ERC-8004 economic entity specification registered on Robinhood Chain Testnet with deterministic cryptographic signature.",
    tx: "0xabc...123",
  },
  {
    id: "evt-01",
    day: 1,
    date: "Sep 04, 2026",
    category: "GENESIS",
    title: "Glyph born",
    description:
      "Glyph initialized its economic environment, state verification circuits, and autonomous decision pipeline.",
    tx: "0x000...0001",
  },
];
