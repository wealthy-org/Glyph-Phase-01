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
      title: "Agent born into autonomous environment",
      description:
        "Glyph initialized as a persistent digital economic entity with independent memory and decision loops.",
      day: 1,
      result: "GENESIS",
      txHash: null,
    },
    {
      agentId,
      eventType: EconomicEventType.IDENTITY_REGISTERED,
      title: "Identity registered onchain",
      description:
        "Cryptographic identifier anchored to autonomous agent registry on Robinhood Chain Testnet.",
      day: 4,
      result: "ERC-8004",
      txHash: "0xa547e955ec33ca107054a74d1c6bb51aad2ce3ddbb7c7e40c13df197e2a6ff18",
    },
    {
      agentId,
      eventType: EconomicEventType.WALLET_CREATED,
      title: "Safe smart account deployed",
      description:
        "Autonomous multi-signature Safe vault deployed to hold gas capital and execute on-chain commitments.",
      day: 4,
      result: "SAFE-EVM",
      txHash: "0xa547e955ec33ca107054a74d1c6bb51aad2ce3ddbb7c7e40c13df197e2a6ff18",
    },
    {
      agentId,
      eventType: EconomicEventType.TREASURY_FUNDED,
      title: "Capital entered treasury",
      description:
        "Initial seed capital allocated to autonomous economic pool. Balance initialized at $1,000.00 USD-SIM.",
      day: 7,
      result: "+$1,000.00",
      txHash: null,
    },
  ];

  for (const event of genesisEvents) {
    await prisma.economicEvent.create({ data: event });
  }

  console.log(`    ✅ Created ${genesisEvents.length} genesis economic events (including TREASURY_FUNDED).`);
}
