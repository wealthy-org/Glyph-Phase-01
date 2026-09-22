// ============================================================================
// GLYPH PHASE 01 — CHAIN DEFINITIONS & EXPLORER UTILITIES
// Supports both Robinhood Chain Mainnet (4663) and Robinhood Chain Testnet (46630)
// ============================================================================

import { defineChain, Chain } from "viem";

export const robinhoodMainnet = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
        "https://rpc.mainnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url:
        process.env.BLOCK_EXPLORER_URL ||
        process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
        "https://robinhoodchain.blockscout.com",
    },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
        "https://rpc.testnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url:
        process.env.BLOCK_EXPLORER_URL ||
        process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
        "https://explorer.testnet.chain.robinhood.com",
    },
  },
});

/**
 * Returns the currently active chain based on NEXT_PUBLIC_CHAIN_ID.
 * Defaults to robinhoodTestnet (46630) unless NEXT_PUBLIC_CHAIN_ID is explicitly set to 4663.
 */
export function getActiveChain(): Chain {
  const chainIdStr = process.env.NEXT_PUBLIC_CHAIN_ID;
  const chainId = chainIdStr ? parseInt(chainIdStr, 10) : 46630;
  return chainId === 4663 ? robinhoodMainnet : robinhoodTestnet;
}

/**
 * Generates an explorer transaction URL for the active network.
 */
export function getExplorerTxUrl(txHash: string): string {
  const chain = getActiveChain();
  const baseUrl =
    process.env.BLOCK_EXPLORER_URL ||
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
    chain.blockExplorers?.default.url ||
    "https://robinhoodchain.blockscout.com";
  return `${baseUrl.replace(/\/$/, "")}/tx/${txHash}`;
}

/**
 * Generates an explorer address URL for the active network.
 */
export function getExplorerAddressUrl(address: string): string {
  const chain = getActiveChain();
  const baseUrl =
    process.env.BLOCK_EXPLORER_URL ||
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ||
    chain.blockExplorers?.default.url ||
    "https://robinhoodchain.blockscout.com";
  return `${baseUrl.replace(/\/$/, "")}/address/${address}`;
}
