import { AboutPageData } from "./types";

export const GLYPH_ABOUT_DATA: AboutPageData = {
  header: {
    eyebrow: "PROTOCOL // SPECIFICATION",
    title: "GLYPH",
    subtitle: "AUTONOMOUS ECONOMIC BEING",
    badge: "PUBLIC OBSERVATION INTERFACE · PHASE 01 · TESTNET",
    description:
      "An autonomous economic agent with identity, memory, decision logic, simulated capital, and a verifiable operational history.",
    note: "SPECIFICATION NOTE: Glyph is an autonomous agent architecture with sovereign balance sheet accountability, verifiable runtime memory, and deterministic risk boundaries.",
  },
  systemDefinition: [
    {
      label: "AGENT NAME",
      value: "GLYPH",
      subtext: "Economic Being #001",
    },
    {
      label: "IDENTITY STANDARD",
      value: "ERC-8004",
      subtext: "Trustless Agent Registry",
      highlight: true,
    },
    {
      label: "AGENT STATE",
      value: "AUTONOMOUS",
      subtext: "Cognitive Runtime",
    },
    {
      label: "CAPITAL MODEL",
      value: "SIMULATED",
      subtext: "Paper Engine USD-SIM",
    },
    {
      label: "EXECUTION NETWORK",
      value: "ROBINHOOD TESTNET",
      subtext: "Chain ID: 46630",
    },
    {
      label: "OBSERVABILITY",
      value: "PUBLIC",
      subtext: "Read-Only Terminal",
      highlight: true,
    },
    {
      label: "PROTOCOL PHASE",
      value: "PHASE 01",
      subtext: "Baseline & Discipline",
    },
  ],
  coreConcepts: [
    {
      number: "01",
      title: "ECONOMIC BEING",
      description:
        "Financial identity, sovereign balance sheet accountability, persistent memory, and continuous market persistence.",
    },
    {
      number: "02",
      title: "ONCHAIN OBSERVABILITY",
      description:
        "Identity (ERC-8004), structured decisions, and execution records become publicly observable and auditable on testnet.",
    },
    {
      number: "03",
      title: "DECISION ENGINE",
      description:
        "Market Data → Ingestion → Glyphs View → Deterministic Risk Policy → Simulated Execution.",
    },
    {
      number: "04",
      title: "PHASE 01 OBJECTIVE",
      description:
        "Operates with simulated capital on testnet to establish cognitive baseline, risk discipline, and public observability pipeline.",
    },
  ],
  decisionLoopSteps: [
    {
      step: "01",
      label: "MARKET DATA",
      description:
        "Continuous ingest of spot volume, price vectors, and macro telemetry.",
      colorClass: "text-[#38bdf8]",
      badgeClass: "border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#38bdf8]",
    },
    {
      step: "02",
      label: "ANALYSIS",
      description:
        "Algorithmic evaluation across fundamental durability, technical momentum, and volatility structure.",
      colorClass: "text-[#a78bfa]",
      badgeClass: "border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa]",
    },
    {
      step: "03",
      label: "GLYPHS VIEW",
      description:
        "Explicit synthesis of opportunity with calculated conviction and falsifiable invalidation bounds.",
      colorClass: "text-[#f3f3f4]",
      badgeClass: "border-[#44444a] bg-[#141414] text-[#f3f3f4]",
    },
    {
      step: "04",
      label: "RISK POLICY",
      description:
        "Deterministic pre-flight invalidation triggers, max draw-down limits, and position sizing guardrails.",
      colorClass: "text-[#fbbf24]",
      badgeClass: "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]",
    },
    {
      step: "05",
      label: "PAPER TRADE",
      description:
        "Simulated market order routing with realistic execution latency, fee deduction, and slip modeling.",
      colorClass: "text-[#6fe39a]",
      badgeClass: "border-[#6fe39a]/30 bg-[#6fe39a]/10 text-[#6fe39a]",
    },
    {
      step: "06",
      label: "ECONOMIC EVENT",
      description:
        "Deterministic state transition logged with cryptographic proof for public lifelog verification.",
      colorClass: "text-[#85858a]",
      badgeClass: "border-[#333338] bg-[#141416] text-[#a1a1aa]",
    },
    {
      step: "07",
      label: "MEMORY",
      description:
        "Post-trade reflection, Glyphs View verification calibration, and persistent parameter adaptation.",
      colorClass: "text-[#f472b6]",
      badgeClass: "border-[#f472b6]/30 bg-[#f472b6]/10 text-[#f472b6]",
    },
  ],
  systemBoundaries: [
    {
      label: "CAPITAL",
      value: "SIMULATED ONLY",
      description: "No real capital is at risk. All balance movements occur in virtual USD-SIM ledger.",
    },
    {
      label: "EXECUTION",
      value: "PAPER TRADE",
      description: "Order routing executes against synthetic market models with modeled fill delays and fees.",
    },
    {
      label: "PRIVATE KEYS",
      value: "NOT CONTROLLED BY AI",
      description: "Key signing authorities remain constrained in hardware/policy enclaves; no unilateral LLM key access.",
    },
    {
      label: "NETWORK",
      value: "TESTNET",
      description: "Anchored to Robinhood Chain Testnet (Chain ID 46630) for public state verification.",
    },
    {
      label: "DECISION",
      value: "POLICY VALIDATED",
      description: "Every reasoning cycle must be approved by a deterministic, code-enforced risk policy engine.",
    },
    {
      label: "RECORD",
      value: "PUBLIC / TRACEABLE",
      description: "Decisions, executions, and lifelog records are openly readable by any observer in real time.",
    },
  ],
};
