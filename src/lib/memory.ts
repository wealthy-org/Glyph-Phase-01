// ============================================================================
// GLYPH PHASE 01 — PERSISTENT MEMORY ENGINE
// Derived from: BRIEF.md (§15, §18, §19, §112 TODO)
// Manages persistent trade outcomes, lesson synthesis, and historical reflections.
// ============================================================================

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

function normalizeText(value: unknown, fallback = "Unavailable"): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value).slice(0, 500);
  } catch {
    return fallback;
  }
}

function formattedPnl(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function buildDeterministicLesson(context: {
  asset: string;
  side: string;
  decision: string;
  fundamental: string;
  technical: string;
  risk: string;
  marketContext: string;
  glyphView: string;
  reasoning: string;
  realizedPnl: number;
  realizedPnlPercent: number;
  outcome: "PROFIT" | "LOSS" | "BREAKEVEN";
}): string {
  const baseContext = [context.fundamental, context.technical]
    .filter((part) => part && part !== "Unavailable")
    .slice(0, 2)
    .join(" ");

  const decisionSummary = context.decision === "OPEN_LONG" ? "LONG" : context.decision === "OPEN_SHORT" ? "SHORT" : context.decision;

  if (context.outcome === "PROFIT") {
    return `The ${decisionSummary} decision for ${context.asset} was supported by the recorded ${baseContext || context.marketContext}, and the position closed with ${formattedPnl(context.realizedPnl)} realized PnL.`;
  }

  if (context.outcome === "LOSS") {
    return `The ${decisionSummary} decision for ${context.asset} was supported by the recorded ${baseContext || context.marketContext}, but the expected direction did not materialize and the position closed with ${formattedPnl(context.realizedPnl)} realized PnL.`;
  }

  return `The ${decisionSummary} decision for ${context.asset} was supported by the recorded ${baseContext || context.marketContext}, and the position closed near breakeven at ${context.realizedPnlPercent.toFixed(2)}%.`;
}

const MemoryLessonSchema = z.object({
  lesson: z.string().trim().min(1).max(280),
});

async function generateLessonFromContext(context: {
  asset: string;
  side: string;
  decision: string;
  fundamental: string;
  technical: string;
  risk: string;
  marketContext: string;
  glyphView: string;
  reasoning: string;
  realizedPnl: number;
  realizedPnlPercent: number;
  outcome: "PROFIT" | "LOSS" | "BREAKEVEN";
}): Promise<string> {
  const fallbackLesson = buildDeterministicLesson(context);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return fallbackLesson;
  }

  const prompt = `You are generating an economic memory for Glyph.

Review the completed trade using ONLY the factual data provided below.

ORIGINAL DECISION CONTEXT
- Asset: ${context.asset}
- Decision: ${context.decision}
- Fundamental: ${context.fundamental}
- Technical: ${context.technical}
- Risk: ${context.risk}
- Market Context: ${context.marketContext}
- Original Glyph View: ${context.glyphView}
- Decision Reasoning: ${context.reasoning}

TRADE
- Side: ${context.side}
- Final Outcome: ${context.outcome}
- Realized PnL: ${formattedPnl(context.realizedPnl)}
- Realized PnL %: ${context.realizedPnlPercent.toFixed(2)}%

Generate ONE concise lesson describing what Glyph experienced from this completed trade.
Rules:
1. Use ONLY the provided facts.
2. Do not invent indicators, events, market conditions, or reasons.
3. Do not modify the calculated PnL or outcome.
4. Do not create future trading advice.
5. Do not claim that a factor caused the outcome unless the provided data supports it.
6. Do not introduce information that was unavailable at the time of the original decision.
7. The lesson should describe the relationship between Glyph's original decision context and the actual outcome.
8. Keep the lesson concise, approximately 1-2 sentences.`;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://glyph.network",
          "X-Title": "Glyph Autonomous Agent",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 250,
          messages: [
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter HTTP ${response.status}`);
      }

      const json = await response.json();
      const raw = json.choices?.[0]?.message?.content ?? "";
      if (!raw) {
        throw new Error("Empty lesson response");
      }

      const cleaned = raw.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      let parsed: unknown = cleaned;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { lesson: cleaned || fallbackLesson };
      }

      const validation = MemoryLessonSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data.lesson;
      }
      throw new Error(validation.error.issues.map((issue) => issue.message).join(", "));
    } catch (error) {
      if (attempt === 2) {
        console.warn("[Memory] lesson generation failed; using deterministic fallback.", error);
        return fallbackLesson;
      }
    }
  }

  return fallbackLesson;
}

async function reconstructTradeMemoryContext(
  tx: Prisma.TransactionClient,
  tradeId: string
): Promise<{
  asset: string;
  side: string;
  decision: string;
  fundamental: string;
  technical: string;
  risk: string;
  marketContext: string;
  glyphView: string;
  reasoning: string;
  realizedPnl: number;
  realizedPnlPercent: number;
  outcome: "PROFIT" | "LOSS" | "BREAKEVEN";
  decisionId: string | null;
}> {
  const trade = await tx.trade.findUnique({
    where: { id: tradeId },
    include: {
      decision: { include: { researchSnapshot: true } },
      position: true,
    },
  });

  if (!trade) {
    throw new Error(`Trade ${tradeId} not found while constructing economic memory.`);
  }

  const thesis = ((trade.decision?.thesis ?? trade.thesis ?? {}) as Record<string, unknown>);
  const decisionAction = trade.decision?.action ?? (trade.action === "LONG" ? "OPEN_LONG" : "OPEN_SHORT");
  const fundamental = normalizeText(thesis.fundamental ?? (trade.decision?.fundamentalScore != null ? `Fundamental score ${trade.decision.fundamentalScore}/100` : "Unavailable"));
  const technical = normalizeText(thesis.technical ?? (trade.decision?.technicalScore != null ? `Technical score ${trade.decision.technicalScore}/100` : "Unavailable"));
  const risk = normalizeText(thesis.risk ?? (trade.decision?.riskScore != null ? `Risk score ${trade.decision.riskScore}/100` : "Unavailable"));
  const marketContext = normalizeText(
    trade.decision?.researchSnapshot?.marketData ?? trade.decision?.researchSnapshot?.fundamentalData ?? trade.decision?.researchSnapshot?.technicalData ?? "Market context recorded at entry",
    "Market context recorded at entry"
  );
  const glyphView = normalizeText(thesis.catalyst ?? thesis.fundamental ?? "Original glyph view available at entry");
  const reasoning = normalizeText(
    [thesis.catalyst, thesis.invalidation].filter(Boolean).join(" ") || "No additional reasoning recorded at entry.",
    "No additional reasoning recorded at entry."
  );

  const realizedPnl = Number(trade.simulatedPnl ?? 0);
  const realizedPnlPercent = Number(trade.simulatedPnlPercent ?? 0);
  const outcome: "PROFIT" | "LOSS" | "BREAKEVEN" =
    realizedPnl > 0 ? "PROFIT" : realizedPnl < 0 ? "LOSS" : "BREAKEVEN";

  return {
    asset: trade.asset,
    side: trade.action,
    decision: decisionAction,
    fundamental,
    technical,
    risk,
    marketContext,
    glyphView,
    reasoning,
    realizedPnl,
    realizedPnlPercent,
    outcome,
    decisionId: trade.decision?.id ?? null,
  };
}

/**
 * Synthesizes an objective, grounded lesson based on trade outcome and original decision context.
 */
export function synthesizeLesson(
  asset: string,
  side: string,
  outcome: MemoryOutcome,
  pnlPercent: number,
  calibration: ConfidenceCalibration,
  reason?: string,
  context?: {
    fundamental?: string;
    technical?: string;
    risk?: string;
    marketContext?: string;
    glyphView?: string;
    reasoning?: string;
  }
): { lesson: string; adaptation: string; weightShift: string } {
  const pnlSign = pnlPercent >= 0 ? "+" : "";
  const summary = context ? [context.fundamental, context.technical].filter(Boolean).join(" ") : "";

  if (outcome === "WIN") {
    return {
      lesson: `${asset} ${side} validated with ${pnlSign}${pnlPercent.toFixed(
        2
      )}% gain${summary ? ` under the recorded ${summary}` : ""}. Momentum and the original thesis aligned favorably with execution timing.`,
      adaptation:
        calibration === "GOOD"
          ? "Reinforce high-conviction thesis patterns for favorable market regimes."
          : "Calibrate conviction upward when the recorded thesis is confirmed by evidence.",
      weightShift: "+3.8% Momentum / +2.1% Catalyst Alignment",
    };
  }

  if (outcome === "LOSS") {
    const isLiq = reason === "LIQUIDATION";
    return {
      lesson: `${asset} ${side} resulted in ${pnlPercent.toFixed(
        2
      )}% loss${isLiq ? " (Simulated Liquidation)" : ""}${summary ? ` despite the recorded ${summary}` : ""}. The original expectation did not materialize before the position was closed.`,
      adaptation:
        calibration === "OVER_CONFIDENT"
          ? "Reduce initial leverage and widen invalidation tolerance on volatile market conditions."
          : "Tighten risk controls and ensure the original thesis remains supported by evidence before holding the position.",
      weightShift: "-4.5% Overconfidence Drag / +3.0% Volatility Sensitivity",
    };
  }

  return {
    lesson: `${asset} ${side} closed near breakeven (${pnlSign}${pnlPercent.toFixed(
      2
    )}%)${summary ? ` after the recorded ${summary}` : ""}. The trade remained directionally uncertain without a decisive catalyst.`,
    adaptation: "Require stronger confirmation from the original thesis before scaling position risk.",
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
  const existing = await tx.memory.findFirst({ where: { tradeId: params.tradeId } });
  if (existing) {
    return {
      id: existing.id,
      tradeId: existing.tradeId,
      asset: params.asset,
      outcome: existing.outcome as MemoryOutcome,
      pnlPercent: Number(existing.pnlPercent ?? params.pnlPercent),
      thesisResult: existing.thesisResult as ThesisResult,
      lesson: existing.lesson,
      confidenceCalibration: existing.confidenceCalibration as ConfidenceCalibration,
      adaptation: existing.adaptation,
      weightShift: existing.weightShift,
      createdAt: existing.createdAt,
    };
  }

  const outcome = classifyOutcome(params.pnlPercent);
  const conviction = params.conviction ?? 70;
  const calibration = gradeConfidenceCalibration(outcome, conviction);

  const thesisResult: ThesisResult =
    outcome === "WIN" ? "CORRECT" : outcome === "LOSS" ? "INCORRECT" : "PARTIAL";

  const context = await reconstructTradeMemoryContext(tx, params.tradeId);
  const lesson = await generateLessonFromContext({
    asset: context.asset,
    side: context.side,
    decision: context.decision,
    fundamental: context.fundamental,
    technical: context.technical,
    risk: context.risk,
    marketContext: context.marketContext,
    glyphView: context.glyphView,
    reasoning: context.reasoning,
    realizedPnl: context.realizedPnl,
    realizedPnlPercent: context.realizedPnlPercent,
    outcome: context.outcome,
  });

  const { adaptation, weightShift } = synthesizeLesson(
    params.asset,
    params.side,
    outcome,
    params.pnlPercent,
    calibration,
    params.reason,
    {
      fundamental: context.fundamental,
      technical: context.technical,
      risk: context.risk,
      marketContext: context.marketContext,
      glyphView: context.glyphView,
      reasoning: context.reasoning,
    }
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
      decisionId: context.decisionId,
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
