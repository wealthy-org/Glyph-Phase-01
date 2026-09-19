import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("Updating Agent ID to '3' in database...");

  const agent = await prisma.agent.findFirst();
  if (!agent) {
    throw new Error("No agent found in database!");
  }

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: { agentId: "3" },
  });

  console.log(`✅ Agent successfully updated to ID '${updated.agentId}'! (UUID: ${updated.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
