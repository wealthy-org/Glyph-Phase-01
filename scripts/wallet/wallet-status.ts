import "dotenv/config";
import "../../src/lib/dns-fix";
import { createPublicClient, http, parseAbi, defineChain, isAddress } from "viem";
import { prisma } from "../../src/lib/prisma";

// ============================================================================
// GLYPH WALLET STATUS CLI
// Usage: npm run glyph:wallet:status
// ============================================================================

import { getActiveChain } from "../../src/lib/onchain/chains";

const activeChain = getActiveChain();

const identityRegistryAbi = parseAbi([
  "function getAgentWallet(uint256 agentId) external view returns (address)",
]);

function line(char = "─", width = 60) {
  return char.repeat(width);
}

async function main() {
  console.log("\n" + line("═"));
  console.log("  GLYPH WALLET STATUS");
  console.log(line("═") + "\n");

  // ── 1. ENV Configuration ────────────────────────────────────────
  const envWallet = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS;
  const chainId   = process.env.NEXT_PUBLIC_CHAIN_ID || "46630";
  const rpcUrl    = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.chain.robinhood.com";
  const contractAddr = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS;

  const networkName = Number(chainId) === 46630
    ? "Robinhood Chain Testnet"
    : Number(chainId) === 1
    ? "Ethereum Mainnet"
    : `Chain ${chainId}`;

  console.log("  NETWORK");
  console.log(`  ${networkName} (Chain ID: ${chainId})`);
  console.log();

  // ── 2. ENV wallet validation ─────────────────────────────────────
  const envValid = envWallet ? isAddress(envWallet) : false;
  console.log("  ENV  WALLET_ADDRESS");
  if (envWallet) {
    console.log(`  ${envWallet}`);
    console.log(`  ENV Valid: ${envValid ? "✓ Valid checksum" : "✗ Invalid or not set"}`);
  } else {
    console.log("  ✗ NEXT_PUBLIC_GLYPH_WALLET_ADDRESS not set");
  }
  console.log();

  // ── 3. Database check ────────────────────────────────────────────
  let dbConnected = false;
  let dbWallet: string | null = null;
  let agentId: string | null = null;
  let agentName: string | null = null;
  let tradesCount = 0;
  let decisionsCount = 0;
  let memoriesCount = 0;
  let treasuryBalance: number | null = null;
  let lastRotation: Date | null = null;

  try {
    const agent = await prisma.agent.findFirst({
      include: {
        wallet: true,
        treasury: true,
        _count: {
          select: { trades: true, decisions: true, memories: true },
        },
      },
    });

    if (agent) {
      dbConnected   = true;
      dbWallet      = agent.wallet?.walletAddress ?? null;
      agentId       = agent.agentId;
      agentName     = agent.name;
      tradesCount   = agent._count.trades;
      decisionsCount = agent._count.decisions;
      memoriesCount  = agent._count.memories;
      treasuryBalance = agent.treasury ? Number(agent.treasury.currentBalance) : null;

      // Check for last wallet rotation event
      const rotationEvent = await prisma.economicEvent.findFirst({
        where: { agentId: agent.id, eventType: "WALLET_ROTATED" as any },
        orderBy: { timestamp: "desc" },
      });
      lastRotation = rotationEvent?.timestamp ?? null;
    }

    console.log("  DATABASE");
    console.log(`  Connected: ✓`);
    if (agent) {
      console.log(`  Agent:     ${agentName} (ID #${agentId})`);
      console.log(`  DB Wallet: ${dbWallet ?? "NOT SET"}`);
    } else {
      console.log("  ✗ No agent found in database");
    }
  } catch (err) {
    console.log("  DATABASE");
    console.log(`  Connected: ✗  (${err instanceof Error ? err.message : String(err)})`);
  }
  console.log();

  // ── 4. Configuration consistency check ──────────────────────────
  const dbVsEnv = dbWallet && envWallet
    ? dbWallet.toLowerCase() === envWallet.toLowerCase()
    : null;

  console.log("  CONFIGURATION CONSISTENCY");
  if (dbVsEnv === true) {
    console.log("  DB Wallet === ENV Wallet:  ✓ MATCH");
  } else if (dbVsEnv === false) {
    console.log("  DB Wallet vs ENV Wallet:   ✗ MISMATCH");
    console.log(`    DB:  ${dbWallet}`);
    console.log(`    ENV: ${envWallet}`);
    console.log("  → Run: npm run glyph:wallet:verify  for details");
  } else {
    console.log("  ✗ Cannot compare — DB or ENV not available");
  }
  console.log();

  // ── 5. Optional on-chain check ────────────────────────────────────
  if (contractAddr && agentId) {
    try {
      const client = createPublicClient({ chain: activeChain, transport: http() });
      const onchainWallet = await client.readContract({
        address: contractAddr as `0x${string}`,
        abi: identityRegistryAbi,
        functionName: "getAgentWallet",
        args: [BigInt(agentId)],
      });
      const onchainMatch = dbWallet
        ? onchainWallet.toLowerCase() === dbWallet.toLowerCase()
        : false;
      console.log("  ONCHAIN (IdentityRegistry)");
      console.log(`  Onchain Wallet: ${onchainWallet}`);
      console.log(`  DB === Onchain: ${onchainMatch ? "✓ MATCH" : "✗ MISMATCH"}`);
      console.log();
    } catch {
      console.log("  ONCHAIN");
      console.log("  ⚠  Could not read IdentityRegistry (network or config issue)");
      console.log();
    }
  }

  // ── 6. Portfolio summary ──────────────────────────────────────────
  if (dbConnected) {
    console.log("  PORTFOLIO CONTINUITY");
    console.log(`  Trades:    ${tradesCount}`);
    console.log(`  Decisions: ${decisionsCount}`);
    console.log(`  Memories:  ${memoriesCount}`);
    if (treasuryBalance !== null) {
      console.log(`  Treasury:  $${treasuryBalance.toFixed(2)} USD-SIM`);
    }
    console.log();
  }

  // ── 7. Last rotation ─────────────────────────────────────────────
  if (lastRotation) {
    console.log("  LAST WALLET ROTATION");
    console.log(`  ${lastRotation.toISOString()}`);
    console.log();
  }

  // ── 8. Overall status ────────────────────────────────────────────
  const ready = dbConnected && envValid && dbVsEnv !== false;
  console.log(line("─"));
  console.log(`  STATUS: ${ready ? "✓ READY" : "⚠  ATTENTION REQUIRED"}`);
  console.log(line("─") + "\n");

  if (!ready) {
    if (!envValid) console.log("  → NEXT_PUBLIC_GLYPH_WALLET_ADDRESS is missing or invalid.");
    if (!dbConnected) console.log("  → Database connection failed.");
    if (dbVsEnv === false) console.log("  → DB wallet does not match ENV wallet. Run: npm run glyph:wallet:set");
    console.log();
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Status check failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
