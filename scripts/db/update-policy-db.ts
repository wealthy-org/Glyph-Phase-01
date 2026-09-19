import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("Updating agent policies in DB to allowedAssets: ['NVDA', 'MSFT', 'AAPL']...");
  const updated = await prisma.agentPolicy.updateMany({
    data: {
      allowedAssets: ["NVDA", "MSFT", "AAPL"],
    },
  });
  console.log(`Updated ${updated.count} policy record(s).`);

  const policies = await prisma.agentPolicy.findMany({
    include: { agent: true },
  });
  for (const p of policies) {
    console.log(`Agent #${p.agent.agentId}: allowedAssets = [${p.allowedAssets.join(", ")}]`);
  }
}

main()
  .catch((err) => {
    console.error("Error updating policy in DB:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
