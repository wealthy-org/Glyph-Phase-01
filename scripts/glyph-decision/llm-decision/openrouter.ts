// ============================================================================
// GLYPH PHASE 01 — LLM DECISION MODULE: OPENROUTER CLIENT
// scripts/glyph-decision/llm-decision/openrouter.ts
//
// Thin OpenRouter client for the LLM Decision module.
// Reuses the same env-var convention as the rest of the project:
//   OPENROUTER_API_KEY
//   OPENROUTER_MODEL
//
// Implements: call → JSON parse → Zod validate → retry (max 2x) → throw.
// System errors (HTTP failures, empty responses, parse errors, Zod failures)
// are thrown as real errors — they are NEVER silently swallowed into NO_TRADE.
// ============================================================================

import { SynthesizedResearch } from "../../../src/types/market";
import { LLM_DECISION_SYSTEM_PROMPT, buildLlmDecisionUserPrompt } from "./prompt";
import { LlmDecisionSchema } from "./schema";
import { LlmDecisionOutput } from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_RETRIES = 2;

function cleanJsonString(raw: string): string {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    } else if (cleaned.startsWith("`")) {
        cleaned = cleaned.replace(/^`(?:json)?\n?/, "").replace(/\n?`$/, "");
    }
    return cleaned.trim();
}

/**
 * Calls OpenRouter with the existing SynthesizedResearch payload and validates the structured output.
 * Retries up to MAX_RETRIES times on parse/validation failures.
 * Throws on system errors — callers must handle these distinctly from NO_TRADE.
 */
export async function callOpenRouterForDecision(
    research: SynthesizedResearch
): Promise<LlmDecisionOutput> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini";

    if (!apiKey) {
        throw new Error(
            "OPENROUTER_API_KEY is not configured. Set it in .env before running llm-decision."
        );
    }

    let lastError = "unknown error";
    const userPrompt = buildLlmDecisionUserPrompt(research);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://glyph.network",
                    "X-Title": "Glyph LLM Decision",
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.2,
                    max_tokens: 800,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: LLM_DECISION_SYSTEM_PROMPT },
                        { role: "user", content: userPrompt },
                    ],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
            }

            const json = await response.json();
            const content: string | undefined = json.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error("OpenRouter returned an empty response content.");
            }

            const cleaned = cleanJsonString(content);
            const parsed: unknown = JSON.parse(cleaned);

            const result = LlmDecisionSchema.safeParse(parsed);
            if (result.success) {
                return result.data as LlmDecisionOutput;
            }

            lastError = result.error.issues
                .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
                .join(", ");

            console.warn(`[llm-decision] Validation failed on attempt ${attempt + 1}: ${lastError}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.startsWith("OpenRouter HTTP")) {
                throw err;
            }
            lastError = message;
            console.warn(`[llm-decision] Attempt ${attempt + 1} failed: ${lastError}`);
        }
    }

    throw new Error(
        `[llm-decision] LLM call failed after ${MAX_RETRIES + 1} attempts. Last error: ${lastError}`
    );
}

