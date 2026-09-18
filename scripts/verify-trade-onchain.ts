import { createPublicClient, http, decodeEventLog } from "viem";
import { robinhoodTestnet, DECISION_REGISTRY_ABI } from "../src/lib/onchain/registry";
import { prisma } from "../src/lib/prisma";

async function verifyTradeOnchain() {
  console.log("===============================================================");
  console.log("🔍 AUDITING GLYPH-0001 TRADE RECORD VS ONCHAIN BLOCKCHAIN DATA");
  console.log("===============================================================\n");

  // 1. Fetch trade from Database
  const trade = await prisma.trade.findFirst({
    where: { tradeNumber: "GLYPH-0001" },
    include: { decision: true, position: true },
  });

  if (!trade) {
    console.error("❌ Trade GLYPH-0001 not found in DB!");
    return;
  }

  console.log("📋 [DATABASE RECORD] for GLYPH-0001:");
  console.log(`  - Trade ID:         ${trade.id}`);
  console.log(`  - Asset:            ${trade.asset}`);
  console.log(`  - Action:           ${trade.action}`);
  console.log(`  - Entry Price:      $${trade.entryPrice}`);
  console.log(`  - Position Margin:  $${trade.positionSize}`);
  console.log(`  - Leverage:         ${trade.leverage}x`);
  console.log(`  - Status:           ${trade.status}`);
  console.log(`  - Decision Hash:    ${trade.decisionHash}`);
  console.log(`  - Transaction Hash: ${trade.transactionHash}\n`);

  if (!trade.transactionHash) {
    console.error("❌ No transactionHash attached to GLYPH-0001!");
    return;
  }

  // 2. Query Blockchain RPC
  console.log("⛓️  [ONCHAIN QUERY] Contacting Robinhood Chain Testnet RPC...");
  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http("https://rpc.testnet.chain.robinhood.com"),
  });

  const tx = await publicClient.getTransaction({
    hash: trade.transactionHash as `0x${string}`,
  });

  console.log("\n📦 [TRANSACTION RECEIPT & STATUS]");
  console.log(`  - From:             ${tx.from}`);
  console.log(`  - To (Contract):    ${tx.to}`);
  console.log(`  - Block Number:     ${tx.blockNumber}`);
  console.log(`  - Nonce:            ${tx.nonce}`);
  console.log(`  - Gas Price:        ${tx.gasPrice?.toString()} wei`);

  const receipt = await publicClient.getTransactionReceipt({
    hash: trade.transactionHash as `0x${string}`,
  });

  console.log(`  - Receipt Status:   ${receipt.status === "success" ? "✅ SUCCESS" : "❌ FAILED"}`);
  console.log(`  - Block Hash:       ${receipt.blockHash}`);
  console.log(`  - Gas Used:         ${receipt.gasUsed.toString()}`);
  console.log(`  - Logs Emitted:     ${receipt.logs.length}`);

  // 3. Decode Event Logs
  console.log("\n📜 [DECODED EVENT LOG]");
  let matched = false;

  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: DECISION_REGISTRY_ABI,
        data: log.data,
        topics: log.topics,
      });

      console.log(`  - Event Name:       ${decoded.eventName}`);
      const args = decoded.args as any;
      console.log(`  - Onchain ID:       ${args.decisionId.toString()}`);
      console.log(`  - Onchain Hash:     ${args.decisionHash}`);
      console.log(`  - Committed By:     ${args.committedBy}`);
      console.log(`  - Timestamp:        ${new Date(Number(args.timestamp) * 1000).toISOString()}`);

      // Compare Hashes
      if (args.decisionHash.toLowerCase() === trade.decisionHash?.toLowerCase()) {
        matched = true;
      }
    } catch {
      // not our event
    }
  }

  console.log("\n===============================================================");
  if (matched) {
    console.log("🎉 VERIFIKASI BERHASIL: 100% MATCH!");
    console.log("  - Hash keputusan di database identik dengan yang tercatat di blockchain.");
    console.log("  - Kontrak: DecisionRegistry.sol di Robinhood Chain Testnet.");
  } else {
    console.log("⚠️  Peringatan: Hash tidak cocok atau log event tidak ditemukan.");
  }
  console.log(`  - Block Explorer URL: https://explorer.testnet.chain.robinhood.com/tx/${trade.transactionHash}`);
  console.log("===============================================================\n");
}

verifyTradeOnchain()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
