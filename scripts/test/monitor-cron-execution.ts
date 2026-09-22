import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

async function monitor() {
  console.log("=== STARTING CRON EXECUTION MONITOR ===");
  console.log(`Current Time: ${new Date().toISOString()}`);
  const baselineCount = 6;
  const maxWaitMs = 180 * 1000; // 3 minutes
  const intervalMs = 5000; // 5 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const currentCount = await prisma.agentRun.count();
    if (currentCount > baselineCount) {
      console.log(`🚀 [EVENT] New AgentRun detected! (Total runs: ${currentCount})`);
      // Wait for the run to complete
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 12) {
        attempts++;
        const latest = await prisma.agentRun.findFirst({
          orderBy: { startedAt: "desc" },
        });
        if (latest?.completedAt) {
          console.log(`✅ [COMPLETE] Latest Run finished at ${latest.completedAt.toISOString()}`);
          console.log("Details:", JSON.stringify(latest, null, 2));
          completed = true;
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      return;
    }

    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    if (elapsedSec % 15 === 0) {
      console.log(`[${new Date().toISOString()}] Waiting for cron... (${elapsedSec}s elapsed, runs: ${currentCount})`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  console.log("⏳ [TIMEOUT] No new AgentRun detected within 3 minutes.");
}

monitor()
  .catch((e) => {
    console.error("Monitor error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
