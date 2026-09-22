import "dotenv/config";
import { createPublicClient, http } from "viem";
import { prisma } from "../../src/lib/prisma";

const chain = {
  id: 4663,
  name: "Robinhood Chain Mainnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
} as const;

async function runPreFlight() {
  console.log("=================================================================");
  console.log("🛫 PHASE 10 PRE-FLIGHT VERIFICATION");
  console.log("=================================================================\n");

  // 1. Network + Wallet Balances
  console.log("▶ [CHECK 1] Robinhood Chain Mainnet Connectivity & Wallet Balances...");
  const client = createPublicClient({ chain, transport: http() });
  const signerAddr = "0xB635eFd761D352ed8a74166a292c8969AD541c8E" as `0x${string}`;
  const ownerAddr = "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C" as `0x${string}`;

  const [signerBal, ownerBal, blockNum] = await Promise.all([
    client.getBalance({ address: signerAddr }),
    client.getBalance({ address: ownerAddr }),
    client.getBlockNumber(),
  ]);

  console.log(`  ↳ Network     : Robinhood Chain Mainnet`);
  console.log(`  ↳ Chain ID    : 4663`);
  console.log(`  ↳ Block#      : ${blockNum.toString()}`);
  console.log(`  ↳ Agent Owner : ${ownerAddr}`);
  console.log(`     Balance    : ${Number(ownerBal) / 1e18} ETH`);
  console.log(`  ↳ Backend Signer : ${signerAddr}`);
  console.log(`     Balance       : ${Number(signerBal) / 1e18} ETH`);

  if (signerBal === 0n) {
    console.error("\n  ❌ PREFLIGHT FAILED: Backend Signer has 0 ETH — cannot broadcast commitDecision() transaction.");
    process.exit(1);
  }
  console.log(`  ✅ Backend Signer has ${Number(signerBal) / 1e18} ETH — sufficient for transaction gas.\n`);

  // 2. Config Verification
  console.log("▶ [CHECK 2] Environment Configuration...");
  const requiredEnv = [
    "DATABASE_URL",
    "CRON_SECRET",
    "SMART_ACCOUNT_OWNER_PRIVATE_KEY",
    "DECISION_REGISTRY_CONTRACT_ADDRESS",
    "GLYPH_AGENT_ID",
    "NEXT_PUBLIC_CHAIN_ID",
    "OPENROUTER_API_KEY",
    "MARKET_DATA_API_KEY",
  ];

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`  ❌ Missing: ${key}`);
      process.exit(1);
    }
    const masked = process.env[key]!.length > 8
      ? process.env[key]!.slice(0, 6) + "..." + process.env[key]!.slice(-4)
      : "****";
    console.log(`  ↳ ${key}: ${masked}`);
  }

  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);
  if (chainId !== 4663) {
    console.error(`  ❌ Chain ID mismatch! Expected 4663, got ${chainId}`);
    process.exit(1);
  }

  const registryAddr = process.env.DECISION_REGISTRY_CONTRACT_ADDRESS;
  if (registryAddr !== "0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df") {
    console.error(`  ❌ DecisionRegistry mismatch! Expected 0x4ce11...280Df, got ${registryAddr}`);
    process.exit(1);
  }

  const agentId = process.env.GLYPH_AGENT_ID;
  if (agentId !== "485") {
    console.error(`  ❌ Agent ID mismatch! Expected 485, got ${agentId}`);
    process.exit(1);
  }

  console.log(`  ✅ Chain ID: 4663 (Robinhood Chain Mainnet)`);
  console.log(`  ✅ DecisionRegistry: 0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df`);
  console.log(`  ✅ Agent ID: 485\n`);

  // 3. Database Baseline
  console.log("▶ [CHECK 3] Database Baseline...");
  const [agents, decisions, trades, positions, snapshots, runs] = await Promise.all([
    prisma.agent.count(),
    prisma.decision.count(),
    prisma.trade.count(),
    prisma.position.count(),
    prisma.researchSnapshot.count(),
    prisma.agentRun.count(),
  ]);

  const nvdaCount = await prisma.researchSnapshot.count({ where: { asset: "NVDA" } });
  const aaplCount = await prisma.researchSnapshot.count({ where: { asset: "AAPL" } });

  console.log(`  ↳ Agents            : ${agents} (expected: 1)`);
  console.log(`  ↳ Decisions         : ${decisions} (expected: 0)`);
  console.log(`  ↳ Trades            : ${trades} (expected: 0)`);
  console.log(`  ↳ Positions         : ${positions} (expected: 0)`);
  console.log(`  ↳ ResearchSnapshots : ${snapshots} (expected: 6)`);
  console.log(`     ↳ NVDA           : ${nvdaCount}`);
  console.log(`     ↳ AAPL           : ${aaplCount}`);
  console.log(`  ↳ AgentRuns         : ${runs} (expected: 3)`);

  if (agents !== 1 || decisions !== 0 || trades !== 0) {
    console.error("\n  ❌ PREFLIGHT FAILED: Database baseline mismatch from Phase 9.");
    process.exit(1);
  }
  console.log("  ✅ Database baseline matches Phase 9 expectation.\n");

  // 4. Market Status
  console.log("▶ [CHECK 4] Live Market Status Gate...");
  const { AlphaVantageProvider } = await import("../../src/lib/market/alpha-vantage");
  const marketStatus = await new AlphaVantageProvider().getMarketStatus("United States");
  console.log(`  ↳ Status           : ${marketStatus.status.toUpperCase()}`);
  console.log(`  ↳ Is Open          : ${marketStatus.isOpen}`);
  console.log(`  ↳ Exchanges        : ${marketStatus.primaryExchanges}`);
  console.log(`  ↳ Regular Hours    : ${marketStatus.localOpen} - ${marketStatus.localClose}`);
  console.log(`  ↳ Source           : ${marketStatus.source}`);
  console.log(`  ↳ Checked At       : ${marketStatus.checkedAt}`);

  if (!marketStatus.isOpen) {
    console.error("\n  ❌ PREFLIGHT FAILED: US Equity Market is currently CLOSED. Cannot proceed.");
    console.error("     Phase 10 cycle must be executed when the market is OPEN.");
    process.exit(1);
  }
  console.log("  ✅ US Equity Market is OPEN. Safe to proceed.\n");

  console.log("=================================================================");
  console.log("✅ ALL PRE-FLIGHT CHECKS PASSED — READY FOR PHASE 10 CYCLE");
  console.log("=================================================================\n");
  console.log(`  Baseline recorded:`);
  console.log(`    Agents: ${agents}`);
  console.log(`    Decisions: ${decisions}`);
  console.log(`    Trades: ${trades}`);
  console.log(`    Positions: ${positions}`);
  console.log(`    ResearchSnapshots: ${snapshots} (NVDA: ${nvdaCount}, AAPL: ${aaplCount})`);
  console.log(`    AgentRuns: ${runs}`);
  console.log(`    SignerBalance: ${Number(signerBal) / 1e18} ETH`);
  console.log();

  return {
    agents, decisions, trades, positions, snapshots, runs,
    nvdaCount, aaplCount,
    signerBalEth: Number(signerBal) / 1e18,
  };
}

runPreFlight()
  .finally(() => prisma.$disconnect());
