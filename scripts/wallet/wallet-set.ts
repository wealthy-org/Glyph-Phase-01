import "dotenv/config";
import "../../src/lib/dns-fix";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { isAddress, getAddress } from "viem";
import { prisma } from "../../src/lib/prisma";

// ============================================================================
// GLYPH WALLET ROTATION CLI
// Usage: npm run glyph:wallet:set -- 0xNEW_WALLET_ADDRESS
//
// SAFETY RULES:
//   ✓ Does NOT reset database
//   ✓ Does NOT reset paper portfolio
//   ✓ Does NOT delete trades, decisions, memories, life log, PnL
//   ✓ Does NOT recreate Glyph identity
//   ✓ Does NOT automatically move assets
//   ✓ Does NOT automatically change on-chain Safe ownership
//   ✓ Does NOT broadcast any mainnet transaction
//   ✗ Never prints or stores private keys
// ============================================================================

const ENV_FILE = path.resolve(process.cwd(), ".env");

function line(char = "─", width = 60) {
  return char.repeat(width);
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Updates a single KEY=VALUE line in the .env file.
 * If the key does not exist, appends it.
 * Never touches unrelated lines.
 */
function updateEnvFile(key: string, value: string): void {
  if (!fs.existsSync(ENV_FILE)) {
    throw new Error(`.env file not found at: ${ENV_FILE}`);
  }

  const original = fs.readFileSync(ENV_FILE, "utf8");
  const lines = original.split(/\r?\n/);
  let found = false;

  const updated = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`) || trimmed.startsWith(`${key} =`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    updated.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_FILE, updated.join("\n"), "utf8");
}

async function main() {
  const newWalletRaw = process.argv[2];

  console.log("\n" + line("═"));
  console.log("  GLYPH WALLET ROTATION");
  console.log(line("═") + "\n");

  // ── 1. Argument check ────────────────────────────────────────────
  if (!newWalletRaw) {
    console.error("  ✗ Usage: npm run glyph:wallet:set -- 0xNEW_WALLET_ADDRESS\n");
    process.exit(1);
  }

  // ── 2. Address format validation ─────────────────────────────────
  if (!isAddress(newWalletRaw)) {
    console.error(`  ✗ Invalid Ethereum address: "${newWalletRaw}"`);
    console.error("    Address must be 42 characters, start with 0x, and be a valid hex.\n");
    process.exit(1);
  }

  // EIP-55 checksum normalization
  let newWallet: string;
  try {
    newWallet = getAddress(newWalletRaw);
  } catch {
    console.error(`  ✗ Address failed EIP-55 checksum: "${newWalletRaw}"\n`);
    process.exit(1);
  }

  // ── 3. Load current state from DB ───────────────────────────────
  const agent = await prisma.agent.findFirst({
    include: {
      wallet: true,
      treasury: true,
      _count: {
        select: { trades: true, decisions: true, memories: true },
      },
    },
  });

  if (!agent) {
    console.error("  ✗ No Glyph agent found in database. Run seed:genesis first.\n");
    process.exit(1);
  }

  const currentWallet = agent.wallet?.walletAddress ?? null;
  const envWallet     = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ?? null;

  // ── 4. Early exit if already active ──────────────────────────────
  if (currentWallet && currentWallet.toLowerCase() === newWallet.toLowerCase()) {
    console.log(`  ℹ  This wallet is already the active wallet:\n     ${currentWallet}\n`);
    console.log("  No changes were made.\n");
    await prisma.$disconnect();
    return;
  }

  // ── 5. Network detection ─────────────────────────────────────────
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 46630);
  const networkName = chainId === 1
    ? "MAINNET  ⚠  PRODUCTION"
    : chainId === 46630
    ? "TESTNET  (Robinhood Chain)"
    : `Chain ${chainId}`;

  // ── 6. Show rotation summary ─────────────────────────────────────
  console.log("  CURRENT WALLET");
  console.log(`  ${currentWallet ?? "NOT SET"}`);
  console.log();
  console.log("  NEW WALLET");
  console.log(`  ${newWallet}`);
  console.log();
  console.log("  NETWORK");
  console.log(`  ${networkName}`);
  console.log();

  if (envWallet && envWallet.toLowerCase() !== newWallet.toLowerCase()) {
    console.log("  ⚠  ENV Wallet Mismatch");
    console.log(`     NEXT_PUBLIC_GLYPH_WALLET_ADDRESS = ${envWallet}`);
    console.log("     .env will be updated automatically upon confirmation.");
    console.log();
  }

  // ── 7. Impact summary ────────────────────────────────────────────
  console.log("  The following will NOT change:");
  console.log("  ✓ Glyph identity (agentId, name, ERC-8004)");
  console.log(`  ✓ Trading history   (${agent._count.trades} trades)`);
  console.log(`  ✓ Decisions         (${agent._count.decisions} decisions)`);
  console.log(`  ✓ Memories          (${agent._count.memories} entries)`);
  console.log(`  ✓ PnL / Portfolio   (Treasury: $${Number(agent.treasury?.currentBalance ?? 0).toFixed(2)} USD-SIM)`);
  console.log("  ✓ Life Log history");
  console.log("  ✓ Reputation metrics");
  console.log();
  console.log("  The following WILL change:");
  console.log("  → agent_wallets.walletAddress  (DB)");
  console.log("  → NEXT_PUBLIC_GLYPH_WALLET_ADDRESS  (.env file)");
  console.log("  → A WALLET_ROTATED event will be added to Life Log");
  console.log();
  console.log("  The following requires a SEPARATE manual step:");
  console.log("  → On-chain IdentityRegistry.setAgentWallet()");
  console.log("    (run: npx tsx scripts/onchain/update-wallet.ts after updating .env)");
  console.log();

  // ── 8. Explicit confirmation ──────────────────────────────────────
  console.log(line("─"));
  const answer = await prompt("  Continue? [y/N]: ");
  console.log(line("─") + "\n");

  if (answer.toLowerCase() !== "y") {
    console.log("  ✗ Rotation cancelled. No changes were made.\n");
    await prisma.$disconnect();
    return;
  }

  // ── 9. Apply DB change ───────────────────────────────────────────
  console.log("  Applying wallet rotation...\n");

  const updatedWallet = await prisma.agentWallet.upsert({
    where: { agentId: agent.id },
    update: { walletAddress: newWallet },
    create: {
      agentId: agent.id,
      walletAddress: newWallet,
      network: agent.wallet?.network ?? "Robinhood Chain Testnet",
      chainId: agent.wallet?.chainId ?? 46630,
    },
  });

  console.log(`  ✓ DB updated: agent_wallets.walletAddress = ${updatedWallet.walletAddress}`);

  // ── 10. Record WALLET_ROTATED life log event ──────────────────────
  const event = await prisma.economicEvent.create({
    data: {
      agentId: agent.id,
      eventType: "WALLET_ROTATED" as any,
      title: "Wallet Rotated",
      description: `Operational wallet rotated from ${currentWallet ?? "UNSET"} to ${newWallet}. Glyph identity, trading history, PnL, memories, and portfolio remain unchanged.`,
      result: `${currentWallet ? currentWallet.slice(0, 10) + "..." : "UNSET"} → ${newWallet.slice(0, 10) + "..."}`,
      timestamp: new Date(),
    },
  });

  console.log(`  ✓ Life Log event created (WALLET_ROTATED, id: ${event.id.slice(0, 8)}...)`);

  // ── 11. Update .env file ──────────────────────────────────────────
  try {
    updateEnvFile("NEXT_PUBLIC_GLYPH_WALLET_ADDRESS", newWallet);
    console.log(`  ✓ .env updated: NEXT_PUBLIC_GLYPH_WALLET_ADDRESS=${newWallet}`);
  } catch (err) {
    console.warn(`  ⚠  Could not update .env: ${err instanceof Error ? err.message : err}`);
    console.warn(`     Manually set: NEXT_PUBLIC_GLYPH_WALLET_ADDRESS=${newWallet}`);
  }

  // ── 12. Verify DB ─────────────────────────────────────────────────
  const verify = await prisma.agentWallet.findUnique({ where: { agentId: agent.id } });
  const verified = verify?.walletAddress?.toLowerCase() === newWallet.toLowerCase();
  console.log(`  ✓ DB verification: ${verified ? "CONFIRMED" : "⚠  MISMATCH — check manually"}`);

  // ── 13. Migration summary ─────────────────────────────────────────
  console.log();
  console.log(line("═"));
  console.log("  ROTATION COMPLETE");
  console.log(line("═"));
  console.log(`  Previous: ${currentWallet ?? "UNSET"}`);
  console.log(`  Current:  ${newWallet}`);
  console.log(`  Network:  ${networkName}`);
  console.log();
  console.log("  Unchanged:");
  console.log(`    Trades:    ${agent._count.trades}`);
  console.log(`    Decisions: ${agent._count.decisions}`);
  console.log(`    Memories:  ${agent._count.memories}`);
  console.log(`    Treasury:  $${Number(agent.treasury?.currentBalance ?? 0).toFixed(2)} USD-SIM`);
  console.log();
  console.log("  Next steps:");
  console.log("    1. npm run glyph:wallet:verify");
  console.log("    2. Sync on-chain: npx tsx scripts/onchain/update-wallet.ts");
  if (chainId === 1) {
    console.log("    3. ⚠  MAINNET: Update Vercel ENV via dashboard before redeploying.");
  } else {
    console.log("    3. If deployed: update NEXT_PUBLIC_GLYPH_WALLET_ADDRESS in Vercel.");
  }
  console.log(line("─") + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Wallet rotation failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
