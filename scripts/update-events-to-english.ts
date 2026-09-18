import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Updating existing economic events to English...");

  const events = await prisma.economicEvent.findMany({
    orderBy: { timestamp: "asc" },
  });

  for (const ev of events) {
    let title = ev.title;
    let description = ev.description;
    let result = ev.result;

    switch (ev.eventType) {
      case "AGENT_BORN":
        title = "Glyph Born";
        description =
          "Glyph agent born as an autonomous economic entity on Robinhood Chain Testnet with independent decision loops.";
        result = "GENESIS";
        break;

      case "IDENTITY_REGISTERED":
        title = "ERC-8004 Identity Registered";
        description =
          "Cryptographic identifier anchored onchain to autonomous agent registry with Agent ID #3.";
        result = "ERC-8004";
        break;

      case "WALLET_CREATED":
        title = "Smart Account Wallet Created";
        description =
          "Autonomous Safe smart account deployed on Robinhood Chain Testnet: 0x58f446633eFc1c2141B9a974F72992b5B07F8F8d.";
        result = "SAFE-EVM";
        break;

      case "TREASURY_FUNDED":
        title = "Treasury Funded";
        description =
          "Initial seed capital allocated to autonomous economic pool. Balance initialized at $1,000.00 USD-SIM.";
        result = "+$1,000.00";
        break;
    }

    await prisma.economicEvent.update({
      where: { id: ev.id },
      data: { title, description, result },
    });

    console.log(`✅ Updated ${ev.eventType}: "${title}"`);
  }

  console.log("All events successfully updated to English in database!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
