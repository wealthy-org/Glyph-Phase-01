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

const activeChainId = process.env.NEXT_PUBLIC_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)
  : 46630;
const isMainnet = activeChainId === 4663;
const rawAgentId = process.env.NEXT_PUBLIC_GLYPH_AGENT_ID || "5";
const activeExplorerUrl =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
  (isMainnet
    ? "https://robinhoodchain.blockscout.com"
    : "https://explorer.testnet.chain.robinhood.com");

export const GLYPH_IDENTITY_DATA: IdentityData = {
  beingNumber: "ECONOMIC BEING #001",
  agentId: rawAgentId,
  agentIdFormatted: `ID #${rawAgentId.padStart(3, "0")}`,
  name: "GLYPH",
  status: "ACTIVE",
  standard: {
    standard: "ERC-8004",
    subtext: "Trustless Agents Specification",
  },
  network: {
    name: isMainnet ? "Robinhood Chain" : "Robinhood Chain Testnet",
    chainId: activeChainId,
  },
  genesis: {
    epoch: isMainnet ? "September 2026" : "September 2026",
    block: isMainnet ? "Mainnet Anchor" : "Block 121,888,511",
  },
  // NOTE: Read from ENV so this fallback stays in sync after wallet rotations.
  // The identity page always prefers DB wallet → ENV wallet → this fallback.
  primaryWallet:
    process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  registrationTx:
    process.env.NEXT_PUBLIC_REGISTRATION_TX ||
    "0x651f3838a424c489bbb1f5792f8c20c2346d8cf542a604ce4853a07381b138da",
  registrationNetwork: isMainnet
    ? "ROBINHOOD CHAIN"
    : "ROBINHOOD CHAIN TESTNET",
  explorerBaseUrl: `${activeExplorerUrl.replace(/\/$/, "")}/tx/`,
  architectureItems: GLYPH_ARCHITECTURE_ITEMS,
};
