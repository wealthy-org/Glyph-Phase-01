import { PrismaClient, EconomicEventType } from "../../src/generated/prisma/client";

export async function seedEvents(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ [4/5] Seeding Genesis Economic Events (Life Log)...");

  // Clear existing genesis events for this agent to avoid duplicates on re-seed
  await prisma.economicEvent.deleteMany({
    where: {
      agentId,
      eventType: {
        in: [
          EconomicEventType.AGENT_BORN,
          EconomicEventType.IDENTITY_REGISTERED,
          EconomicEventType.WALLET_CREATED,
          EconomicEventType.TREASURY_FUNDED,
        ],
      },
    },
  });

  const genesisEvents = [
    {
      agentId,
      eventType: EconomicEventType.AGENT_BORN,
      title: "Glyph Born",
      description:
        "Glyph agent born as an autonomous economic entity on Robinhood Chain Testnet with independent decision loops.",
      day: 1,
      result: "GENESIS",
      txHash: null,
      timestamp: new Date("2026-09-14T06:00:00Z"),
    },
    {
      agentId,
      eventType: EconomicEventType.IDENTITY_REGISTERED,
      title: "ERC-8004 Identity Registered",
      description:
        "Cryptographic identifier anchored onchain to autonomous agent registry with Agent ID #3.",
      day: 1,
      result: "ERC-8004",
      txHash: "0x7d3e13cd572c06b9bc0d25948f6f2e57da4967fc67bc290766b3656f5d4facb2",
      timestamp: new Date("2026-09-14T06:15:00Z"),
    },
    {
      agentId,
      eventType: EconomicEventType.WALLET_CREATED,
      title: "Smart Account Wallet Created",
      description:
        "Autonomous Safe smart account deployed on Robinhood Chain Testnet: 0x58f446633eFc1c2141B9a974F72992b5B07F8F8d.",
      day: 1,
      result: "SAFE-EVM",
      txHash: "0xd9e9afc3f5550156dd7339b339d7d6ac6a4382c9bd519c61ea73fb638dc8637e",
      timestamp: new Date("2026-09-14T06:30:00Z"),
    },
    {
      agentId,
      eventType: EconomicEventType.TREASURY_FUNDED,
      title: "Treasury Funded",
      description:
        "Initial seed capital allocated to autonomous economic pool. Balance initialized at $1,000.00 USD-SIM.",
      day: 1,
      result: "+$1,000.00",
      txHash: null,
      timestamp: new Date("2026-09-14T07:00:00Z"),
    },
  ];

  for (const event of genesisEvents) {
    await prisma.economicEvent.create({ data: event });
  }

  console.log(`    ✅ Created ${genesisEvents.length} genesis economic events (including TREASURY_FUNDED).`);
}
