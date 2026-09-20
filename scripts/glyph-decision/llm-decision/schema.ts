// ============================================================================
// GLYPH PHASE 01 — LLM DECISION MODULE: ZOD VALIDATION SCHEMA
// scripts/glyph-decision/llm-decision/schema.ts
//
// Validates raw LLM JSON output before it is accepted as a decision.
// Uses Zod — existing project dependency (zod ^4.6.5).
//
// Deliberately SEPARATE from src/lib/decision/schema.ts which validates the
// full execution-engine output (OPEN_LONG/OPEN_SHORT/HOLD/CLOSE).
// This schema validates the lighter, direction-only output (LONG/SHORT/NO_TRADE).
// ============================================================================

import { z } from "zod";
import { LlmDecisionOutput } from "./types";

export const LlmThesisSchema = z.object({
    fundamental: z.string().min(10, "Fundamental thesis must be descriptive"),
    technical: z.string().min(10, "Technical thesis must be descriptive"),
    risk: z.string().min(10, "Risk assessment must be descriptive"),
    invalidation: z.string().min(10, "Invalidation condition required"),
});

export const LlmDecisionSchema = z.object({
    asset: z.string().min(1).transform((v) => v.trim().toUpperCase()),
    action: z.enum(["LONG", "SHORT", "NO_TRADE"]),
    conviction: z.number().int().min(0).max(100),
    thesis: LlmThesisSchema,
});

export type LlmDecisionZod = z.infer<typeof LlmDecisionSchema>;

/**
 * Validates raw parsed JSON from the LLM.
 * Returns a strongly-typed LlmDecisionOutput on success, throws on failure.
 */
export function validateLlmOutput(parsed: unknown): LlmDecisionOutput {
    return LlmDecisionSchema.parse(parsed) as LlmDecisionOutput;
}

