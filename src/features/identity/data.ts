import { IdentityData, ArchitectureItem } from "./types";

export const GLYPH_ARCHITECTURE_ITEMS: ArchitectureItem[] = [
  {
    index: "01",
    domain: "IDENTITY",
    name: "ERC-8004",
    description: "Agent registration and machine-verifiable identity standard.",
  },
  {
    index: "02",
    domain: "WALLET",
    name: "SMART ACCOUNT",
    description: "Safe smart contract wallet holding autonomous execution authority.",
  },
  {
    index: "03",
    domain: "POLICY",
    name: "RISK POLICY",
    description: "Deterministic boundaries governing exposure and risk constraints.",
  },
  {
    index: "04",
    domain: "RECORD",
    name: "ONCHAIN REGISTRY",
    description: "Public attestations and verifiable state anchors on testnet.",
  },
];

export const GLYPH_IDENTITY_DATA: IdentityData = {
  beingNumber: "ECONOMIC BEING #001",
  agentId: "3",
  agentIdFormatted: "ID #003",
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
  architectureItems: GLYPH_ARCHITECTURE_ITEMS,
};
