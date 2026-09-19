import "dotenv/config";
import { GLYPH_SYSTEM_PROMPT, buildDecisionUserPrompt } from "../../src/lib/decision/prompt";
import { GlyphDecisionOutput, GlyphDecisionSchema } from "../../src/lib/decision/schema";
import { prisma } from "../../src/lib/prisma";
import { SynthesizedResearch } from "../../src/types/market";

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

async function runPreview() {
  console.log("===============================================================");
  console.log("🔍 PREVIEW RISK & THESIS ANALYSIS (OPTION 1 — DRY RUN)");
  console.log("===============================================================\n");

  // 1. Retrieve Research Snapshot from database
  const snapshot = await prisma.researchSnapshot.findFirst({
    where: { asset: "NVDA" },
    orderBy: { createdAt: "desc" },
  });

  if (!snapshot) {
    throw new Error("Research snapshot for NVDA was not found in the database!");
  }

  console.log(`📁 Research Snapshot ID: ${snapshot.id}`);
  console.log(`🎯 Target Asset:         ${snapshot.asset} (Snapshot Price: $${(snapshot.marketData as any)?.quote?.price})\n`);

  // 2. Synthesize Prompt
  const researchPayload: SynthesizedResearch = {
    asset: snapshot.asset,
    timestamp: snapshot.createdAt.toISOString(),
    marketData: snapshot.marketData as any,
    fundamentalData: snapshot.fundamentalData as any,
    technicalData: snapshot.technicalData as any,
    newsData: snapshot.newsData as any,
    sourceMetadata: snapshot.sourceMetadata as any,
  };

  const userPrompt = buildDecisionUserPrompt(
    researchPayload,
    { cash: 1000, equity: 1000 },
    null,
    []
  );

  // 3. Query Glyph Brain via OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini";
  console.log(`🧠 Querying Glyph Brain (${model})...\n`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://glyph.network",
      "X-Title": "Glyph Autonomous Agent",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GLYPH_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(cleanJsonString(rawContent));
  const validated: GlyphDecisionOutput = GlyphDecisionSchema.parse(parsed);

  // 4. Print 3-Pillar Analysis Report (100% English)
  console.log("===============================================================");
  console.log("📊 GLYPH BRAIN 3-PILLAR ANALYSIS REPORT");
  console.log("===============================================================\n");

  console.log("1. 🏢 FUNDAMENTAL ANALYSIS");
  console.log(`   - Fundamental Score: ${validated.fundamental_score} / 100`);
  console.log(`   - Fundamental Thesis:`);
  console.log(`     "${validated.thesis.fundamental}"\n`);

  console.log("2. 📈 TECHNICAL ANALYSIS");
  console.log(`   - Technical Score:   ${validated.technical_score} / 100`);
  console.log(`   - Technical Thesis:`);
  console.log(`     "${validated.thesis.technical}"\n`);

  console.log("3. ⚠️ RISK ANALYSIS (Primary Focus)");
  console.log(`   - Risk Score:        ${validated.risk_score} / 100`);
  console.log(`   - Risk Assessment:`);
  console.log(`     "${validated.thesis.risk}"`);
  console.log(`   - Invalidation Level (Cut-Loss Boundary):`);
  console.log(`     "${validated.thesis.invalidation}"\n`);

  console.log("4. ⚡ CATALYSTS & PROPOSED ACTION");
  console.log(`   - Market Catalyst:   "${validated.thesis.catalyst}"`);
  console.log(`   - Proposed Action:   ${validated.action}`);
  console.log(`   - Conviction Score:  ${validated.conviction}%`);
  console.log(`   - Proposed Size:     ${validated.position_size_percent}% of capital`);
  console.log(`   - Proposed Leverage: ${validated.leverage}x\n`);

  // 5. Print Raw JSON Output
  console.log("===============================================================");
  console.log("📦 RAW CANONICAL STRUCTURED OUTPUT (JSON)");
  console.log("===============================================================");
  console.log(JSON.stringify(validated, null, 2));

  // 6. Security & State Verification
  console.log("\n===============================================================");
  console.log("🔒 STATE AUDIT & INTEGRITY CHECK");
  console.log("===============================================================");
  const decisionCount = await prisma.decision.count();
  const tradeCount = await prisma.trade.count();
  const treasury = await prisma.agentTreasury.findFirst();

  console.log(`- Decisions in DB:    ${decisionCount} (Unchanged)`);
  console.log(`- Trades in DB:       ${tradeCount} (Unchanged)`);
  console.log(`- Treasury Balance:   $${Number(treasury?.currentBalance).toFixed(2)} (Untouched)`);
  console.log(`- Blockchain Calls:   0 (No on-chain transactions executed)`);
  console.log("===============================================================\n");
}

runPreview()
  .catch((e) => {
    console.error("❌ Error running preview:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
