// ============================================================================
// GLYPH PHASE 01 — LIFE LOG DATA FETCHER
// Derived from: BRIEF.md (§19, §2.4) & TODO.md (Tahap 7 line 129)
//
// Fetches genuine on-chain and simulated economic events from prisma.economicEvent,
// transforming them into a chronological feed for /life.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { LifeEvent, EventCategory } from "./types";

function mapEventTypeToCategory(eventType: string): EventCategory {
  switch (eventType) {
    case "AGENT_BORN":
    case "IDENTITY_REGISTERED":
    case "WALLET_CREATED":
    case "REPUTATION_UPDATED":
      return "GENESIS";
    case "TREASURY_FUNDED":
      return "TREASURY";
    case "RESEARCH_STARTED":
      return "THESIS";
    case "DECISION_MADE":
      return "DECISION";
    case "TRADE_OPENED":
    case "TRADE_CLOSED":
    case "PROFIT_RECORDED":
    case "LOSS_RECORDED":
      return "TRADE";
    case "MEMORY_CREATED":
      return "MEMORY";
    default:
      return "GENESIS";
  }
}

function formatShortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 7)}...${hash.slice(-4)}`;
}

function calculateAgentDay(eventDate: Date, birthDate: Date): number {
  const eventUtc = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate()
  );
  const birthUtc = Date.UTC(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth(),
    birthDate.getUTCDate()
  );

  const diffDays = Math.floor((eventUtc - birthUtc) / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays + 1);
}

/**
 * Retrieves all economic events for the specified agent from the database,
 * ordered chronologically descending (newest first).
 */
export async function getLifeEvents(agentIdentifier = "1"): Promise<LifeEvent[]> {
  try {
    const agent = await prisma.agent.findFirst({
      where: { agentId: agentIdentifier },
    });

    const birthDate = agent ? new Date(agent.createdAt) : new Date("2026-09-17T00:00:00.000Z");

    const events = await prisma.economicEvent.findMany({
      where: agent ? { agentId: agent.id } : undefined,
      orderBy: { timestamp: "desc" },
    });

    if (!events || events.length === 0) {
      return [];
    }

    return events.map((evt) => {
      const d = new Date(evt.timestamp);
      const day = calculateAgentDay(d, birthDate);
      const date = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const time =
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC";

      return {
        id: evt.id,
        day,
        date,
        time,
        timestamp: evt.timestamp.toISOString(),
        category: mapEventTypeToCategory(evt.eventType),
        title: evt.title,
        description: evt.description || "",
        tx: evt.txHash ? formatShortHash(evt.txHash) : null,
        txHash: evt.txHash || null,
        result: evt.result || null,
      };
    });
  } catch (error) {
    console.error("[LifeLogServer] Error fetching economic events from DB:", error);
    return [];
  }
}
