import "dotenv/config";
import "../../src/lib/dns-fix";
import { createPublicClient, http, parseAbi, defineChain } from "viem";
import { prisma } from "../../src/lib/prisma";

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
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
]);

async function verify() {
  console.log("\n🔍 VERIFYING GLYPH BIRTH & ONCHAIN IDENTITY SETUP");
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Database Check
  const agent = await prisma.agent.findFirst({
    include: {
      wallet: true,
      treasury: true,
      policy: true,
      reputationMetrics: true,
      economicEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!agent) throw new Error("Agent not found in database!");

  console.log("📊 DATABASE STATE:");
  console.log(`  Agent ID:       #${agent.agentId} (${agent.name})`);
  console.log(`  Status:         ${agent.status}`);
  console.log(`  Wallet:         ${agent.wallet?.walletAddress}`);
  console.log(`  Treasury:       $${Number(agent.treasury?.currentBalance).toFixed(2)} ${agent.treasury?.currency}`);
  console.log(`  Max Leverage:   ${agent.policy?.maxLeverage}x`);
  console.log(`  Allowed Assets: ${agent.policy?.allowedAssets.join(", ")}`);
  console.log(`  Life Log Events:`);
  for (const ev of agent.economicEvents) {
    console.log(`    - [${ev.eventType}] ${ev.title} (tx: ${ev.txHash ? ev.txHash.slice(0, 14) + "..." : "none"})`);
  }

  // 2. Blockchain Check
  const contractAddress = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http(),
  });

  console.log("\n⛓️  BLOCKCHAIN STATE (Robinhood Chain Testnet):");
  const agentIdBigInt = BigInt(agent.agentId);
  const owner = await publicClient.readContract({
    address: contractAddress,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: [agentIdBigInt],
  });
  const onchainWallet = await publicClient.readContract({
    address: contractAddress,
    abi: identityRegistryAbi,
    functionName: "getAgentWallet",
    args: [agentIdBigInt],
  });
  const uri = await publicClient.readContract({
    address: contractAddress,
    abi: identityRegistryAbi,
    functionName: "tokenURI",
    args: [agentIdBigInt],
  });

  console.log(`  IdentityRegistry Contract: ${contractAddress}`);
  console.log(`  NFT Owner:                 ${owner}`);
  console.log(`  Linked Agent Wallet:       ${onchainWallet}`);
  console.log(`  Token URI:                 ${uri}`);

  const isWalletMatch = onchainWallet.toLowerCase() === agent.wallet?.walletAddress.toLowerCase();
  console.log(`\n  Consistency Check:`);
  console.log(`  DB Wallet === Onchain Wallet: ${isWalletMatch ? "✅ MATCH" : "❌ MISMATCH"}`);
  console.log(`  DB AgentId === Env AgentId:   ${agent.agentId === process.env.GLYPH_AGENT_ID ? "✅ MATCH" : "❌ MISMATCH"}`);

  console.log("\n═══════════════════════════════════════════════════════\n");
}

verify()
  .catch((err) => {
    console.error("Verification error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
