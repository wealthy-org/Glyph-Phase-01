// ============================================================================
// GLYPH PHASE 01 — PROMPT DEFINITIONS & VERSIONING
// Derived from: BRIEF.md (§7, §26, §3.0D)
// Prompt version is a code constant, NOT an environment variable (§3.0D).
// ============================================================================

import { SynthesizedResearch } from "@/types/market";

/**
 * Prompt versioning constant (§26, §3.0D).
 * Bumping this version leaves a clear git trail. Historical trades retain their prompt version.
 */
export const GLYPH_DECISION_PROMPT_VERSION = "V1";

export const GLYPH_SYSTEM_PROMPT = `You are Glyph, an autonomous digital economic being (Economic Being #001) operating on Ethereum testnet.
Your purpose: "Grow economic capital while preserving survival."
You possess an onchain identity, a dedicated smart wallet, persistent memory, and a simulated treasury.

You are analyzing market data to make a structured economic decision.
Your decision will be deterministically validated by an independent Policy Engine before execution.
You must be objective, risk-conscious, and data-driven.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid, raw JSON object matching the exact schema below.
2. Do NOT include markdown code fences (e.g. \`\`\`json), greetings, or explanations outside the JSON.
3. Every score is an integer between 0 and 100.
4. "action" must be strictly one of: "LONG", "SHORT", "NO_TRADE".
5. If conviction is below 60, action should typically be "NO_TRADE".
6. "thesis" must contain detailed fundamental, technical, catalyst, risk, and invalidation points.
7. Propose realistic "position_size_percent" (default 5-10%) and "leverage" (1-2x).`;

export function buildDecisionUserPrompt(
  research: SynthesizedResearch,
  treasuryState?: { cash: number; equity: number },
  recentMemories?: Array<{
    asset?: string;
    outcome: string;
    pnlPercent: number;
    lesson: string;
    confidenceCalibration: string;
    weightShift?: string | null;
  }>
): string {
  const cash = treasuryState?.cash ?? 1000;
  const equity = treasuryState?.equity ?? 1000;

  let memoriesBlock = "";
  if (recentMemories && recentMemories.length > 0) {
    memoriesBlock = `\nPersistent Memory & Historical Reflection for ${research.asset} (Past Lessons):
${recentMemories
  .map(
    (m, i) =>
      `  ${i + 1}. [${m.asset ? `${m.asset} ` : ""}Outcome: ${m.outcome} (${m.pnlPercent > 0 ? "+" : ""}${m.pnlPercent.toFixed(
        2
      )}%)]: "${m.lesson}" | Calibration: ${m.confidenceCalibration}${
        m.weightShift ? ` | Weight Shift: ${m.weightShift}` : ""
      }`
  )
  .join("\n")}
Important: Incorporate these past lessons for ${research.asset} to calibrate your conviction, risk score, and thesis invalidation.\n`;
  }

  return `Current Agent Economic State:
- Treasury Cash: $${cash.toFixed(2)}
- Total Portfolio Equity: $${equity.toFixed(2)}
${memoriesBlock}
Comprehensive Market Research Snapshot for ${research.asset}:
- Current Market Price: $${research.marketData.quote.price} (${research.marketData.quote.changePercent}%)
- 24h Volume: ${research.marketData.quote.volume.toLocaleString()}

Technical Analysis Layer:
- Trend: ${research.technicalData.trend}
- SMA 20: $${research.technicalData.sma20} | SMA 50: $${research.technicalData.sma50}
- RSI (14): ${research.technicalData.rsi14}
- Support Level: $${research.technicalData.supportLevel}
- Resistance Level: $${research.technicalData.resistanceLevel}
- Volatility: ${research.technicalData.volatilityPercent}%
- Volume Ratio vs 20d: ${research.technicalData.volumeRatio}x
- Calculated Technical Score: ${research.technicalData.technicalScore}/100

Fundamental Analysis Layer:
- Market Cap: $${research.fundamentalData.marketCap.toLocaleString()}
- P/E Ratio: ${research.fundamentalData.peRatio}
- Revenue Growth (YoY): +${research.fundamentalData.revenueGrowthPercent}%
- Profit Margin: ${research.fundamentalData.profitMarginPercent}%
- EPS: $${research.fundamentalData.earningsPerShare}
- Sector: ${research.fundamentalData.sector}
- News Sentiment: ${research.fundamentalData.sentimentVerdict} (score: ${research.fundamentalData.sentimentAverage})
- Top Headlines:
${research.fundamentalData.keyHeadlines.map((h, i) => `  ${i + 1}. ${h}`).join("\n")}
- Calculated Fundamental Score: ${research.fundamentalData.fundamentalScore}/100

Format your output strictly as:
{
  "asset": "${research.asset}",
  "action": "LONG" | "SHORT" | "NO_TRADE",
  "conviction": 74,
  "time_horizon": "1d_to_14d",
  "fundamental_score": 78,
  "technical_score": 84,
  "risk_score": 61,
  "thesis": {
    "fundamental": "...",
    "technical": "...",
    "catalyst": "...",
    "risk": "...",
    "invalidation": "..."
  },
  "position_size_percent": 5,
  "leverage": 2
}`;
}
