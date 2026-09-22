import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const agent = await prisma.agent.findFirst({
    include: {
      treasury: true,
      policy: true,
      wallet: true,
    },
  });
  
  if (!agent) {
    console.log("NO AGENT FOUND IN DATABASE");
    return;
  }

  console.log("=== CURRENT AGENT RECORD ===");
  console.log("id:", agent.id);
  console.log("agentId (ERC-8004 onchain ID):", agent.agentId);
  console.log("name:", agent.name);
  console.log("createdAt:", agent.createdAt.toISOString());
  console.log("");
  console.log("=== WALLET ===");
  if (agent.wallet) {
    console.log("walletAddress:", agent.wallet.walletAddress);
    console.log("network:", agent.wallet.network);
    console.log("chainId:", agent.wallet.chainId);
  } else {
    console.log("No wallet");
  }
  console.log("=== TREASURY ===");
  if (agent.treasury) {
    console.log("initialCapital:", agent.treasury.initialCapital?.toString());
    console.log("currentBalance:", agent.treasury.currentBalance?.toString());
  } else {
    console.log("No treasury");
  }
  console.log("");
  console.log("=== POLICY ===");
  if (agent.policy) {
    console.log("allowedAssets:", agent.policy.allowedAssets);
    console.log("maxPositionPercent:", agent.policy.maxPositionPercent?.toString());
    console.log("maxLeverage:", agent.policy.maxLeverage?.toString());
  } else {
    console.log("No policy");
  }
  console.log("");
  console.log("=== ENV COMPARISON ===");
  console.log("GLYPH_AGENT_ID (env):", process.env.GLYPH_AGENT_ID);
  console.log("DB agentId:", agent.agentId);
  console.log("MISMATCH:", agent.agentId !== process.env.GLYPH_AGENT_ID);
  
  // Count related records
  const [decisions, trades, positions, snapshots, runs] = await Promise.all([
    prisma.decision.count({ where: { agentId: agent.id } }),
    prisma.trade.count({ where: { agentId: agent.id } }),
    prisma.position.count({ where: { agentId: agent.id } }),
    prisma.researchSnapshot.count(),
    prisma.agentRun.count({ where: { agentId: agent.id } }),
  ]);
  
  console.log("");
  console.log("=== LINKED RECORDS ===");
  console.log("Decisions:", decisions);
  console.log("Trades:", trades);
  console.log("Positions:", positions);
  console.log("ResearchSnapshots:", snapshots);
  console.log("AgentRuns:", runs);
}

main().finally(() => prisma.$disconnect());
