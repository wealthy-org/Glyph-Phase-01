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

export function getResolvedAgentId(isMainnet: boolean): string {
  const envAgentId = process.env.NEXT_PUBLIC_GLYPH_AGENT_ID || process.env.GLYPH_AGENT_ID;
  if (isMainnet) {
    return envAgentId && envAgentId !== "5" ? envAgentId : "485";
  }
  return envAgentId && envAgentId !== "485" ? envAgentId : "5";
}

export function getIdentityDataForNetwork(overrideChainId?: number): IdentityData {
  const activeChainId =
    overrideChainId ||
    (process.env.NEXT_PUBLIC_CHAIN_ID
      ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)
      : 46630);
  const isMainnet = activeChainId === 4663;
  const rawAgentId = getResolvedAgentId(isMainnet);
  const activeExplorerUrl =
    isMainnet
      ? "https://robinhoodchain.blockscout.com"
      : "https://explorer.testnet.chain.robinhood.com";

  return {
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
      name: isMainnet ? "ROBINHOOD MAINNET" : "ROBINHOOD TESTNET",
      chainId: activeChainId,
    },
    genesis: {
      epoch: "September 2026",
      block: isMainnet ? "Block 69,599,556" : "Block 121,888,511",
    },
    primaryWallet:
      process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
      "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C",
    owner: isMainnet
      ? "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C"
      : "0xB635eFd761D352ed8a74166a292c8969AD541c8E",
    agentWallet:
      process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
      "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C",
    agentURI: "/agents/glyph.json",
    registryAddress: isMainnet
      ? (process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS || "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432")
      : "0x66399E25D3FBb5De462d06dE835D07B2957060D2",
    onchainVerified: true,
    registrationTx: isMainnet
      ? (process.env.NEXT_PUBLIC_REGISTRATION_TX || "0x7bdb016a6ae01709d2fe5548593644ace465fae607e9cf51fe4a22a07556e794")
      : "0x651f3838a424c489bbb1f5792f8c20c2346d8cf542a604ce4853a07381b138da",
    registrationNetwork: isMainnet
      ? "ROBINHOOD MAINNET"
      : "ROBINHOOD CHAIN TESTNET",
    explorerBaseUrl: `${activeExplorerUrl.replace(/\/$/, "")}/tx/`,
    architectureItems: GLYPH_ARCHITECTURE_ITEMS,
  };
}

export const GLYPH_IDENTITY_DATA: IdentityData = getIdentityDataForNetwork();
