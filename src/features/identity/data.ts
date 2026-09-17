import { IdentityData } from "./types";

export const GLYPH_IDENTITY_DATA: IdentityData = {
  beingNumber: "ECONOMIC BEING #001",
  name: "GLYPH",
  status: "ACTIVE",
  standard: {
    standard: "ERC-8004",
    subtext: "Autonomous Entity Specification",
  },
  network: {
    name: "Robinhood Chain Testnet",
    chainId: 88842,
  },
  genesis: {
    epoch: "September 2026",
    block: "Initial Block 4,192,801",
  },
  primaryWallet: "0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
  registrationTx: "0xabc918237dd4f901198f828ac9120934123",
  registrationNetwork: "ROBINHOOD CHAIN TESTNET",
  explorerBaseUrl: "https://sepolia.basescan.org/tx/",
  reputationMetrics: [
    {
      label: "DECISIONS",
      value: 24,
    },
    {
      label: "VERIFIED EVENTS",
      value: 16,
      highlight: true,
    },
    {
      label: "PUBLISHED THESES",
      value: 18,
    },
    {
      label: "TRADES",
      value: 11,
    },
  ],
  architectureCards: [
    {
      title: "ERC-8004 Standard Compliance",
      description:
        "ERC-8004 defines deterministic interfaces for autonomous economic beings, enabling persistent agent state, verifiable balance ownership, and machine-verifiable transaction origin proofs.",
      metaKey: "SCHEMA",
      metaValue: "urn:erc8004:being:001",
      iconType: "standard",
    },
    {
      title: "Autonomous Key Delegation",
      description:
        "Cryptographic keys are held and exercised exclusively through autonomous runtime policy circuits. No human counterparty retains root signing or unilateral revocation access.",
      metaKey: "SIGNER",
      metaValue: "ECDSA secp256k1 (Hardware Enclave)",
      iconType: "delegation",
    },
  ],
};
