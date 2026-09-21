// ============================================================================
// GLYPH PHASE 01 — LLM DECISION MODULE: TYPES
// scripts/glyph-decision/llm-decision/types.ts
//
// Types specific to the LLM Decision layer.
// Uses existing SynthesizedResearch from src/types/market for all analysis
// inputs — no duplication.
// ============================================================================

import { SynthesizedResearch } from "../../../src/types/market";

/**
 * The 3 valid actions the LLM Decision layer can emit.
 * Intentionally simpler than the full DecisionAction enum used by the
 * execution engine — this layer ONLY proposes direction, it does NOT execute.
 */
export type LlmAction = "LONG" | "SHORT" | "HOLD" | "CLOSE" | "NO_TRADE";

/**
 * The thesis breakdown required by the LLM Decision prompt (task §10).
 */
export interface LlmThesis {
    fundamental: string;
    technical: string;
    risk: string;
    invalidation: string;
}

/**
 * The validated, structured output from the LLM for a single asset.
 * Produced after Zod validation passes — guaranteed safe to consume.
 */
export interface LlmDecisionOutput {
    asset: string;
    action: LlmAction;
    conviction: number;
    thesis: LlmThesis;
}

/**
 * The context fed to the LLM for a single asset.
 * Wraps the decision derived from a persisted ResearchSnapshot — no re-analysis is performed here.
 */
export interface LlmDecisionContext {
    asset: string;
    research: SynthesizedResearch;
}

/**
 * Per-asset result returned by runLlmDecision().
 * Distinguishes successful decisions from system errors.
 */
export type LlmAssetResult =
    | { ok: true; asset: string; decision: LlmDecisionOutput }
    | { ok: false; asset: string; error: string };

/**
 * Final aggregate output for all allowedAssets (task §12 shape).
 */
export interface LlmDecisionBatchResult {
    allowedAssets: string[];
    decisions: LlmDecisionOutput[];
    errors: Array<{ asset: string; error: string }>;
}

