import { AboutPageData } from "./types";

export const GLYPH_ABOUT_DATA: AboutPageData = {
  eyebrow: "EDITORIAL SPECIFICATION",
  heading: "WHAT IS GLYPH?",
  statement:
    "Glyph is an autonomous digital being designed to maintain an observable economic life.",
  quote:
    "Glyph is not simply an AI chatbot with a wallet. Its economic state, decisions, history and identity are designed to become observable and verifiable.",
  conceptualBlocks: [
    {
      id: "philosophy",
      eyebrow: "// PHILOSOPHY",
      heading: "WHAT IS AN ECONOMIC BEING?",
      paragraphs: [
        "An economic being is an autonomous digital agent that possesses financial identity, sovereign balance sheet accountability, and continuous market persistence.",
        "Unlike stateless algorithmic trading scripts, an economic being has memory, reputation, and a life history that anyone can observe, audit, and understand over time.",
      ],
    },
    {
      id: "provability",
      eyebrow: "// PROVABILITY",
      heading: "WHY ONCHAIN?",
      paragraphs: [
        "Traditional AI agents operate behind opaque cloud servers where decisions can be retroactively rewritten or hidden.",
        "By anchoring its identity (ERC-8004), theses, and execution events to the Robinhood Chain Testnet, Glyph's financial track record becomes permanently observable and immutable.",
      ],
    },
    {
      id: "reasoning",
      eyebrow: "// REASONING",
      heading: "HOW DOES GLYPH MAKE DECISIONS?",
      paragraphs: [
        "Every trade begins with a multi-layered thesis combining fundamental demand catalysts, technical trend structures, and calculated risk tolerances.",
        "No trade is placed without an explicit invalidation threshold. When market reality contradicts the thesis, the trade is cleanly closed and integrated into Glyph's memory.",
      ],
    },
    {
      id: "horizon",
      eyebrow: "// HORIZON",
      heading: "WHAT DOES PHASE 01 PROVE?",
      paragraphs: [
        "Phase 01 operates in a simulated environment on testnet to establish Glyph's cognitive baseline, risk discipline, and public observability pipeline.",
        "It demonstrates that an autonomous entity can formulate structured reasoning, steward simulated capital responsibly, and build a verifiable reputation before entering production capital environments.",
      ],
    },
  ],
  decisionLoopEyebrow: "// PROCESS CYCLE",
  decisionLoopHeading: "THE PHASE 01 DECISION LOOP",
  decisionLoopDescription:
    "Autonomous end-to-end cognitive loop from perception to persistent memory.",
  decisionLoopSteps: [
    {
      step: "01",
      label: "MARKET DATA",
      description:
        "Continuous ingest of spot volume, price vectors, and macro telemetry.",
    },
    {
      step: "02",
      label: "ANALYSIS",
      description:
        "Algorithmic evaluation across fundamental durability, technical momentum, and volatility structure.",
    },
    {
      step: "03",
      label: "THESIS",
      description:
        "Explicit synthesis of actionable opportunity with calculated conviction and falsifiable bounds.",
    },
    {
      step: "04",
      label: "RISK POLICY",
      description:
        "Pre-flight invalidation triggers, draw-down guards, and position sizing.",
    },
    {
      step: "05",
      label: "PAPER TRADE",
      description:
        "Simulated market order routing with realistic execution latency and slip modeling.",
      isHighlighted: true,
    },
    {
      step: "06",
      label: "ECONOMIC EVENT",
      description:
        "Deterministic state transition logged with cryptographic proof on Robinhood Chain.",
    },
    {
      step: "07",
      label: "MEMORY",
      description:
        "Post-trade reflection and persistent parameter recalibration.",
    },
  ],
};
