import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

/**
 * PHASE 7 MISSING STEP: Update Agent.agentId from testnet ID (5) to mainnet ID (485)
 *
 * Background:
 * - Phase 4 registered a Mainnet ERC-8004 identity: Agent #485
 * - ENV was updated: GLYPH_AGENT_ID=485
 * - But the DB Agent.agentId was NEVER updated from "5" to "485"
 * - The orchestrator looks up: prisma.agent.findFirst({ where: { agentId: "485" } })
 * - This returns null → "Agent #485 not found in database" → cycle FAILS
 *
 * Safety:
 * - Agent.id (UUID) is the FK used by ALL linked records (decisions, trades, etc.)
 * - Updating agentId (the onchain reference) does NOT affect any linked records
 * - No schema change required — just a data update
 * - 0 Decisions, 0 Trades, 0 Positions exist — zero risk of data corruption
 *
 * Change:
 * agents.agentId: "5" → "485"
 */

async function main() {
  console.log("=================================================================");
  console.log("🔧 PHASE 7 MISSING STEP: Update Agent.agentId to Mainnet ID");
  console.log("=================================================================\n");

  // Verify current state
  const agentBefore = await prisma.agent.findFirst({
    select: { id: true, agentId: true, name: true },
  });

  if (!agentBefore) {
    throw new Error("No agent found in database!");
  }

  console.log("BEFORE:");
  console.log("  DB Agent.agentId:", agentBefore.agentId);
  console.log("  ENV GLYPH_AGENT_ID:", process.env.GLYPH_AGENT_ID);
  console.log("  Match:", agentBefore.agentId === process.env.GLYPH_AGENT_ID);

  if (agentBefore.agentId === "485") {
    console.log("\n✅ Agent.agentId is already '485'. No update needed.");
    return;
  }

  if (agentBefore.agentId !== "5") {
    throw new Error(
      `Unexpected agentId '${agentBefore.agentId}'. Expected '5'. Aborting to prevent unintended update.`
    );
  }

  // Execute the update
  console.log("\nExecuting UPDATE: agents.agentId '5' → '485'...");
  const updated = await prisma.agent.update({
    where: { id: agentBefore.id },
    data: { agentId: "485" },
    select: { id: true, agentId: true, name: true },
  });

  console.log("\nAFTER:");
  console.log("  DB Agent.agentId:", updated.agentId);
  console.log("  ENV GLYPH_AGENT_ID:", process.env.GLYPH_AGENT_ID);
  console.log("  Match:", updated.agentId === process.env.GLYPH_AGENT_ID);

  // Verify all linked records are intact
  const [decisions, trades, positions, snapshots, runs] = await Promise.all([
    prisma.decision.count({ where: { agentId: agentBefore.id } }),
    prisma.trade.count({ where: { agentId: agentBefore.id } }),
    prisma.position.count({ where: { agentId: agentBefore.id } }),
    prisma.researchSnapshot.count(),
    prisma.agentRun.count({ where: { agentId: agentBefore.id } }),
  ]);

  console.log("\nLINKED RECORDS (all still intact):");
  console.log("  Decisions:", decisions);
  console.log("  Trades:", trades);
  console.log("  Positions:", positions);
  console.log("  ResearchSnapshots:", snapshots);
  console.log("  AgentRuns:", runs);

  console.log("\n✅ Agent.agentId successfully updated to '485'.");
  console.log("   All linked records preserved.");
  console.log("   The glyph-cycle endpoint will now find Agent #485 in the database.");
}

main().finally(() => prisma.$disconnect());
