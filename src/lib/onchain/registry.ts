// ============================================================================
// GLYPH PHASE 01 — ONCHAIN DECISION REGISTRY CLIENT
// Derived from: BRIEF.md (§12, §18, §3.5)
// Commits keccak256 decision hashes to DecisionRegistry.sol on Robinhood Chain Testnet.
// ============================================================================

import "@/lib/dns-fix";
import { prisma } from "@/lib/prisma";
import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { calculateDecisionHash, CanonicalDecisionPayload } from "./hash";
import {
  robinhoodMainnet,
  robinhoodTestnet,
  getActiveChain,
  getExplorerTxUrl,
  getExplorerAddressUrl,
} from "./chains";

export {
  robinhoodMainnet,
  robinhoodTestnet,
  getActiveChain,
  getExplorerTxUrl,
  getExplorerAddressUrl,
};

export function getDecisionRegistryContractAddress(chainId?: number): `0x${string}` {
  const activeChain = chainId
    ? (chainId === 4663 ? robinhoodMainnet : robinhoodTestnet)
    : getActiveChain();
  const isMainnet = activeChain.id === 4663;
  if (isMainnet) {
    return (
      (process.env.DECISION_REGISTRY_CONTRACT_ADDRESS as `0x${string}`) ||
      "0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df"
    );
  }
  return (
    (process.env.TESTNET_DECISION_REGISTRY_CONTRACT_ADDRESS as `0x${string}`) ||
    (process.env.NEXT_PUBLIC_CHAIN_ID === "46630"
      ? (process.env.DECISION_REGISTRY_CONTRACT_ADDRESS as `0x${string}`)
      : undefined) ||
    "0x7Ae7f962DC15e65De46a5b4d43744C7ed750B525"
  );
}

export const DECISION_REGISTRY_ABI = [
  {
    name: "commitDecision",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "decisionHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "DecisionCommitted",
    type: "event",
    inputs: [
      { name: "decisionId", type: "uint256", indexed: true },
      { name: "decisionHash", type: "bytes32", indexed: false },
      { name: "committedBy", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export interface CommitOnchainResult {
  decisionId: string;
  decisionHash: string;
  transactionHash: string;
  contractAddress: string;
  chainId: number;
  blockNumber: number;
  explorerUrl: string;
}


/**
 * Commits a decision's canonical hash to the onchain DecisionRegistry contract (§12, §3.5).
 * Updates decisions, trades, and transactions tables in the database.
 */
export async function commitDecisionOnchain(
  decisionId: string
): Promise<CommitOnchainResult> {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: {
      agent: true,
      trade: true,
    },
  });

  if (!decision) {
    throw new Error(`Decision with ID ${decisionId} not found.`);
  }

  // 1. Generate Canonical Payload and keccak256 Hash
  const canonicalPayload: CanonicalDecisionPayload = {
    decisionId: decision.id,
    agentId: decision.agent.agentId,
    asset: decision.asset,
    action: decision.action,
    conviction: decision.conviction,
    fundamentalScore: decision.fundamentalScore,
    technicalScore: decision.technicalScore,
    riskScore: decision.riskScore,
    positionSizePercent: decision.positionSizePercent
      ? Number(decision.positionSizePercent)
      : null,
    leverage: decision.leverage ? Number(decision.leverage) : null,
    thesis: decision.thesis as any,
    policyResult: decision.policyResult,
    promptVersion: decision.promptVersion,
    createdAt: decision.createdAt.toISOString(),
  };

  const { decisionHash } = calculateDecisionHash(canonicalPayload);

  const activeChain = getActiveChain();
  const contractAddress = getDecisionRegistryContractAddress(activeChain.id);

  const privateKey = process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY as Hex;

  let transactionHash: string = "";
  let blockNumber: number = 0;

  // 2. Submit Transaction to Active Network (Mainnet or Testnet)
  if (privateKey && privateKey.startsWith("0x")) {
    if (!contractAddress) {
      throw new Error(
        `[OnchainRegistry] DECISION_REGISTRY_CONTRACT_ADDRESS is not set for chain ${activeChain.id} (${activeChain.name}). Please deploy and configure the contract address.`
      );
    }
    try {
      const account = privateKeyToAccount(privateKey);
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(),
      });
      const walletClient = createWalletClient({
        account,
        chain: activeChain,
        transport: http(),
      });

      // Send commitDecision(bytes32) transaction
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: DECISION_REGISTRY_ABI,
        functionName: "commitDecision",
        args: [decisionHash],
      });

      transactionHash = tx;

      // Wait for block confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
        timeout: 30000,
      });

      blockNumber = Number(receipt.blockNumber);
    } catch (error: any) {
      console.error(
        `[OnchainRegistry] Live broadcast failed on ${activeChain.name}: ${error?.message || error}`
      );
      throw error;
    }
  } else {
    transactionHash = "";
    blockNumber = 0;
  }

  const explorerUrl = transactionHash ? getExplorerTxUrl(transactionHash) : undefined;

  // 3. Store Results in Database (BRIEF §12 & §18)
  await prisma.$transaction(async (tx) => {
    // Update Decision record
    await tx.decision.update({
      where: { id: decision.id },
      data: {
        decisionHash,
        transactionHash: transactionHash || null,
      },
    });

    // Update Trade record if linked
    if (decision.tradeId) {
      await tx.trade.update({
        where: { id: decision.tradeId },
        data: {
          decisionHash,
          transactionHash: transactionHash || null,
        },
      });
    }

    // Record in Transactions table (§18) only if real tx was broadcast
    if (transactionHash) {
      await tx.transaction.upsert({
        where: { transactionHash },
        update: {
          decisionHash,
          contractAddress,
          blockNumber: blockNumber || null,
        },
        create: {
          transactionHash,
          decisionHash,
          contractAddress,
          blockNumber: blockNumber || null,
          eventType: "DECISION_COMMITTED",
        },
      });
    }
  });

  return {
    decisionId: decision.id,
    decisionHash,
    transactionHash,
    contractAddress,
    chainId: activeChain.id,
    blockNumber,
    explorerUrl: explorerUrl || "",
  };
}
