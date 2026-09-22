// ============================================================================
// GLYPH PHASE 01 — RESET TREASURY TO COMPLETELY UNFUNDED STATE ($0.00)
// Ensures Glyph behaves as if it has never received simulated funding.
// Research snapshots and genesis identity/wallet events are strictly preserved.
// ============================================================================

import { prisma } from "../../src/lib/prisma";

async function runTreasuryReset() {
  console.log("===============================================================");
  console.log("🔍 STEP 1: PRE-MUTATION AUDIT");
  console.log("===============================================================\n");

  // 1. Research counts (CRITICAL SAFETY)
  const snapshotsBefore = await prisma.researchSnapshot.count();
  const researchEventsBefore = await prisma.economicEvent.count({
    where: { eventType: "RESEARCH_STARTED" },
  });

  if (snapshotsBefore !== 7) {
    throw new Error(`Expected 7 ResearchSnapshots before mutation, found ${snapshotsBefore}`);
  }
  if (researchEventsBefore !== 7) {
    throw new Error(`Expected 7 research events before mutation, found ${researchEventsBefore}`);
  }

  // 2. Treasury before
  const treasuryBefore = await prisma.agentTreasury.findFirst();
  if (!treasuryBefore) {
    throw new Error("AgentTreasury record not found!");
  }
  const balanceBeforeFormatted = `$${Number(treasuryBefore.currentBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 3. Funding events before
  const fundingEventsBefore = await prisma.economicEvent.findMany({
    where: { eventType: "TREASURY_FUNDED" },
  });
  const fundingRecordsBefore = fundingEventsBefore.length;

  // 4. Genesis events before (MUST PRESERVE)
  const genesisEventsBefore = await prisma.economicEvent.findMany({
    where: {
      eventType: {
        in: [
          "AGENT_BORN",
          "IDENTITY_REGISTERED",
          "WALLET_CREATED",
          "WALLET_ROTATED",
        ],
      },
    },
  });

  // 5. Agent & Wallet before (MUST PRESERVE)
  const agentBefore = await prisma.agent.findFirst({
    include: { wallet: true },
  });
  if (!agentBefore || !agentBefore.wallet) {
    throw new Error("Agent or Wallet missing before reset!");
  }

  console.log(`ResearchSnapshots Before: ${snapshotsBefore}`);
  console.log(`Research Events Before:   ${researchEventsBefore}`);
  console.log(`Treasury Balance Before:  ${balanceBeforeFormatted}`);
  console.log(`Funding Events Before:    ${fundingRecordsBefore}`);
  console.log(`Genesis Events Before:    ${genesisEventsBefore.length}`);
  console.log(`Agent ID:                 ${agentBefore.agentId}`);
  console.log(`Wallet Address:           ${agentBefore.wallet.walletAddress}\n`);

  console.log("⏳ STEP 2: EXECUTING ATOMIC PRISMA TRANSACTION...");

  await prisma.$transaction(async (tx) => {
    // A. Remove TREASURY_FUNDED economic events
    await tx.economicEvent.deleteMany({
      where: { eventType: "TREASURY_FUNDED" },
    });

    // B. Reset AgentTreasury to completely unfunded state ($0.00 USD-SIM)
    await tx.agentTreasury.update({
      where: { id: treasuryBefore.id },
      data: {
        currentBalance: "0",
        initialCapital: "0",
        currency: "USD-SIM",
      },
    });
  });

  console.log("✅ Transaction completed successfully.\n");

  console.log("===============================================================");
  console.log("🔍 STEP 3: POST-MUTATION VERIFICATION");
  console.log("===============================================================\n");

  // Post verification
  const [
    snapshotsAfter,
    researchEventsAfter,
    treasuryAfter,
    fundingEventsAfter,
    genesisEventsAfter,
    agentAfter,
  ] = await Promise.all([
    prisma.researchSnapshot.count(),
    prisma.economicEvent.count({ where: { eventType: "RESEARCH_STARTED" } }),
    prisma.agentTreasury.findFirst(),
    prisma.economicEvent.count({ where: { eventType: "TREASURY_FUNDED" } }),
    prisma.economicEvent.findMany({
      where: {
        eventType: {
          in: [
            "AGENT_BORN",
            "IDENTITY_REGISTERED",
            "WALLET_CREATED",
            "WALLET_ROTATED",
          ],
        },
      },
    }),
    prisma.agent.findFirst({ include: { wallet: true } }),
  ]);

  // Safety checks
  if (snapshotsBefore !== snapshotsAfter) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ResearchSnapshot count changed from ${snapshotsBefore} to ${snapshotsAfter}`);
  }
  if (researchEventsBefore !== researchEventsAfter) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Research event count changed from ${researchEventsBefore} to ${researchEventsAfter}`);
  }
  if (Number(treasuryAfter?.currentBalance) !== 0 || Number(treasuryAfter?.initialCapital) !== 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Treasury balance not zero! Found ${treasuryAfter?.currentBalance}`);
  }
  if (fundingEventsAfter !== 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Funding events still present! Found ${fundingEventsAfter}`);
  }
  if (genesisEventsAfter.length !== genesisEventsBefore.length) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Genesis events count changed!`);
  }
  if (!agentAfter || !agentAfter.wallet) {
    throw new Error("CRITICAL INTEGRITY FAILURE: Agent or Wallet was modified/deleted!");
  }

  const balanceAfterFormatted = `$${Number(treasuryAfter?.currentBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  console.log("=== TREASURY RESET ===\n");
  console.log("Treasury:");
  console.log(`Before: ${balanceBeforeFormatted}`);
  console.log(`After:  ${balanceAfterFormatted}`);
  console.log();
  console.log("Funding records:");
  console.log(`Before: ${fundingRecordsBefore}`);
  console.log(`After:  ${fundingEventsAfter}`);
  console.log();
  console.log("Funding events:");
  console.log(`Before: ${fundingRecordsBefore}`);
  console.log(`After:  ${fundingEventsAfter}`);
  console.log();
  console.log("ResearchSnapshot:");
  console.log(`Before: ${snapshotsBefore}`);
  console.log(`After:  ${snapshotsAfter}`);
  console.log();
  console.log(`Research preserved: ${snapshotsBefore === snapshotsAfter && researchEventsBefore === researchEventsAfter ? "YES" : "NO"}`);
  console.log();
  console.log(`Identity preserved: ${agentAfter ? "YES" : "NO"}`);
  console.log(`Wallet preserved: ${agentAfter?.wallet ? "YES" : "NO"}`);
  console.log(`Genesis preserved: ${genesisEventsAfter.length === 4 ? "YES" : "NO"}`);
  console.log("===============================================================");
}

runTreasuryReset()
  .catch((err) => {
    console.error("❌ Reset script encountered an error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
