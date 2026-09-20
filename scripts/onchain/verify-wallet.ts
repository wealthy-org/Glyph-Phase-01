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

const abi = parseAbi([
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
]);

async function main() {
  const contractAddress = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const client = createPublicClient({ chain: robinhoodTestnet, transport: http() });

  const agent = await prisma.agent.findFirst({ include: { wallet: true } });
  const agentIdBigInt = BigInt(agent?.agentId || "3");

  // Read smart contract directly from blockchain node
  const onchainWallet = await client.readContract({
    address: contractAddress,
    abi,
    functionName: "getAgentWallet",
    args: [agentIdBigInt],
  });

  const nftOwner = await client.readContract({
    address: contractAddress,
    abi,
    functionName: "ownerOf",
    args: [agentIdBigInt],
  });

  console.log("=== HASIL AUDIT VERIFIKASI ON-CHAIN ===");
  console.log("Contract Address:   ", contractAddress);
  console.log("Agent ID:           #", agentIdBigInt.toString());
  console.log("NFT Identity Owner: ", nftOwner);
  console.log("DB Wallet Address:  ", agent?.wallet?.walletAddress);
  const expectedWallet = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS || agent?.wallet?.walletAddress || "";
  const isMatch = onchainWallet.toLowerCase() === expectedWallet.toLowerCase();
  console.log("Expected Wallet:    ", expectedWallet);
  console.log("Apakah Cocok:       ", isMatch ? "TERBUKTI 100% VALID ✅" : "TIDAK COCOK ❌");
  const walletEvent = await prisma.economicEvent.findFirst({
    where: { agentId: agent?.id, eventType: "WALLET_CREATED" },
    orderBy: { timestamp: "desc" },
  });
  if (walletEvent?.txHash) {
    console.log("Tx Binding Wallet:   ", walletEvent.txHash);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
