// ============================================================================
// GLYPH PHASE 01 — STRUCTURED DECISION VALIDATION SCHEMA
// Derived from: BRIEF.md (§7, §3.4)
// Strict Zod schema validating LLM output before entering policy engine.
// ============================================================================

import { z } from "zod";

export const ThesisSchema = z.object({
  fundamental: z.string().min(10, "Fundamental thesis must be descriptive"),
  technical: z.string().min(10, "Technical thesis must be descriptive"),
  catalyst: z.string().min(5, "Catalyst statement required"),
  risk: z.string().min(10, "Risk breakdown required"),
  invalidation: z.string().min(10, "Invalidation level / condition required"),
});

export const GlyphDecisionSchema = z.object({
  asset: z.string().toUpperCase(),
  action: z.enum(["OPEN_LONG", "OPEN_SHORT", "HOLD", "CLOSE", "NO_TRADE"]),
  conviction: z.number().int().min(0).max(100),
  time_horizon: z.string().default("1d_to_14d"),
  fundamental_score: z.number().int().min(0).max(100),
  technical_score: z.number().int().min(0).max(100),
  risk_score: z.number().int().min(0).max(100),
  thesis: ThesisSchema,
  position_size_percent: z.number().min(0).max(100).default(5),
  leverage: z.number().min(1).max(10).default(1),
});

export type GlyphDecisionOutput = z.infer<typeof GlyphDecisionSchema>;
export type GlyphThesis = z.infer<typeof ThesisSchema>;
