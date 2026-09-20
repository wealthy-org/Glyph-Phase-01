// ============================================================================
// GLYPH PHASE 01 — LIFE LOG DATA FETCHER
// Derived from: BRIEF.md (§19, §2.4) & TODO.md
// Fetches genuine onchain and simulated economic events from prisma.economicEvent,
// enriching with linked Decision, Trade, and Memory entities for the
// Autonomous Activity Stream.
// ============================================================================

import { prisma } from "@/lib/prisma";
import {
  DecisionDetail,
  EventCategory,
  LifeEvent,
  MemoryDetail,
  TradeDetail,
} from "./types";

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
 * enriched with decisions, trades, and memories, ordered newest first.
 */
export async function getLifeEvents(agentIdentifier?: string): Promise<LifeEvent[]> {
  try {
    const targetAgentId = agentIdentifier || process.env.GLYPH_AGENT_ID;
    let agent = targetAgentId
      ? await prisma.agent.findFirst({ where: { agentId: targetAgentId } })
      : await prisma.agent.findFirst();

    if (!agent) {
      agent = await prisma.agent.findFirst();
    }

    const birthDate = agent ? new Date(agent.createdAt) : new Date();

    const [events, allDecisions, allTrades, allMemories] = await Promise.all([
      prisma.economicEvent.findMany({
        where: agent ? { agentId: agent.id } : undefined,
        orderBy: { timestamp: "desc" },
      }),
      prisma.decision.findMany({
        where: agent ? { agentId: agent.id } : undefined,
        include: { researchSnapshot: true },
      }),
      prisma.trade.findMany({
        where: agent ? { agentId: agent.id } : undefined,
        include: { position: true },
      }),
      prisma.memory.findMany({
        where: agent ? { agentId: agent.id } : undefined,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!events || events.length === 0) {
      return [];
    }

    const decisionMap = new Map(allDecisions.map((d) => [d.id, d]));
    const tradeMap = new Map(allTrades.map((t) => [t.id, t]));

    return events.map((evt) => {
      const d = new Date(evt.timestamp);
      const day = evt.day ?? calculateAgentDay(d, birthDate);
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

      const linkedDecision = evt.decisionId ? decisionMap.get(evt.decisionId) : null;
      const linkedTrade = evt.tradeId ? tradeMap.get(evt.tradeId) : null;

      // Find matching memory if this is a memory event
      let linkedMemory = null;
      if (evt.eventType === "MEMORY_CREATED") {
        if (evt.tradeId) {
          linkedMemory = allMemories.find((m) => m.tradeId === evt.tradeId) || null;
        }
        if (!linkedMemory && allMemories.length > 0) {
          // match by asset in title or fallback to most recent
          const assetMatch = allMemories.find((m) =>
            evt.title.toUpperCase().includes(m.lesson?.slice(0, 10).toUpperCase() || "")
          );
          linkedMemory = assetMatch || allMemories[0];
        }
      }

      // Determine streamType
      let streamType: LifeEvent["streamType"] = "SYSTEM";
      if (evt.eventType === "RESEARCH_STARTED") {
        streamType = "ANALYSIS";
      } else if (evt.eventType === "DECISION_MADE") {
        streamType = "DECISION";
      } else if (
        evt.eventType === "TRADE_OPENED" ||
        evt.eventType === "TRADE_CLOSED" ||
        evt.eventType === "PROFIT_RECORDED" ||
        evt.eventType === "LOSS_RECORDED"
      ) {
        streamType = "TRADE";
      } else if (evt.eventType === "MEMORY_CREATED") {
        streamType = "MEMORY";
      } else if (evt.eventType === "TREASURY_FUNDED") {
        streamType = "TREASURY";
      }

      // Determine reference identifier
      let refNumber = `#${evt.id.slice(0, 4).toUpperCase()}`;
      if (linkedTrade?.tradeNumber) {
        refNumber = linkedTrade.tradeNumber;
      } else if (linkedDecision) {
        refNumber = `#${linkedDecision.id.slice(0, 4).toUpperCase()}`;
      } else if (evt.day) {
        refNumber = `#D${evt.day.toString().padStart(2, "0")}`;
      }

      // Determine status and statusTone
      let status = "COMPLETED";
      let statusTone: LifeEvent["statusTone"] = "neutral";
      let actionLabel: string | null = null;
      let shortMeta = "";

      switch (evt.eventType) {
        case "RESEARCH_STARTED": {
          status = "COMPLETED";
          statusTone = "neutral";
          actionLabel = "VIEW DETAILS →";
          const score = evt.result ? evt.result.replace("SCORE", "").trim() : "74";
          shortMeta = `${linkedDecision?.asset || "Market asset"} analysis · 3 signals · Confidence ${score}%`;
          break;
        }
        case "DECISION_MADE": {
          const isApproved =
            (evt.result && evt.result.includes("APPROVED")) ||
            linkedDecision?.policyResult === "APPROVED";
          status = isApproved ? "APPROVED" : "REJECTED";
          statusTone = isApproved ? "positive" : "negative";
          actionLabel = "GLYPHS VIEW →";
          const conviction = linkedDecision?.conviction || 74;
          shortMeta = `Risk policy ${status.toLowerCase()} · Conviction ${conviction}%`;
          break;
        }
        case "TRADE_OPENED": {
          status = "OPENED";
          statusTone = "positive";
          actionLabel = "VIEW TRADE →";
          if (linkedTrade) {
            shortMeta = `${linkedTrade.asset} · ${linkedTrade.action} · ${linkedTrade.leverage}× · Entry $${Number(linkedTrade.entryPrice).toFixed(2)}`;
          } else {
            shortMeta = evt.description || "Active simulated trade entered";
          }
          break;
        }
        case "TRADE_CLOSED": {
          status = "CLOSED";
          const isPositive = evt.result?.startsWith("+");
          const isNegative = evt.result?.startsWith("-");
          statusTone = isPositive ? "positive" : isNegative ? "negative" : "neutral";
          actionLabel = "VIEW TRADE →";
          shortMeta = `Settled execution · Realized PnL: ${evt.result || "0.00"}`;
          break;
        }
        case "PROFIT_RECORDED": {
          status = "PROFIT";
          statusTone = "positive";
          actionLabel = linkedTrade ? "VIEW TRADE →" : null;
          shortMeta = `Settlement gain: ${evt.result || ""}`;
          break;
        }
        case "LOSS_RECORDED": {
          status = "LOSS";
          statusTone = "negative";
          actionLabel = linkedTrade ? "VIEW TRADE →" : null;
          shortMeta = `Settlement loss: ${evt.result || ""}`;
          break;
        }
        case "MEMORY_CREATED": {
          const isWin = evt.result?.includes("WIN") || linkedMemory?.outcome === "WIN";
          const isLoss = evt.result?.includes("LOSS") || linkedMemory?.outcome === "LOSS";
          status = isWin ? "WIN // CORRECT" : isLoss ? "LOSS // CALIBRATE" : "RECORDED";
          statusTone = isWin ? "positive" : isLoss ? "negative" : "neutral";
          actionLabel = "VIEW MEMORY →";
          shortMeta = linkedMemory?.adaptation
            ? `Adaptation: ${linkedMemory.adaptation}`
            : linkedMemory?.lesson
              ? `Lesson: ${linkedMemory.lesson}`
              : "Post-trade calibration and weight adjustments committed";
          break;
        }
        case "TREASURY_FUNDED": {
          status = "FUNDED";
          statusTone = "positive";
          actionLabel = null; // No detail button needed
          shortMeta = evt.description || (evt.result ? `Capital injected: ${evt.result}` : "Treasury funded");
          break;
        }
        case "AGENT_BORN": {
          status = "GENESIS";
          statusTone = "neutral";
          actionLabel = null; // No detail button needed
          shortMeta = "Autonomous economic being initialized on Robinhood Chain Testnet";
          break;
        }
        case "IDENTITY_REGISTERED": {
          status = "VERIFIED";
          statusTone = "positive";
          actionLabel = null; // No detail button needed
          shortMeta = "ERC-8004 cryptographic agent identity registered onchain";
          break;
        }
        case "WALLET_CREATED": {
          status = "CREATED";
          statusTone = "positive";
          actionLabel = null; // No detail button needed
          shortMeta = "Safe smart account deployed for autonomous execution";
          break;
        }
        default: {
          status = "RECORDED";
          statusTone = "neutral";
          actionLabel = null;
          shortMeta = evt.description || "";
          break;
        }
      }

      // Construct DecisionDetail
      let decisionDetail: DecisionDetail | null = null;
      if (linkedDecision) {
        const thesisObj = (linkedDecision.thesis as Record<string, string>) || {};
        decisionDetail = {
          id: linkedDecision.id,
          asset: linkedDecision.asset,
          action: linkedDecision.action,
          conviction: linkedDecision.conviction,
          timeHorizon: linkedDecision.timeHorizon,
          fundamentalScore: linkedDecision.fundamentalScore,
          technicalScore: linkedDecision.technicalScore,
          riskScore: linkedDecision.riskScore,
          policyResult: linkedDecision.policyResult,
          policyRejectReason: linkedDecision.policyRejectReason,
          thesis: {
            fundamental: thesisObj.fundamental,
            technical: thesisObj.technical,
            catalyst: thesisObj.catalyst,
            risk: thesisObj.risk,
            invalidation: thesisObj.invalidation,
          },
          decisionHash: linkedDecision.decisionHash,
          transactionHash: linkedDecision.transactionHash,
        };
      }

      // Construct TradeDetail
      let tradeDetail: TradeDetail | null = null;
      if (linkedTrade) {
        tradeDetail = {
          id: linkedTrade.id,
          tradeNumber: linkedTrade.tradeNumber,
          asset: linkedTrade.asset,
          action: linkedTrade.action,
          entryPrice: Number(linkedTrade.entryPrice),
          exitPrice: linkedTrade.exitPrice ? Number(linkedTrade.exitPrice) : null,
          positionSize: Number(linkedTrade.positionSize),
          leverage: Number(linkedTrade.leverage),
          status: linkedTrade.status,
          simulatedPnl: linkedTrade.simulatedPnl ? Number(linkedTrade.simulatedPnl) : null,
          simulatedPnlPercent: linkedTrade.simulatedPnlPercent
            ? Number(linkedTrade.simulatedPnlPercent)
            : null,
          stopLoss: linkedTrade.position?.stopLoss ? Number(linkedTrade.position.stopLoss) : null,
          targetPrice: linkedTrade.position?.targetPrice
            ? Number(linkedTrade.position.targetPrice)
            : null,
          invalidationLevel: linkedTrade.position?.invalidationLevel
            ? Number(linkedTrade.position.invalidationLevel)
            : null,
        };
      }

      // Construct MemoryDetail
      let memoryDetail: MemoryDetail | null = null;
      if (linkedMemory) {
        memoryDetail = {
          id: linkedMemory.id,
          outcome: linkedMemory.outcome,
          thesisResult: linkedMemory.thesisResult,
          lesson: linkedMemory.lesson,
          adaptation: linkedMemory.adaptation,
          weightShift: linkedMemory.weightShift,
          confidenceCalibration: linkedMemory.confidenceCalibration,
        };
      }

      return {
        id: evt.id,
        day,
        date,
        time,
        timestamp: evt.timestamp.toISOString(),
        category: mapEventTypeToCategory(evt.eventType),
        eventType: evt.eventType,
        streamType,
        refNumber,
        status,
        statusTone,
        title: evt.title,
        description: evt.description || "",
        shortMeta,
        actionLabel,
        tx: evt.txHash ? formatShortHash(evt.txHash) : null,
        txHash: evt.txHash || null,
        result: evt.result || null,
        tradeId: evt.tradeId || linkedTrade?.id || null,
        decisionId: evt.decisionId || linkedDecision?.id || null,
        decision: decisionDetail,
        trade: tradeDetail,
        memory: memoryDetail,
      };
    });
  } catch (error) {
    console.error("[LifeLogServer] Error fetching economic events from DB:", error);
    return [];
  }
}
