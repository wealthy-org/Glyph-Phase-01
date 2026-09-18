import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { seedAgent } from "./seeds/agent.seed";
import { seedTreasury } from "./seeds/treasury.seed";
import { seedPolicy } from "./seeds/policy.seed";
import { seedEvents } from "./seeds/events.seed";
import { seedTrades } from "./seeds/trade.seed";
import { seedReputation } from "./seeds/reputation.seed";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("==================================================");
  console.log("🌱 STARTING MODULAR DATABASE SEEDING (GLYPH)...");
  console.log("==================================================");

  // 1. Agent & Wallet
  const { agent } = await seedAgent(prisma);

  // 2. Simulated Treasury ($1,000 USD-SIM)
  await seedTreasury(prisma, agent.id);

  // 3. Risk Policy Engine (Deterministic Rules)
  await seedPolicy(prisma, agent.id);

  // 4. Genesis Economic Events (Life Log)
  await seedEvents(prisma, agent.id);

  // 5. Trades, Decisions, Life Log Events & Persistent Memories
  await seedTrades(prisma, agent.id);

  // 6. Initial Reputation Metrics
  await seedReputation(prisma, agent.id);

  console.log("==================================================");
  console.log("🎉 ALL MODULAR SEEDS COMPLETED SUCCESSFULLY!");
  console.log("   - Agent ID #1 (GLYPH) is fully initialized.");
  console.log("   - Treasury: $1,000.00 USD-SIM seed capital ready.");
  console.log("   - Genesis events & deterministic policy active.");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
