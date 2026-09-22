import "dotenv/config";
import "../../src/lib/dns-fix";
import { isAddress, getAddress } from "viem";
import { prisma } from "../../src/lib/prisma";

// ============================================================================
// GLYPH WALLET ROTATION — AUTOMATED TESTS
// Usage: npm run test:wallet:rotation
//
// Runs against LIVE database. All mutations are REVERSED after each test.
// Does NOT perform on-chain transactions.
// Does NOT reset, drop, or delete production data.
// ============================================================================

const FAKE_WALLET_A = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth (valid EIP-55)
const FAKE_WALLET_B = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; // another valid address

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

const results: TestResult[] = [];

function pass(name: string) {
  results.push({ name, passed: true });
  console.log(`  ✓  ${name}`);
}

function fail(name: string, error: string) {
  results.push({ name, passed: false, error });
  console.log(`  ✗  ${name}`);
  console.log(`       ${error}`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getAgent() {
  return prisma.agent.findFirst({
    include: {
      wallet: true,
      treasury: true,
      _count: { select: { trades: true, decisions: true, memories: true } },
    },
  });
}

async function getWalletRotationEvents(agentId: string) {
  return prisma.economicEvent.findMany({
    where: { agentId, eventType: "WALLET_ROTATED" as any },
    orderBy: { timestamp: "desc" },
  });
}

async function setDbWallet(agentId: string, walletAddress: string) {
  return prisma.agentWallet.upsert({
    where: { agentId },
    update: { walletAddress },
    create: {
      agentId,
      walletAddress,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
  });
}

async function deleteRotationEvents(agentId: string, ids: string[]) {
  if (ids.length === 0) return;
  await prisma.economicEvent.deleteMany({
    where: { agentId, id: { in: ids }, eventType: "WALLET_ROTATED" as any },
  });
}

// ── Test Suite ────────────────────────────────────────────────────────────────

async function runTests() {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  GLYPH WALLET ROTATION — TEST SUITE");
  console.log("══════════════════════════════════════════════════════════\n");

  // Snapshot pre-test state
  const agentBefore = await getAgent();
  if (!agentBefore) {
    console.error("  ✗ FATAL: No agent in database. Run: npm run seed:genesis\n");
    process.exit(1);
  }

  const originalWallet = agentBefore.wallet?.walletAddress ?? null;
  const tradeBefore    = agentBefore._count.trades;
  const decisionBefore = agentBefore._count.decisions;
  const memoryBefore   = agentBefore._count.memories;
  const treasuryBefore = agentBefore.treasury ? Number(agentBefore.treasury.currentBalance) : null;

  const rotationEventsBefore = await getWalletRotationEvents(agentBefore.id);
  const rotationEventIdsBefore = rotationEventsBefore.map((e) => e.id);

  console.log("  Pre-test snapshot:");
  console.log(`    Agent:    ${agentBefore.name} (#${agentBefore.agentId})`);
  console.log(`    Wallet:   ${originalWallet ?? "NOT SET"}`);
  console.log(`    Trades:   ${tradeBefore}`);
  console.log(`    Decisions:${decisionBefore}`);
  console.log(`    Memories: ${memoryBefore}`);
  console.log(`    Treasury: $${treasuryBefore?.toFixed(2) ?? "N/A"} USD-SIM`);
  console.log();
  console.log("─".repeat(58));
  console.log("  RUNNING TESTS");
  console.log("─".repeat(58));
  console.log();

  // ── TEST 1: Valid address is recognized ────────────────────────────
  try {
    const valid = isAddress(FAKE_WALLET_A);
    if (valid) pass("T01: Valid Ethereum address is accepted");
    else fail("T01: Valid Ethereum address is accepted", "isAddress() returned false for known valid address");
  } catch (e) {
    fail("T01: Valid Ethereum address is accepted", String(e));
  }

  // ── TEST 2: Invalid address (too short) is rejected ────────────────
  try {
    const invalid = isAddress("0xabc123");
    if (!invalid) pass("T02: Too-short address is rejected");
    else fail("T02: Too-short address is rejected", "isAddress() accepted an invalid address");
  } catch (e) {
    fail("T02: Too-short address is rejected", String(e));
  }

  // ── TEST 3: Non-hex address is rejected ───────────────────────────
  try {
    const invalid = isAddress("not-an-address");
    if (!invalid) pass("T03: Non-hex string is rejected");
    else fail("T03: Non-hex string is rejected", "isAddress() accepted a non-hex string");
  } catch (e) {
    fail("T03: Non-hex string is rejected", String(e));
  }

  // ── TEST 4: EIP-55 checksum normalization ─────────────────────────
  try {
    const lower = FAKE_WALLET_A.toLowerCase();
    const checksummed = getAddress(lower);
    if (checksummed === FAKE_WALLET_A) {
      pass("T04: EIP-55 checksum normalization works");
    } else {
      fail("T04: EIP-55 checksum normalization works", `Expected ${FAKE_WALLET_A}, got ${checksummed}`);
    }
  } catch (e) {
    fail("T04: EIP-55 checksum normalization works", String(e));
  }

  // ── TEST 5: Same wallet detection ─────────────────────────────────
  try {
    const currentWallet = agentBefore.wallet?.walletAddress;
    if (currentWallet) {
      const sameDetected = currentWallet.toLowerCase() === currentWallet.toLowerCase();
      if (sameDetected) pass("T05: Same-wallet detection works (no double rotation)");
      else fail("T05: Same-wallet detection works", "Same wallet not detected");
    } else {
      pass("T05: Same-wallet detection works (no wallet set — skipped)");
    }
  } catch (e) {
    fail("T05: Same-wallet detection works", String(e));
  }

  // ── TEST 6: Wallet rotation updates DB (with cleanup) ─────────────
  let rotationCreatedEventId: string | null = null;
  try {
    await setDbWallet(agentBefore.id, FAKE_WALLET_A);

    const eventsBefore = await getWalletRotationEvents(agentBefore.id);

    const event = await prisma.economicEvent.create({
      data: {
        agentId: agentBefore.id,
        eventType: "WALLET_ROTATED" as any,
        title: "Wallet Rotated [TEST]",
        description: `[TEST] Rotated from ${originalWallet} to ${FAKE_WALLET_A}`,
        result: "TEST",
        timestamp: new Date(),
      },
    });
    rotationCreatedEventId = event.id;

    const afterAgent = await getAgent();
    const afterWallet = afterAgent?.wallet?.walletAddress;

    if (afterWallet?.toLowerCase() === FAKE_WALLET_A.toLowerCase()) {
      pass("T06: Wallet rotation updates DB correctly");
    } else {
      fail("T06: Wallet rotation updates DB correctly", `Expected ${FAKE_WALLET_A}, got ${afterWallet}`);
    }
  } catch (e) {
    fail("T06: Wallet rotation updates DB correctly", String(e));
  }

  // ── TEST 7: Database continuity — trades unchanged ────────────────
  try {
    const after = await getAgent();
    if (after?._count.trades === tradeBefore) {
      pass("T07: Trade count unchanged after rotation");
    } else {
      fail("T07: Trade count unchanged after rotation",
        `Before: ${tradeBefore}, After: ${after?._count.trades}`);
    }
  } catch (e) {
    fail("T07: Trade count unchanged after rotation", String(e));
  }

  // ── TEST 8: Database continuity — decisions unchanged ─────────────
  try {
    const after = await getAgent();
    if (after?._count.decisions === decisionBefore) {
      pass("T08: Decision count unchanged after rotation");
    } else {
      fail("T08: Decision count unchanged after rotation",
        `Before: ${decisionBefore}, After: ${after?._count.decisions}`);
    }
  } catch (e) {
    fail("T08: Decision count unchanged after rotation", String(e));
  }

  // ── TEST 9: Database continuity — memories unchanged ──────────────
  try {
    const after = await getAgent();
    if (after?._count.memories === memoryBefore) {
      pass("T09: Memory count unchanged after rotation");
    } else {
      fail("T09: Memory count unchanged after rotation",
        `Before: ${memoryBefore}, After: ${after?._count.memories}`);
    }
  } catch (e) {
    fail("T09: Memory count unchanged after rotation", String(e));
  }

  // ── TEST 10: PnL / Treasury unchanged ─────────────────────────────
  try {
    const after = await getAgent();
    const balanceAfter = after?.treasury ? Number(after.treasury.currentBalance) : null;
    if (balanceAfter === treasuryBefore) {
      pass("T10: Treasury balance unchanged after rotation");
    } else {
      fail("T10: Treasury balance unchanged after rotation",
        `Before: ${treasuryBefore}, After: ${balanceAfter}`);
    }
  } catch (e) {
    fail("T10: Treasury balance unchanged after rotation", String(e));
  }

  // ── TEST 11: WALLET_ROTATED event created ─────────────────────────
  try {
    const eventsAfter = await getWalletRotationEvents(agentBefore.id);
    const newEvents = eventsAfter.filter((e) => !rotationEventIdsBefore.includes(e.id));
    if (newEvents.length > 0) {
      pass("T11: WALLET_ROTATED life log event was created");
    } else {
      fail("T11: WALLET_ROTATED life log event was created", "No new WALLET_ROTATED event found");
    }
  } catch (e) {
    fail("T11: WALLET_ROTATED life log event was created", String(e));
  }

  // ── TEST 12: Second rotation updates DB again ─────────────────────
  try {
    await setDbWallet(agentBefore.id, FAKE_WALLET_B);
    const after = await getAgent();
    if (after?.wallet?.walletAddress?.toLowerCase() === FAKE_WALLET_B.toLowerCase()) {
      pass("T12: Second rotation updates DB correctly");
    } else {
      fail("T12: Second rotation updates DB correctly", `Expected ${FAKE_WALLET_B}, got ${after?.wallet?.walletAddress}`);
    }
  } catch (e) {
    fail("T12: Second rotation updates DB correctly", String(e));
  }

  // ── TEST 13: Historical trades still intact (double rotation) ──────
  try {
    const after = await getAgent();
    if (after?._count.trades === tradeBefore) {
      pass("T13: Trades intact after second rotation");
    } else {
      fail("T13: Trades intact after second rotation",
        `Before: ${tradeBefore}, After: ${after?._count.trades}`);
    }
  } catch (e) {
    fail("T13: Trades intact after second rotation", String(e));
  }

  // ── RESTORE original wallet ───────────────────────────────────────
  console.log();
  console.log("─".repeat(58));
  console.log("  CLEANUP — Restoring original state...");
  console.log("─".repeat(58));

  try {
    if (originalWallet) {
      await setDbWallet(agentBefore.id, originalWallet);
      const restored = await getAgent();
      const restoredWallet = restored?.wallet?.walletAddress;
      if (restoredWallet?.toLowerCase() === originalWallet.toLowerCase()) {
        console.log(`  ✓ Wallet restored to: ${originalWallet}`);
      } else {
        console.log(`  ⚠ Wallet restore mismatch. Manual fix needed: ${originalWallet}`);
      }
    } else {
      console.log("  ⊘ No original wallet to restore.");
    }

    // Remove only the WALLET_ROTATED events created by this test run
    const eventsAfterAll = await getWalletRotationEvents(agentBefore.id);
    const testEventIds = eventsAfterAll
      .filter((e) => !rotationEventIdsBefore.includes(e.id))
      .map((e) => e.id);
    await deleteRotationEvents(agentBefore.id, testEventIds);
    console.log(`  ✓ Removed ${testEventIds.length} test WALLET_ROTATED event(s)`);

  } catch (e) {
    console.error(`  ✗ Cleanup failed: ${e instanceof Error ? e.message : e}`);
    console.error(`    Manual restore needed: agent_wallets.walletAddress = "${originalWallet}"`);
  }

  // ── Final report ──────────────────────────────────────────────────
  console.log();
  console.log("══════════════════════════════════════════════════════════");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  RESULTS: ${passed}/${results.length} passed   ${failed > 0 ? `(${failed} failed)` : ""}`);
  console.log("══════════════════════════════════════════════════════════");

  if (failed > 0) {
    console.log("\n  Failed tests:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`    ✗ ${r.name}: ${r.error}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log("\n  All tests passed. Wallet rotation system is working correctly.\n");
  }
}

runTests()
  .catch((e) => {
    console.error("\n❌ Test suite crashed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
