// ============================================================================
// GLYPH PHASE 01 — LLM DECISION MODULE: PROMPT BUILDER
// scripts/glyph-decision/llm-decision/prompt.ts
//
// Builds the system + user prompts for the LLM Decision analyst.
// Consumes the SynthesizedResearch output from existing analysis pipeline —
// no re-analysis is done here.
// ============================================================================

import { SynthesizedResearch } from "../../../src/types/market";

/**
 * System prompt that instructs the LLM to act as Glyph Decision Analyst.
 * The LLM synthesizes existing analysis into a directional proposal.
 */
export const LLM_DECISION_SYSTEM_PROMPT = `You are Glyph Decision Analyst, an AI synthesis engine for Glyph Phase 01.

Your ONLY role: read pre-computed analysis data and synthesize it into a single directional trading proposal.

You do NOT:
- Execute trades
- Calculate position size or leverage
- Allocate treasury capital
- Create paper trades or open positions
- Call wallets, smart contracts, or blockchains
- Override risk policy
- Perform market research or fetch market data

You DO:
- Synthesize the provided Fundamental, Technical, and Risk analysis
- Propose ONE direction: LONG, SHORT, or NO_TRADE
- Score your conviction from 0 to 100
- Explain your reasoning across fundamental, technical, risk, and invalidation pillars

CRITICAL OUTPUT RULES:
1. Return ONLY a valid, raw JSON object. No markdown fences, no preamble.
2. "action" must be exactly one of: "LONG", "SHORT", "NO_TRADE"
3. "conviction" must be an integer 0-100
4. Every thesis field must be a meaningful string (minimum 10 characters)
5. If data is ambiguous or risk is high, choose NO_TRADE — that is a valid analytical conclusion
6. System errors (e.g. missing data) should not be disguised as NO_TRADE

Schema to follow exactly:
{
  "asset": "<TICKER>",
  "action": "LONG" | "SHORT" | "NO_TRADE",
  "conviction": <integer 0-100>,
  "thesis": {
    "fundamental": "<why fundamentals support or oppose this direction>",
    "technical": "<why technicals support or oppose this direction>",
    "risk": "<key risk factors and the current risk level>",
    "invalidation": "<what price action or event would invalidate this thesis>"
  }
}`;

/**
 * Builds the user-facing portion of the LLM prompt from a SynthesizedResearch result.
 * Uses the EXACT output persisted in ResearchSnapshot — no data is fabricated.
 */
export function buildLlmDecisionUserPrompt(research: SynthesizedResearch): string {
  const { asset, marketData, fundamentalData, technicalData, riskContext, newsData, sourceMetadata } = research;
  const { quote } = marketData;
  const tech = technicalData;
  const fund = fundamentalData;
  const risk = riskContext;

  const topHeadlines = (newsData ?? [])
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title}`)
    .join("\n") || "  No headlines available.";

  return `=== GLYPH DECISION ANALYSIS REQUEST ===
Asset: ${asset}
Timestamp: ${research.timestamp}
Data Provider: ${sourceMetadata.provider}

--- MARKET DATA ---
Current Price : $${quote.price.toFixed(2)}
Change        : ${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)
Volume        : ${quote.volume.toLocaleString()}
Day Range     : $${quote.low.toFixed(2)} – $${quote.high.toFixed(2)}

--- TECHNICAL ANALYSIS (pre-computed) ---
Trend         : ${tech.trend}
SMA 20        : $${tech.sma20.toFixed(2)}
SMA 50        : $${tech.sma50.toFixed(2)}
RSI (14)      : ${tech.rsi14.toFixed(2)}
Support       : $${tech.supportLevel.toFixed(2)}
Resistance    : $${tech.resistanceLevel.toFixed(2)}
Volatility    : ${tech.volatilityPercent.toFixed(2)}%
Volume Ratio  : ${tech.volumeRatio.toFixed(2)}x (vs 20-day avg)
Tech Score    : ${tech.technicalScore}/100

--- FUNDAMENTAL ANALYSIS (pre-computed) ---
Market Cap    : ${fund.marketCap ? `$${fund.marketCap.toLocaleString()}` : "N/A"}
P/E Ratio     : ${fund.peRatio != null ? fund.peRatio.toFixed(2) : "N/A"}
Revenue Growth: ${fund.revenueGrowthPercent.toFixed(2)}%
Profit Margin : ${fund.profitMarginPercent.toFixed(2)}%
EPS           : ${fund.earningsPerShare != null ? fund.earningsPerShare.toFixed(2) : "N/A"}
Sector        : ${fund.sector}
News Sentiment: ${fund.sentimentVerdict} (avg score: ${fund.sentimentAverage.toFixed(3)})
Fund Score    : ${fund.fundamentalScore}/100
Top Headlines :
${topHeadlines}

--- RISK ANALYSIS (pre-computed) ---
Market Regime : ${risk?.regime ?? "uncertain"}
Risk Level    : ${risk?.level ?? "moderate"}
Risk Details  : ${risk?.details ?? "No additional risk context."}

=== YOUR TASK ===
Based ONLY on the pre-computed analysis above, provide your synthesis decision.
Do NOT re-compute any metrics. Use the scores and signals provided.
Return ONLY the JSON object specified in the system prompt.`;
}

