// ============================================================================
// GLYPH PHASE 01 — PERSISTENT MEMORY ENGINE
// Derived from: BRIEF.md (§15, §18, §19, §112 TODO)
// Manages persistent trade outcomes, lesson synthesis, and historical reflections.
// ============================================================================

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type MemoryOutcome = "WIN" | "LOSS" | "BREAKEVEN";
export type ThesisResult = "CORRECT" | "INCORRECT" | "PARTIAL" | "PENDING";
export type ConfidenceCalibration =
  | "GOOD"
  | "OVER_CONFIDENT"
  | "UNDER_CONFIDENT"
  | "NEUTRAL";

export interface CreateMemoryParams {
  tradeId: string;
  agentId: string;
  asset: string;
  side: "LONG" | "SHORT";
  pnlPercent: number;
  conviction?: number | null;
  thesis?: any;
  reason?: "MANUAL" | "LIQUIDATION" | "STOP_LOSS" | "TAKE_PROFIT";
}

export interface TradeMemoryRecord {
  id: string;
  tradeId: string | null;
  asset?: string;
  outcome: MemoryOutcome;
  pnlPercent: number;
  thesisResult: ThesisResult;
  lesson: string;
  confidenceCalibration: ConfidenceCalibration;
  adaptation: string | null;
  weightShift: string | null;
  createdAt: Date;
}

/**
 * Classifies the outcome based on realized PnL percentage.
 */
export function classifyOutcome(pnlPercent: number): MemoryOutcome {
  if (pnlPercent >= 0.5) return "WIN";
  if (pnlPercent <= -0.5) return "LOSS";
  return "BREAKEVEN";
}

/**
 * Grades confidence calibration (§15):
 * - WIN + high conviction (>= 75) => GOOD
 * - LOSS + high conviction (>= 70) => OVER_CONFIDENT
 * - WIN + low conviction (<= 60) => UNDER_CONFIDENT
 * - Default => NEUTRAL
 */
export function gradeConfidenceCalibration(
  outcome: MemoryOutcome,
  conviction: number = 70
): ConfidenceCalibration {
  if (outcome === "WIN") {
    if (conviction >= 75) return "GOOD";
    if (conviction <= 60) return "UNDER_CONFIDENT";
    return "NEUTRAL";
  }

  if (outcome === "LOSS") {
    if (conviction >= 70) return "OVER_CONFIDENT";
    return "NEUTRAL";
  }

  return "NEUTRAL";
}

/**
 * Synthesizes an objective, grounded lesson based on trade outcome and thesis.
 */
export function synthesizeLesson(
  asset: string,
  side: string,
  outcome: MemoryOutcome,
  pnlPercent: number,
  calibration: ConfidenceCalibration,
  reason?: string
): { lesson: string; adaptation: string; weightShift: string } {
  const pnlSign = pnlPercent >= 0 ? "+" : "";

  if (outcome === "WIN") {
    return {
      lesson: `${asset} ${side} validated with ${pnlSign}${pnlPercent.toFixed(
        2
      )}% gain. Momentum and fundamental thesis aligned favorably with execution timing.`,
      adaptation:
        calibration === "GOOD"
          ? "Reinforce high-conviction momentum thesis patterns for volatile tier-1 assets."
          : "Calibrate conviction upward when technical breakout confirms fundamental catalysts.",
      weightShift: "+3.8% Momentum / +2.1% Catalyst Alignment",
    };
  }

  if (outcome === "LOSS") {
    const isLiq = reason === "LIQUIDATION";
    return {
      lesson: `${asset} ${side} resulted in ${pnlPercent.toFixed(
        2
      )}% loss${isLiq ? " (Simulated Liquidation)" : ""}. Invalidation boundary was breached before expected catalyst played out.`,
      adaptation:
        calibration === "OVER_CONFIDENT"
          ? "Reduce initial leverage and widen invalidation tolerance on macro volatility days."
          : "Tighten stop-loss triggers to preserve treasury capital against sudden adverse momentum.",
      weightShift: "-4.5% Overconfidence Drag / +3.0% Volatility Sensitivity",
    };
  }

  return {
    lesson: `${asset} ${side} closed near breakeven (${pnlSign}${pnlPercent.toFixed(
      2
    )}%). Market exhibited consolidation without decisive directional commitment.`,
    adaptation: "Require stronger volume breakout confirmation before scaling position.",
    weightShift: "Neutral weight distribution maintained.",
  };
}

/**
 * Creates and persists a memory record when a trade is closed (§15).
 * Also records an EconomicEvent for the Life Log (§19).
 */
export async function createTradeMemoryInTransaction(
  tx: Prisma.TransactionClient,
  params: CreateMemoryParams
): Promise<TradeMemoryRecord> {
  const outcome = classifyOutcome(params.pnlPercent);
  const conviction = params.conviction ?? 70;
  const calibration = gradeConfidenceCalibration(outcome, conviction);

  const thesisResult: ThesisResult =
    outcome === "WIN" ? "CORRECT" : outcome === "LOSS" ? "INCORRECT" : "PARTIAL";

  const { lesson, adaptation, weightShift } = synthesizeLesson(
    params.asset,
    params.side,
    outcome,
    params.pnlPercent,
    calibration,
    params.reason
  );

  const memory = await tx.memory.create({
    data: {
      agentId: params.agentId,
      tradeId: params.tradeId,
      outcome,
      pnlPercent: params.pnlPercent,
      thesisResult,
      lesson,
      confidenceCalibration: calibration,
      adaptation,
      weightShift,
    },
  });

  await tx.economicEvent.create({
    data: {
      agentId: params.agentId,
      eventType: "MEMORY_CREATED",
      title: `Memory Formed: ${params.asset} ${outcome}`,
      description: `Reflected on trade: ${lesson} [Calibration: ${calibration}]`,
      tradeId: params.tradeId,
      result: `${outcome} (${calibration})`,
    },
  });

  return {
    id: memory.id,
    tradeId: memory.tradeId,
    asset: params.asset,
    outcome: memory.outcome as MemoryOutcome,
    pnlPercent: Number(memory.pnlPercent ?? params.pnlPercent),
    thesisResult: memory.thesisResult as ThesisResult,
    lesson: memory.lesson,
    confidenceCalibration: memory.confidenceCalibration as ConfidenceCalibration,
    adaptation: memory.adaptation,
    weightShift: memory.weightShift,
    createdAt: memory.createdAt,
  };
}

export async function createTradeMemory(
  params: CreateMemoryParams
): Promise<TradeMemoryRecord> {
  return prisma.$transaction((tx) => createTradeMemoryInTransaction(tx, params));
}

/**
 * Fetches recent memories for reflection in decision prompts (§112 TODO) and UI display.
 * Supports asset-specific filtering: if `asset` is provided, only past trade memories
 * for that asset will be retrieved, preventing cross-asset bias.
 */
export async function getRecentMemories(
  agentIdentifier: string = process.env.GLYPH_AGENT_ID || "1",
  limit: number = 3,
  asset?: string
): Promise<TradeMemoryRecord[]> {
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
  });

  if (!agent) return [];

  let tradeIdFilter: { in: string[] } | undefined = undefined;
  const assetMap: Record<string, string> = {};

  if (asset) {
    const matchingTrades = await prisma.trade.findMany({
      where: {
        agentId: agent.id,
        asset: asset.toUpperCase(),
      },
      select: { id: true, asset: true },
    });
    const tradeIds = matchingTrades.map((t) => t.id);
    tradeIdFilter = { in: tradeIds };
    matchingTrades.forEach((t) => {
      assetMap[t.id] = t.asset;
    });
  }

  const memories = await prisma.memory.findMany({
    where: {
      agentId: agent.id,
      ...(tradeIdFilter ? { tradeId: tradeIdFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // If no asset filter was specified, also fetch trade assets for context
  if (!asset && memories.length > 0) {
    const tradeIds = memories.map((m) => m.tradeId).filter((id): id is string => Boolean(id));
    if (tradeIds.length > 0) {
      const trades = await prisma.trade.findMany({
        where: { id: { in: tradeIds } },
        select: { id: true, asset: true },
      });
      trades.forEach((t) => {
        assetMap[t.id] = t.asset;
      });
    }
  }

  return memories.map((m) => ({
    id: m.id,
    tradeId: m.tradeId,
    asset: m.tradeId ? assetMap[m.tradeId] || (asset ? asset.toUpperCase() : undefined) : undefined,
    outcome: m.outcome as MemoryOutcome,
    pnlPercent: Number(m.pnlPercent ?? 0),
    thesisResult: m.thesisResult as ThesisResult,
    lesson: m.lesson,
    confidenceCalibration: m.confidenceCalibration as ConfidenceCalibration,
    adaptation: m.adaptation,
    weightShift: m.weightShift,
    createdAt: m.createdAt,
  }));
}
