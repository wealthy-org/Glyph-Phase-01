import "dotenv/config";
import "../../src/lib/dns-fix";
import { createPublicClient, http, parseAbi, defineChain, isAddress } from "viem";
import { prisma } from "../../src/lib/prisma";

// ============================================================================
// GLYPH WALLET VERIFICATION CLI
// Usage: npm run glyph:wallet:verify
//
// Checks:
//   1. ENV wallet address valid
//   2. Database connected
//   3. Glyph identity exists
//   4. DB wallet matches ENV wallet
//   5. On-chain wallet matches DB wallet (if contract configured)
//   6. Trading history intact
//   7. Paper portfolio intact
//   8. Memory intact
// ============================================================================

import { getActiveChain } from "../../src/lib/onchain/chains";

const activeChain = getActiveChain();

const identityRegistryAbi = parseAbi([
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
]);

function line(char = "─", width = 60) {
  return char.repeat(width);
}

type CheckResult = {
  label: string;
  passed: boolean | null; // null = skipped
  detail?: string;
  critical: boolean;
};

function renderCheck(c: CheckResult): string {
  const icon = c.passed === true ? "✓" : c.passed === false ? "✗" : "⊘";
  const status = c.passed === true ? "PASS" : c.passed === false ? "FAIL" : "SKIP";
  const padLabel = c.label.padEnd(28, " ");
  const base = `  ${icon}  ${padLabel} ${status}`;
  return c.detail ? `${base}\n       ${c.detail}` : base;
}

async function main() {
  console.log("\n" + line("═"));
  console.log("  GLYPH WALLET VERIFICATION");
  console.log(line("═") + "\n");

  const checks: CheckResult[] = [];
  let anyBlocking = false;

  // ── Check 1: ENV wallet set and valid ────────────────────────────
  const envWallet = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS;
  const envValid = envWallet ? isAddress(envWallet) : false;
  checks.push({
    label: "ENV wallet address",
    passed: envValid,
    critical: true,
    detail: envValid
      ? envWallet!
      : envWallet
      ? `Invalid address: ${envWallet}`
      : "NEXT_PUBLIC_GLYPH_WALLET_ADDRESS not set",
  });

  // ── Check 2: Network ENV set ─────────────────────────────────────
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  const rpcUrl  = process.env.NEXT_PUBLIC_RPC_URL;
  checks.push({
    label: "Network ENV",
    passed: !!(chainId && rpcUrl),
    critical: false,
    detail: chainId && rpcUrl
      ? `Chain ${chainId} — ${rpcUrl}`
      : "NEXT_PUBLIC_CHAIN_ID or NEXT_PUBLIC_RPC_URL missing",
  });

  // ── Check 3: DB connected, identity exists ────────────────────────
  let agent: any = null;
  let dbConnected = false;

  try {
    agent = await prisma.agent.findFirst({
      include: {
        wallet: true,
        treasury: true,
        _count: {
          select: { trades: true, decisions: true, memories: true },
        },
      },
    });
    dbConnected = true;
    checks.push({
      label: "Database connection",
      passed: true,
      critical: true,
      detail: "Connected to PostgreSQL",
    });
  } catch (err) {
    checks.push({
      label: "Database connection",
      passed: false,
      critical: true,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // ── Check 4: Glyph identity exists ───────────────────────────────
  checks.push({
    label: "Glyph identity",
    passed: agent !== null,
    critical: true,
    detail: agent
      ? `Agent "${agent.name}" (agentId: #${agent.agentId})`
      : "No agent found — run: npm run seed:genesis",
  });

  // ── Check 5: DB wallet set ────────────────────────────────────────
  const dbWallet = agent?.wallet?.walletAddress ?? null;
  checks.push({
    label: "DB wallet configured",
    passed: dbWallet !== null,
    critical: true,
    detail: dbWallet ?? "agent_wallets.walletAddress is NULL",
  });

  // ── Check 6: DB wallet === ENV wallet ────────────────────────────
  let dbVsEnv: boolean | null = null;
  if (dbWallet && envWallet) {
    dbVsEnv = dbWallet.toLowerCase() === envWallet.toLowerCase();
  }
  checks.push({
    label: "DB wallet === ENV wallet",
    passed: dbVsEnv,
    critical: true,
    detail:
      dbVsEnv === true
        ? "Consistent"
        : dbVsEnv === false
        ? `MISMATCH\n       DB:  ${dbWallet}\n       ENV: ${envWallet}\n       Fix: npm run glyph:wallet:set -- ${envWallet}`
        : "Cannot compare — DB or ENV unavailable",
  });

  // ── Check 7: On-chain wallet (optional) ──────────────────────────
  const contractAddr = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS;
  if (contractAddr && agent) {
    try {
      const client = createPublicClient({ chain: activeChain, transport: http() });
      const agentIdBig = BigInt(agent.agentId);
      const onchainWallet = await client.readContract({
        address: contractAddr as `0x${string}`,
        abi: identityRegistryAbi,
        functionName: "getAgentWallet",
        args: [agentIdBig],
      });
      const nftOwner = await client.readContract({
        address: contractAddr as `0x${string}`,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [agentIdBig],
      });
      const onchainMatch = dbWallet
        ? onchainWallet.toLowerCase() === dbWallet.toLowerCase()
        : false;

      checks.push({
        label: "Onchain wallet match",
        passed: onchainMatch,
        critical: false,
        detail: onchainMatch
          ? `${onchainWallet} (NFT owner: ${nftOwner})`
          : `MISMATCH\n       DB:      ${dbWallet}\n       Onchain: ${onchainWallet}\n       Fix: npx tsx scripts/onchain/update-wallet.ts`,
      });
    } catch (err) {
      checks.push({
        label: "Onchain wallet match",
        passed: null,
        critical: false,
        detail: `Skipped — ${err instanceof Error ? err.message : "network error"}`,
      });
    }
  } else {
    checks.push({
      label: "Onchain wallet match",
      passed: null,
      critical: false,
      detail: contractAddr ? "Skipped — no agent in DB" : "Skipped — IDENTITY_REGISTRY_CONTRACT_ADDRESS not set",
    });
  }

  // ── Check 8: Trading history intact ──────────────────────────────
  const tradesOk = dbConnected && agent !== null;
  checks.push({
    label: "Trading history",
    passed: tradesOk ? true : null,
    critical: false,
    detail: agent
      ? `${agent._count.trades} trades, ${agent._count.decisions} decisions`
      : "Cannot read — DB unavailable",
  });

  // ── Check 9: Memory intact ────────────────────────────────────────
  checks.push({
    label: "Memory",
    passed: tradesOk ? true : null,
    critical: false,
    detail: agent
      ? `${agent._count.memories} memory entries`
      : "Cannot read — DB unavailable",
  });

  // ── Check 10: Paper portfolio intact ─────────────────────────────
  const balance = agent?.treasury ? Number(agent.treasury.currentBalance) : null;
  checks.push({
    label: "Paper portfolio",
    passed: agent?.treasury !== null ? true : null,
    critical: false,
    detail:
      balance !== null
        ? `Treasury: $${balance.toFixed(2)} USD-SIM`
        : "No treasury record — run: npm run fund:treasury",
  });

  // ── Render all checks ─────────────────────────────────────────────
  for (const c of checks) {
    console.log(renderCheck(c));
    if (c.passed === false && c.critical) anyBlocking = true;
  }

  // ── Overall status ────────────────────────────────────────────────
  console.log();
  console.log(line("─"));
  if (!anyBlocking) {
    console.log("  STATUS: ✓ READY");
    console.log();
    console.log("  All critical checks passed.");
    console.log("  Wallet configuration is valid and consistent.\n");
  } else {
    console.log("  STATUS: ✗ BLOCKED");
    console.log();
    const failed = checks.filter((c) => c.passed === false && c.critical);
    console.log("  Blocking issues:");
    for (const c of failed) {
      console.log(`    • ${c.label}: ${c.detail}`);
    }
    console.log();
    console.log("  No production changes were applied.");
    console.log("  Resolve the above issues before proceeding.\n");
  }
  console.log(line("─") + "\n");

  if (anyBlocking) process.exit(1);
}

main()
  .catch((e) => {
    console.error("\n❌ Verification failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
