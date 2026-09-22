// ============================================================================
// GLYPH PHASE 01 — DELETE LATEST NVDA RESEARCH ANALYSIS & LIFE LOG EVENT
// Target Cycle: cycle_20260922135823_NVDA
// Target Snapshot: 702728ee-b248-4a0c-a34f-856635379a11
// Target EconomicEvent (Life Log): 90b84c4e-39b6-421d-816e-19907f9172d4
// ============================================================================

import { prisma } from "../../src/lib/prisma";

async function main() {
  const targetCycleId = "cycle_20260922135823_NVDA";
  const targetSnapshotId = "702728ee-b248-4a0c-a34f-856635379a11";
  const targetEventId = "90b84c4e-39b6-421d-816e-19907f9172d4";

  console.log("=== PRE-DELETE AUDIT ===");
  const [snapshot, event, logs] = await Promise.all([
    prisma.researchSnapshot.findUnique({ where: { id: targetSnapshotId } }),
    prisma.economicEvent.findUnique({ where: { id: targetEventId } }),
    prisma.activityLog.findMany({ where: { cycleId: targetCycleId } }),
  ]);

  if (!snapshot && !event && logs.length === 0) {
    console.log("No records found for target cycle. It may have already been deleted.");
    return;
  }

  console.log(`Snapshot to delete: ${snapshot ? snapshot.id : "None"}`);
  console.log(`EconomicEvent (Life Log) to delete: ${event ? `${event.id} ("${event.title}")` : "None"}`);
  console.log(`ActivityLogs to delete: ${logs.length} record(s)`);

  console.log("\nDeleting records in a database transaction...");
  await prisma.$transaction(async (tx) => {
    // 1. Delete EconomicEvent (Removes from Life Log)
    if (event) {
      await tx.economicEvent.delete({
        where: { id: targetEventId },
      });
    }

    // 2. Delete ActivityLogs
    await tx.activityLog.deleteMany({
      where: { cycleId: targetCycleId },
    });

    // 3. Delete ResearchSnapshot
    if (snapshot) {
      await tx.researchSnapshot.delete({
        where: { id: targetSnapshotId },
      });
    }
  });

  console.log("✅ Successfully deleted latest NVDA analysis from database and Life Log!");

  // Verification
  const [checkSnapshot, checkEvent, checkLogs] = await Promise.all([
    prisma.researchSnapshot.findUnique({ where: { id: targetSnapshotId } }),
    prisma.economicEvent.findUnique({ where: { id: targetEventId } }),
    prisma.activityLog.findMany({ where: { cycleId: targetCycleId } }),
  ]);

  console.log("\n=== VERIFICATION ===");
  console.log("Snapshot exists:", checkSnapshot !== null);
  console.log("EconomicEvent (Life Log) exists:", checkEvent !== null);
  console.log("ActivityLogs exist:", checkLogs.length > 0);
}

main()
  .catch((err) => {
    console.error("❌ Error deleting NVDA analysis:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
