import { PrismaClient } from "../../src/generated/prisma/client";

export async function seedTreasury(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ [2/5] Seeding Agent Treasury ($1,000 USD-SIM)...");

  const treasury = await prisma.agentTreasury.upsert({
    where: { agentId },
    update: {
      initialCapital: 1000,
      currentBalance: 1000,
      currency: "USD-SIM",
    },
    create: {
      agentId,
      initialCapital: 1000,
      currentBalance: 1000,
      currency: "USD-SIM",
    },
  });

  console.log(
    `    ✅ Treasury initialized: $${Number(treasury.currentBalance).toFixed(2)} ${treasury.currency} (Initial: $${Number(treasury.initialCapital).toFixed(2)})`
  );

  return treasury;
}
