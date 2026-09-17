import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedAgent(prisma: PrismaClient) {
  console.log("  ↳ [1/5] Seeding Agent & Safe Wallet...");

  // 1. Agent Root Identity (ERC-8004)
  const agent = await prisma.agent.upsert({
    where: { agentId: "1" },
    update: {
      name: "GLYPH",
      status: "ACTIVE",
    },
    create: {
      agentId: "1",
      name: "GLYPH",
      status: "ACTIVE",
    },
  });

  // 2. Safe Smart Account on Robinhood Chain Testnet
  const wallet = await prisma.agentWallet.upsert({
    where: { agentId: agent.id },
    update: {
      walletAddress: "0xd1dB02Ee39f33f5EC0780A7f75572c0c04345Ed7",
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
    create: {
      agentId: agent.id,
      walletAddress: "0xd1dB02Ee39f33f5EC0780A7f75572c0c04345Ed7",
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
  });

  console.log(`    ✅ Agent (id: ${agent.id}, agentId: #${agent.agentId})`);
  console.log(`    ✅ Safe Wallet: ${wallet.walletAddress}`);

  return { agent, wallet };
}
