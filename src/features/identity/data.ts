import { IdentityData } from "./types";

export const GLYPH_IDENTITY_DATA: IdentityData = {
  beingNumber: "VERIFIED AGENT · ID #1",
  name: "GLYPH",
  status: "ACTIVE",
  standard: {
    standard: "ERC-8004",
    subtext: "Trustless Agents Specification",
  },
  network: {
    name: "Robinhood Chain Testnet",
    chainId: 46630,
  },
  genesis: {
    epoch: "September 2026",
    block: "Block 120,766,742",
  },
  primaryWallet: "0x5cFc46E3e541531E2194185183971dCd9Eaaa384",
  registrationTx: "0xa547e955ec33ca107054a74d1c6bb51aad2ce3ddbb7c7e40c13df197e2a6ff18",
  registrationNetwork: "ROBINHOOD CHAIN TESTNET",
  explorerBaseUrl: "https://explorer.testnet.chain.robinhood.com/tx/",
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
