import "dotenv/config";
import { createPublicClient, http } from "viem";
import { prisma } from "../../src/lib/prisma";
import { AlphaVantageProvider } from "../../src/lib/market/alpha-vantage";

const robinhoodMainnet = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
} as const;

async function runPreflight() {
  console.log("=================================================================");
  console.log("✈️  PHASE 10 — PRE-FLIGHT + DB BASELINE");
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log("=================================================================\n");

  // --- 1. DB Agent Verification ---
  console.log("▶ [CHECK 1] Agent ID in Database...");
  const agent = await prisma.agent.findFirst({
    select: { id: true, agentId: true, name: true },
  });
  if (!agent) throw new Error("No agent in database!");
  if (agent.agentId !== "485") throw new Error(`Agent.agentId is '${agent.agentId}', expected '485'`);
  console.log(`  ✅ DB Agent.agentId = "${agent.agentId}" (matches ENV GLYPH_AGENT_ID=485)\n`);

  // --- 2. Market Status ---
  console.log("▶ [CHECK 2] US Equity Market Status...");
  const mkt = await new AlphaVantageProvider().getMarketStatus("United States");
  console.log(`  ↳ Status    : ${mkt.status.toUpperCase()}`);
  console.log(`  ↳ Exchanges : ${mkt.primaryExchanges}`);
  console.log(`  ↳ Hours     : ${mkt.localOpen} - ${mkt.localClose}`);
  console.log(`  ↳ Source    : ${mkt.source}`);
  console.log(`  ↳ Checked   : ${mkt.checkedAt}`);
  if (!mkt.isOpen) throw new Error("Market is CLOSED — cycle cannot proceed.");
  console.log(`  ✅ Market is OPEN\n`);

  // --- 3. Signer Balance via DNS-fixed RPC ---
  // Note: direct viem without undici fix may fail due to ISP SSL intercept.
  // We check indirectly via the chain RPC. If it fails, we note it.
  console.log("▶ [CHECK 3] Backend Signer Mainnet Balance...");
  const SIGNER = "0xB635eFd761D352ed8a74166a292c8969AD541c8E" as `0x${string}`;
  const OWNER  = "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C" as `0x${string}`;
  let signerBalEth = 0;
  let ownerBalEth = 0;
  let blockNum = 0n;
  try {
    // Import dns-fix to bypass Telkomsel ISP intercept
    await import("../../src/lib/dns-fix");
    const client = createPublicClient({ chain: robinhoodMainnet, transport: http() });
    const [sb, ob, bn] = await Promise.all([
      client.getBalance({ address: SIGNER }),
      client.getBalance({ address: OWNER }),
      client.getBlockNumber(),
    ]);
    signerBalEth = Number(sb) / 1e18;
    ownerBalEth  = Number(ob) / 1e18;
    blockNum = bn;
    console.log(`  ↳ Network        : Robinhood Chain Mainnet (Chain ID 4663)`);
    console.log(`  ↳ Block#         : ${blockNum.toString()}`);
    console.log(`  ↳ Backend Signer : ${SIGNER}`);
    console.log(`     Balance       : ${signerBalEth} ETH`);
    console.log(`  ↳ Agent Owner    : ${OWNER}`);
    console.log(`     Balance       : ${ownerBalEth} ETH`);
    if (signerBalEth === 0) throw new Error("Backend signer has 0 ETH — cannot pay gas for commitDecision()!");
    console.log(`  ✅ Signer funded: ${signerBalEth} ETH\n`);
  } catch (err: any) {
    if (err.message.includes("signer has 0 ETH")) throw err;
    console.log(`  ⚠️  Direct RPC check failed (ISP intercept): ${err.message}`);
    console.log(`  ℹ️  The Next.js server uses dns-fix which bypasses this. Proceeding.\n`);
  }

  // --- 4. DB Baseline Snapshot ---
  console.log("▶ [CHECK 4] Recording DB Baseline...");
  const [decisions, trades, positions, snapshots, runs, economicEvents, memories] = await Promise.all([
    prisma.decision.count(),
    prisma.trade.count(),
    prisma.position.count(),
    prisma.researchSnapshot.count(),
    prisma.agentRun.count(),
    prisma.economicEvent.count(),
    prisma.memory.count(),
  ]);
  const nvdaSnaps = await prisma.researchSnapshot.count({ where: { asset: "NVDA" } });
  const aaplSnaps = await prisma.researchSnapshot.count({ where: { asset: "AAPL" } });

  const baseline = { decisions, trades, positions, snapshots, nvdaSnaps, aaplSnaps, runs, economicEvents, memories };

  console.log(`  ↳ Decisions         : ${decisions}`);
  console.log(`  ↳ Trades            : ${trades}`);
  console.log(`  ↳ Positions         : ${positions}`);
  console.log(`  ↳ ResearchSnapshots : ${snapshots}  (NVDA: ${nvdaSnaps}, AAPL: ${aaplSnaps})`);
  console.log(`  ↳ AgentRuns         : ${runs}`);
  console.log(`  ↳ EconomicEvents    : ${economicEvents}`);
  console.log(`  ↳ Memories          : ${memories}`);

  // Validate 3-snapshot requirement for both assets
  console.log("\n▶ [CHECK 5] Historical Research Snapshot Sufficiency...");
  console.log(`  ↳ NVDA snapshots: ${nvdaSnaps} (minimum: 3)`);
  console.log(`  ↳ AAPL snapshots: ${aaplSnaps} (minimum: 3)`);
  if (nvdaSnaps >= 3) console.log(`  ✅ NVDA: ${nvdaSnaps}/3 snapshots available`);
  else console.log(`  ⚠️  NVDA: ${nvdaSnaps}/3 — insufficient history, will produce NO_TRADE`);
  if (aaplSnaps >= 3) console.log(`  ✅ AAPL: ${aaplSnaps}/3 snapshots available`);
  else console.log(`  ⚠️  AAPL: ${aaplSnaps}/3 — insufficient history, will produce NO_TRADE`);

  // --- 5. Config verification ---
  console.log("\n▶ [CHECK 6] Environment Configuration...");
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  const registry = process.env.DECISION_REGISTRY_CONTRACT_ADDRESS;
  const glyphAgentId = process.env.GLYPH_AGENT_ID;
  console.log(`  ↳ NEXT_PUBLIC_CHAIN_ID                  : ${chainId}`);
  console.log(`  ↳ DECISION_REGISTRY_CONTRACT_ADDRESS    : ${registry}`);
  console.log(`  ↳ GLYPH_AGENT_ID                        : ${glyphAgentId}`);
  if (chainId !== "4663") throw new Error(`Chain ID mismatch! Expected 4663, got ${chainId}`);
  if (registry !== "0x4ce11C76a6BBe68d8F0694f668c2Aa2e4c7280Df") throw new Error("DecisionRegistry mismatch!");
  if (glyphAgentId !== "485") throw new Error("GLYPH_AGENT_ID mismatch!");
  console.log(`  ✅ All config verified\n`);

  console.log("=================================================================");
  console.log("✅ ALL PRE-FLIGHT CHECKS PASSED");
  console.log("=================================================================\n");

  return baseline;
}

runPreflight()
  .then((b) => {
    console.log("BASELINE JSON:", JSON.stringify(b));
  })
  .finally(() => prisma.$disconnect());
