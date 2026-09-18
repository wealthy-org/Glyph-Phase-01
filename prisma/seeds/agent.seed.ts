import { PrismaClient } from "../../src/generated/prisma/client";
import "dotenv/config";

export async function seedAgent(prisma: PrismaClient) {
  console.log("  ↳ [1/5] Seeding Agent & Safe Wallet...");

  const walletAddress =
    process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
    "0x0000000000000000000000000000000000000000";

  const agentId = process.env.GLYPH_AGENT_ID || "1";

  // 1. Agent Root Identity (ERC-8004)
  const agent = await prisma.agent.upsert({
    where: { agentId },
    update: {
      name: "GLYPH",
      status: "ACTIVE",
    },
    create: {
      agentId,
      name: "GLYPH",
      status: "ACTIVE",
    },
  });

  // 2. Safe Smart Account on Robinhood Chain Testnet
  const wallet = await prisma.agentWallet.upsert({
    where: { agentId: agent.id },
    update: {
      walletAddress,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
    create: {
      agentId: agent.id,
      walletAddress,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
  });

  console.log(`    ✅ Agent (id: ${agent.id}, agentId: #${agent.agentId})`);
  console.log(`    ✅ Safe Wallet: ${wallet.walletAddress}`);

  return { agent, wallet };
}
