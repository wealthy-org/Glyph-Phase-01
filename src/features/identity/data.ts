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
  agentId: "5",
  agentIdFormatted: "ID #005",
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
    block: "Block 121,888,511",
  },
  // NOTE: Read from ENV so this fallback stays in sync after wallet rotations.
  // The identity page always prefers DB wallet → ENV wallet → this fallback.
  primaryWallet:
    process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  registrationTx: "0x651f3838a424c489bbb1f5792f8c20c2346d8cf542a604ce4853a07381b138da",
  registrationNetwork: "ROBINHOOD CHAIN TESTNET",
  explorerBaseUrl: "https://explorer.testnet.chain.robinhood.com/tx/",
  architectureItems: GLYPH_ARCHITECTURE_ITEMS,
};
