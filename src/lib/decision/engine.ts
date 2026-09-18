// ============================================================================
// GLYPH PHASE 01 — DECISION ENGINE (GLYPH BRAIN)
// Derived from: BRIEF.md (§7, §9, §10, §25, §26, §3.0B, §3.0C, §3.4)
// Coordinates OpenRouter LLM reasoning, Zod validation, retry/fallback,
// and Policy Engine execution.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { GlyphDecisionSchema, GlyphDecisionOutput } from "./schema";
import {
  GLYPH_DECISION_PROMPT_VERSION,
  GLYPH_SYSTEM_PROMPT,
  buildDecisionUserPrompt,
} from "./prompt";
import { evaluateAgentTradeProposal } from "@/lib/policy";
import { openSimulatedPosition } from "@/lib/portfolio";
import { getTreasurySummary } from "@/lib/treasury";
import { commitDecisionOnchain } from "@/lib/onchain/registry";
import { getRecentMemories } from "@/lib/memory";
import { SynthesizedResearch } from "@/types/market";

export interface DecisionRunResult {
  decisionId: string;
  asset: string;
  action: "LONG" | "SHORT" | "NO_TRADE";
  conviction: number;
  policyResult: "APPROVED" | "REJECTED";
  policyRejectReason: string | null;
  tradeId: string | null;
  tradeNumber?: string;
  runId: string;
  decision: GlyphDecisionOutput;
  decisionHash?: string;
  transactionHash?: string;
  explorerUrl?: string;
}

/**
 * Strips markdown code blocks if the LLM wrapped its JSON response in fences.
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

/**
 * Creates safe fallback NO_TRADE decision when retries are exhausted (§3.4).
 */
function createFallbackDecision(asset: string, reason: string): GlyphDecisionOutput {
  return {
    asset: asset.toUpperCase(),
    action: "NO_TRADE",
    conviction: 30,
    time_horizon: "1d_to_14d",
    fundamental_score: 50,
    technical_score: 50,
    risk_score: 80,
    thesis: {
      fundamental: "Data ambiguity or LLM structured parse limits prevented high conviction.",
      technical: "Market signals did not meet the strict threshold for entry.",
      catalyst: "Awaiting next clear catalyst confirmation.",
      risk: `Fallback triggered: ${reason}`,
      invalidation: "Decision fallback executed; no capital risked.",
    },
    position_size_percent: 0,
    leverage: 1,
  };
}

/**
 * Calls OpenRouter API with up to 2 retries on malformed or schema-invalid output.
 */
async function callLlmWithRetry(
  systemPrompt: string,
  userPrompt: string,
  asset: string
): Promise<{ decision: GlyphDecisionOutput; rawOutput: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey) {
    console.warn("[DecisionEngine] OPENROUTER_API_KEY missing, using fallback NO_TRADE.");
    return {
      decision: createFallbackDecision(asset, "OPENROUTER_API_KEY not configured"),
      rawOutput: "{}",
    };
  }

  const maxRetries = 2; // BRIEF §3.4: "gagal validasi → retry maksimal 2x → fallback NO_TRADE"
  let lastError = "";
  let lastRaw = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2, // Low temperature for deterministic structured output
          max_tokens: 1500, // Explicit token ceiling to prevent 402 credit errors
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      lastRaw = content || "";

      if (!content) {
        throw new Error("Empty response content from OpenRouter");
      }

      const cleaned = cleanJsonString(content);
      const parsed = JSON.parse(cleaned);

      // Validate strictly with Zod schema (§3.4)
      const parseResult = GlyphDecisionSchema.safeParse(parsed);
      if (parseResult.success) {
        return { decision: parseResult.data, rawOutput: content };
      } else {
        lastError = parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        console.warn(`[DecisionEngine] Schema validation failed on attempt ${attempt + 1}: ${lastError}`);
      }
    } catch (err: any) {
      lastError = err.message || String(err);
      console.warn(`[DecisionEngine] Attempt ${attempt + 1} error: ${lastError}`);
    }
  }

  // Exhausted retries -> safe fallback
  console.warn(`[DecisionEngine] Retries exhausted. Falling back to NO_TRADE. Reason: ${lastError}`);
  return {
    decision: createFallbackDecision(asset, `Retries exhausted (${lastError})`),
    rawOutput: lastRaw,
  };
}

/**
 * Main Glyph Brain Reasoning Pipeline.
 * 1. Takes research snapshot
 * 2. Consults LLM (Glyph Brain) with prompt V1
 * 3. Validates Zod schema
 * 4. Runs deterministic Policy Engine
 * 5. Saves Decision record
 * 6. Creates Trade record ONLY if APPROVED and NOT NO_TRADE (§3.0B)
 * 7. Records Observability Run
 */
export async function executeGlyphDecisionCycle(
  researchSnapshotId: string,
  agentIdentifier = "1"
): Promise<DecisionRunResult> {
  const runStart = new Date();

  // 1. Fetch Agent and Research Snapshot
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: { treasury: true },
  });

  if (!agent) {
    throw new Error(`Agent with agentId ${agentIdentifier} not found.`);
  }

  const snapshot = await prisma.researchSnapshot.findUnique({
    where: { id: researchSnapshotId },
  });

  if (!snapshot) {
    throw new Error(`Research snapshot ${researchSnapshotId} not found.`);
  }

  // 2. Synthesize prompt context
  const treasurySummary = await getTreasurySummary(agentIdentifier);
  const researchPayload: SynthesizedResearch = {
    asset: snapshot.asset,
    timestamp: snapshot.createdAt.toISOString(),
    marketData: snapshot.marketData as any,
    fundamentalData: snapshot.fundamentalData as any,
    technicalData: snapshot.technicalData as any,
    newsData: snapshot.newsData as any,
    sourceMetadata: snapshot.sourceMetadata as any,
  };

  // Fetch recent memories strictly for this asset to avoid cross-asset bias
  const recentMemories = await getRecentMemories(agentIdentifier, 3, snapshot.asset);
  const userPrompt = buildDecisionUserPrompt(
    researchPayload,
    {
      cash: treasurySummary.currentBalance,
      equity: treasurySummary.totalEquity,
    },
    recentMemories
  );

  // 3. Call LLM with Zod validation & retry (§3.4)
  const { decision, rawOutput } = await callLlmWithRetry(
    GLYPH_SYSTEM_PROMPT,
    userPrompt,
    snapshot.asset
  );

  // 4. Validate through Policy Engine (§10, §3.0C)
  const policyResult = await evaluateAgentTradeProposal(agentIdentifier, {
    asset: decision.asset,
    action: decision.action,
    conviction: decision.conviction,
    positionSizePercent: decision.position_size_percent,
    leverage: decision.leverage,
  });

  // 5. Store Decision record in database (§3.0B)
  const decisionRecord = await prisma.decision.create({
    data: {
      agentId: agent.id,
      asset: decision.asset,
      action: decision.action,
      conviction: decision.conviction,
      timeHorizon: decision.time_horizon,
      fundamentalScore: decision.fundamental_score,
      technicalScore: decision.technical_score,
      riskScore: decision.risk_score,
      positionSizePercent: policyResult.clampedPositionPercent,
      leverage: policyResult.clampedLeverage,
      thesis: decision.thesis as any,
      policyResult: policyResult.policyResult,
      policyRejectReason: policyResult.rejectReason,
      researchSnapshotId: snapshot.id,
      promptVersion: GLYPH_DECISION_PROMPT_VERSION,
    },
  });

  let tradeId: string | null = null;
  let tradeNumber: string | undefined;

  // 6. Trade Creation Gate (Brief §3.0B & §83 TODO):
  // "Trade baru dibuat di tabel trades HANYA JIKA policy_result = 'APPROVED' dan action != 'NO_TRADE'"
  if (policyResult.approved && decision.action !== "NO_TRADE") {
    const entryPrice = researchPayload.marketData.quote.price;

    const openResult = await openSimulatedPosition({
      agentId: agent.agentId,
      asset: decision.asset,
      side: decision.action,
      entryPrice,
      proposedPositionPercent: policyResult.clampedPositionPercent,
      proposedLeverage: policyResult.clampedLeverage,
      decisionId: decisionRecord.id,
      scores: {
        conviction: decision.conviction,
        fundamentalScore: decision.fundamental_score,
        technicalScore: decision.technical_score,
        riskScore: decision.risk_score,
        thesis: decision.thesis as any,
      },
    });

    tradeId = openResult.trade.id;
    tradeNumber = openResult.trade.tradeNumber;

    // Link decision to created trade
    await prisma.decision.update({
      where: { id: decisionRecord.id },
      data: { tradeId },
    });
  }

  // 7. Commit Decision Hash Onchain (Brief §12, §3.5)
  let onchainResult = null;
  try {
    onchainResult = await commitDecisionOnchain(decisionRecord.id);
  } catch (err) {
    console.warn(`[DecisionEngine] Onchain commit warning:`, err);
  }

  // 8. Record Economic Event for Life Log & User Observability (§19)
  try {
    const now = new Date();
    const eventUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const birthDate = new Date(agent.createdAt);
    const birthUtc = Date.UTC(
      birthDate.getUTCFullYear(),
      birthDate.getUTCMonth(),
      birthDate.getUTCDate()
    );
    const day = Math.max(1, Math.floor((eventUtc - birthUtc) / (24 * 60 * 60 * 1000)) + 1);

    const eventDesc = policyResult.approved
      ? `Policy APPROVED. Position: ${policyResult.clampedPositionPercent}%, Leverage: ${policyResult.clampedLeverage}x. Thesis: ${decision.thesis.catalyst}`
      : `Policy REJECTED: ${policyResult.rejectReason}. Thesis: ${decision.thesis.catalyst}`;

    await prisma.economicEvent.create({
      data: {
        agentId: agent.id,
        eventType: "DECISION_MADE",
        title: `Evaluated ${decision.asset} — Proposed ${decision.action} (${decision.conviction}%)`,
        description: eventDesc,
        day,
        result: policyResult.policyResult,
        decisionId: decisionRecord.id,
        tradeId,
        txHash: onchainResult?.transactionHash,
      },
    });
  } catch (evtErr) {
    console.warn("[DecisionEngine] Failed to record DECISION_MADE economic event:", evtErr);
  }

  // 9. Observability Trace (Brief §25, §3.7)
  const agentRun = await prisma.agentRun.create({
    data: {
      agentId: agent.id,
      startedAt: runStart,
      completedAt: new Date(),
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      promptVersion: GLYPH_DECISION_PROMPT_VERSION,
      marketSnapshot: snapshot.marketData as any,
      decision: decision as any,
      policyResult: policyResult.policyResult,
      tradeId,
      transactionHash: onchainResult?.transactionHash,
    },
  });

  return {
    decisionId: decisionRecord.id,
    asset: decision.asset,
    action: decision.action,
    conviction: decision.conviction,
    policyResult: policyResult.policyResult,
    policyRejectReason: policyResult.rejectReason,
    tradeId,
    tradeNumber,
    runId: agentRun.id,
    decision,
    decisionHash: onchainResult?.decisionHash,
    transactionHash: onchainResult?.transactionHash,
    explorerUrl: onchainResult?.explorerUrl,
  };
}
