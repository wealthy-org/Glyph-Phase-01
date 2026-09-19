import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("🌱 Initializing Agent Treasury in PostgreSQL database...");

  const configuredAgentId = process.env.GLYPH_AGENT_ID || "3";
  let agent = await prisma.agent.findFirst({
    where: { agentId: configuredAgentId },
    include: { treasury: true },
  });

  if (!agent) {
    agent = await prisma.agent.findFirst({
      include: { treasury: true },
    });
  }

  if (!agent) {
    throw new Error("No agent found in the database. Please run initial agent seeding first.");
  }

  console.log(`Target Agent found: ${agent.name} (ID: ${agent.id}, AgentId: ${agent.agentId})`);

  const treasury = await prisma.agentTreasury.upsert({
    where: { agentId: agent.id },
    update: {
      initialCapital: 0,
      currentBalance: 0,
      currency: "USD-SIM",
    },
    create: {
      agentId: agent.id,
      initialCapital: 0,
      currentBalance: 0,
      currency: "USD-SIM",
    },
  });

  console.log("✅ Successfully seeded Agent Treasury in database:");
  console.log({
    id: treasury.id,
    agentId: treasury.agentId,
    initialCapital: Number(treasury.initialCapital),
    currentBalance: Number(treasury.currentBalance),
    currency: treasury.currency,
    createdAt: treasury.createdAt,
    updatedAt: treasury.updatedAt,
  });
}

main()
  .catch((err) => {
    console.error("❌ Failed to seed treasury:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
