// ============================================================================
// GLYPH PHASE 01 — RUN TRADE SEED SCRIPT
// Run with: npx tsx scripts/seed-trades.ts
// ============================================================================

import { seedTrades } from "../../prisma/seeds/trade.seed";
import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("===============================================================");
  console.log("🌱 EXECUTING GLYPH TRADE SEEDING (ONCHAIN & DECISION TELEMETRY)");
  console.log("===============================================================\n");

  const agent = await prisma.agent.findFirst();
  if (!agent) {
    throw new Error("No agent found in database. Run 'npm run db:seed' first.");
  }

  await seedTrades(prisma as any, agent.id);

  console.log("\n===============================================================");
  console.log("🎉 TRADE SEEDING SUCCESSFUL!");
  console.log("===============================================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
