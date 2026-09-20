import { PrismaClient, EconomicEventType } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { seedAgent } from "../../prisma/seeds/agent.seed";
import { seedTreasury } from "../../prisma/seeds/treasury.seed";
import { seedPolicy } from "../../prisma/seeds/policy.seed";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("==================================================");
  console.log("🌱 RESETTING & SEEDING GENESIS ONLY (06:30:00 UTC)");
  console.log("==================================================");

  // 1. Ensure Agent & Safe Wallet exist
  const { agent } = await seedAgent(prisma);

  // 2. Wipe all existing runtime data
  console.log("🧹 Cleaning runtime data (positions, memories, trades, decisions, events)...");
  await prisma.position.deleteMany({});
  await prisma.memory.deleteMany({});
  await prisma.trade.deleteMany({});
  await prisma.decision.deleteMany({});
  await prisma.agentRun.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.economicEvent.deleteMany({ where: { agentId: agent.id } });

  // 3. Reset Simulated Treasury to $0.00 USD-SIM (Unfunded)
  await seedTreasury(prisma, agent.id);

  // 4. Ensure Deterministic Risk Policy Engine is active
  await seedPolicy(prisma, agent.id);

  // 5. Seed Genesis Economic Events ONLY up to 06:30:00 UTC
  console.log("  ↳ Seeding Genesis Economic Events (06:00:00 - 06:30:00 UTC)...");
  const genesisEvents = [
    {
      agentId: agent.id,
      eventType: EconomicEventType.AGENT_BORN,
      title: "Glyph Born",
      description:
        "Autonomous economic being initialized on Robinhood Chain Testnet with independent decision loops.",
      day: 1,
      result: "GENESIS",
      txHash: null,
      timestamp: new Date("2026-09-14T06:00:00Z"),
    },
    {
      agentId: agent.id,
      eventType: EconomicEventType.IDENTITY_REGISTERED,
      title: "ERC-8004 Identity Registered",
      description:
        "ERC-8004 cryptographic agent identity registered onchain.",
      day: 1,
      result: "ERC-8004",
      txHash: process.env.GLYPH_IDENTITY_TX_HASH || null,
      timestamp: new Date("2026-09-14T06:15:00Z"),
    },
    {
      agentId: agent.id,
      eventType: EconomicEventType.WALLET_CREATED,
      title: "Smart Account Wallet Created",
      description:
        "Safe smart account deployed for autonomous execution.",
      day: 1,
      result: "SAFE-EVM",
      txHash: process.env.GLYPH_WALLET_TX_HASH || null,
      timestamp: new Date("2026-09-14T06:30:00Z"),
    },
  ];

  for (const event of genesisEvents) {
    await prisma.economicEvent.create({ data: event });
  }
  console.log(`    ✅ Created ${genesisEvents.length} genesis economic events.`);

  // 6. Reset Reputation Metrics to Day 1
  console.log("  ↳ Initializing Day 1 Reputation Metrics (Zero Trades/Decisions)...");
  await prisma.reputationMetrics.upsert({
    where: { agentId: agent.id },
    update: {
      decisionsCount: 0,
      tradesCount: 0,
      winRate: 0,
      realizedPnl: 0,
      averageReturn: 0,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 1,
    },
    create: {
      agentId: agent.id,
      decisionsCount: 0,
      tradesCount: 0,
      winRate: 0,
      realizedPnl: 0,
      averageReturn: 0,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 1,
    },
  });

  console.log("==================================================");
  console.log("🎉 GENESIS STATE INITIALIZED SUCCESSFULLY!");
  console.log("   - Agent ID #1 (GLYPH) ready.");
  console.log("   - Treasury: $0.00 USD-SIM (Unfunded, waiting for capital).");
  console.log("   - Life Log Events:");
  console.log("     1. 06:00:00 UTC -> Glyph Born (GENESIS)");
  console.log("     2. 06:15:00 UTC -> ERC-8004 Identity Registered (ERC-8004)");
  console.log("     3. 06:30:00 UTC -> Smart Account Wallet Created (SAFE-EVM)");
  console.log("   - Trades: 0, Decisions: 0.");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Genesis seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
