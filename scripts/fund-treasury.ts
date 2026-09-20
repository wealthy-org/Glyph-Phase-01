import "dotenv/config";
import { fundTreasury } from "../src/lib/treasury";
import { prisma } from "../src/lib/prisma";

// ============================================================================
// GLYPH PHASE 01 — CLI TREASURY FUNDING SCRIPT
// Usage:
//   npx tsx scripts/fund-treasury.ts --amount 500
//   npx tsx scripts/fund-treasury.ts --amount 1000 --note "Creator backer grant"
//   npx tsx scripts/fund-treasury.ts --amount 250 --tx 0x123abc...
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let amount = 500; // Default amount if unspecified
  let note: string | undefined = undefined;
  let txHash: string | undefined = undefined;
  let agentId: string | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--amount" || arg === "-a") {
      amount = parseFloat(args[i + 1]);
      i++;
    } else if (arg === "--note" || arg === "-n" || arg === "--description" || arg === "-d") {
      note = args[i + 1];
      i++;
    } else if (arg === "--tx" || arg === "--txHash") {
      txHash = args[i + 1];
      i++;
    } else if (arg === "--agent" || arg === "--agentId") {
      agentId = args[i + 1];
      i++;
    } else if (!isNaN(parseFloat(arg)) && i === 0) {
      // Positional argument: e.g. "npx tsx scripts/fund-treasury.ts 750"
      amount = parseFloat(arg);
    }
  }

  return { amount, note, txHash, agentId };
}

async function main() {
  console.log("===============================================================");
  console.log("💰 GLYPH AUTONOMOUS TREASURY — CAPITAL INJECTION UTILITY");
  console.log("===============================================================\n");

  const { amount, note, txHash, agentId } = parseArgs();

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Error: Invalid amount specified. Must be a positive number.");
    console.log("Example usage: npm run fund:treasury -- --amount 500 --note \"Grant\"");
    process.exit(1);
  }

  console.log(`⏳ Injecting $${amount.toFixed(2)} USD-SIM into Glyph treasury...`);
  if (note) console.log(`   Memo: "${note}"`);
  if (txHash) console.log(`   Tx Hash Ref: ${txHash}`);

  const result = await fundTreasury({
    amount,
    description: note,
    txHash,
    agentId,
  });

  console.log("\n✅ SUCCESS: Treasury Funded!");
  console.log("---------------------------------------------------------------");
  console.log(`  • Status          : ${result.event.title}`);
  console.log(`  • Injected Capital: ${result.event.result}`);
  console.log(`  • New Cash Balance: $${result.treasury.currentBalance.toFixed(2)} ${result.treasury.currency}`);
  console.log(`  • Net Total Equity: $${result.treasury.totalEquity.toFixed(2)} ${result.treasury.currency}`);
  console.log(`  • Initial Capital : $${result.treasury.initialCapital.toFixed(2)}`);
  console.log(`  • Life Log Day    : Day ${result.event.day || 1}`);
  console.log(`  • Life Log Event ID: ${result.event.id}`);
  if (result.event.txHash) {
    console.log(`  • Onchain Tx Hash : ${result.event.txHash}`);
  }
  console.log("---------------------------------------------------------------");
  console.log("✨ Life Log and Header metrics have been synchronously updated.\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Funding failed:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
