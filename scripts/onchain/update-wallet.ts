import "dotenv/config";
import "../../src/lib/dns-fix";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { prisma } from "../../src/lib/prisma";

const NEW_WALLET_ADDRESS = "0x5cFc46E3e541531E2194185183971dCd9Eaaa384" as `0x${string}`;

const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.chain.robinhood.com"],
    },
  },
});

const identityRegistryAbi = parseAbi([
  "function setAgentWallet(uint256 agentId, address wallet) external",
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
]);

async function main() {
  console.log("\n🔄 UPDATING GLYPH WALLET TO:", NEW_WALLET_ADDRESS);
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Update Database
  const agent = await prisma.agent.findFirst({
    include: { wallet: true },
  });

  if (!agent) {
    throw new Error("Agent not found in database!");
  }

  const updatedWallet = await prisma.agentWallet.upsert({
    where: { agentId: agent.id },
    update: {
      walletAddress: NEW_WALLET_ADDRESS,
    },
    create: {
      agentId: agent.id,
      walletAddress: NEW_WALLET_ADDRESS,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
  });

  console.log(`✅ [Database] agent_wallets updated to: ${updatedWallet.walletAddress}`);

  // 2. On-chain update via IdentityRegistry
  const contractAddress = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const privateKey = process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY as `0x${string}`;

  if (contractAddress && privateKey) {
    try {
      const account = privateKeyToAccount(privateKey);
      const publicClient = createPublicClient({
        chain: robinhoodTestnet,
        transport: http(),
      });
      const walletClient = createWalletClient({
        account,
        chain: robinhoodTestnet,
        transport: http(),
      });

      const agentIdBigInt = BigInt(agent.agentId);
      const owner = await publicClient.readContract({
        address: contractAddress,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [agentIdBigInt],
      });

      console.log(`👤 Signer Account:   ${account.address}`);
      console.log(`🏛️  NFT Owner:        ${owner}`);

      if (owner.toLowerCase() === account.address.toLowerCase()) {
        console.log(`⛓️  Calling setAgentWallet(${agentIdBigInt}, ${NEW_WALLET_ADDRESS}) on-chain...`);
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: identityRegistryAbi,
          functionName: "setAgentWallet",
          args: [agentIdBigInt, NEW_WALLET_ADDRESS],
        });
        console.log(`⏳ Waiting for tx receipt: ${txHash}...`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 30000 });
        console.log(`✅ [Blockchain] setAgentWallet confirmed in block ${receipt.blockNumber}!`);

        const verifiedWallet = await publicClient.readContract({
          address: contractAddress,
          abi: identityRegistryAbi,
          functionName: "getAgentWallet",
          args: [agentIdBigInt],
        });
        console.log(`🔍 [Blockchain] Verified getAgentWallet on-chain: ${verifiedWallet}`);
      } else {
        console.log("⚠️  Signer is not NFT owner, skipped on-chain contract update.");
      }
    } catch (err: unknown) {
      console.warn("⚠️  On-chain update error (database is already updated):", err instanceof Error ? err.message : String(err));
    }
  }

  console.log("\n═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Update script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
