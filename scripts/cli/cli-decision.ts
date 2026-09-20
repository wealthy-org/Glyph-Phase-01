#!/usr/bin/env node
import "dotenv/config";
import { stdin as input, stdout as output } from "process";
import * as readline from "readline/promises";

import {
  GLYPH_DECISION_PROMPT_VERSION,
  GLYPH_SYSTEM_PROMPT,
  buildDecisionUserPrompt,
} from "../../src/lib/decision/prompt";
import { GlyphDecisionOutput, GlyphDecisionSchema } from "../../src/lib/decision/schema";
import { TwelveDataProvider } from "../../src/lib/market/twelve-data";
import { getRecentMemories } from "../../src/lib/memory";
import { commitDecisionOnchain } from "../../src/lib/onchain/registry";
import { evaluateAgentTradeProposal } from "../../src/lib/policy";
import { closeSimulatedPosition, openSimulatedPosition } from "../../src/lib/portfolio";
import { prisma } from "../../src/lib/prisma";
import { createResearchSnapshot } from "../../src/lib/research";
import { getTreasurySummary } from "../../src/lib/treasury";
import { SynthesizedResearch } from "../../src/types/market";

// ============================================================================
// GLYPH PHASE 01 — INTERACTIVE & FLEXIBLE DECISION CLI TOOL
// Usage:
//   npm run cli:decision
//   npm run cli:decision -- --asset NVDA --action OPEN_LONG --dry-run
//   npm run cli:decision -- --help
// ============================================================================

interface CliOptions {
  asset?: string;
  action?: "OPEN_LONG" | "OPEN_SHORT" | "HOLD" | "CLOSE" | "NO_TRADE";
  size?: number;
  leverage?: number;
  conviction?: number;
  thesis?: string;
  dryRun?: boolean;
  force?: boolean;
  noTrade?: boolean;
  nonInteractive?: boolean;
  help?: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--asset" || arg === "-a") {
      opts.asset = args[++i]?.toUpperCase();
    } else if (arg === "--action") {
      opts.action = args[++i]?.toUpperCase() as any;
    } else if (arg === "--size" || arg === "-s") {
      opts.size = parseFloat(args[++i]);
    } else if (arg === "--leverage" || arg === "-l") {
      opts.leverage = parseFloat(args[++i]);
    } else if (arg === "--conviction" || arg === "-c") {
      opts.conviction = parseInt(args[++i], 10);
    } else if (arg === "--thesis" || arg === "-t") {
      opts.thesis = args[++i];
    } else if (arg === "--dry-run" || arg === "-d") {
      opts.dryRun = true;
    } else if (arg === "--force" || arg === "-f") {
      opts.force = true;
    } else if (arg === "--no-trade") {
      opts.noTrade = true;
    } else if (arg === "--non-interactive" || arg === "-y") {
      opts.nonInteractive = true;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
===============================================================================
🤖 GLYPH INTERACTIVE DECISION CLI — PANDUAN PENGGUNAAN
===============================================================================

CARA MENJALANKAN:
  npm run cli:decision                # Jalankan mode interaktif dengan opsi bebas
  npm run cli:decision -- [options]   # Jalankan dengan parameter langsung

CONTOH:
  # Mode interaktif ramah:
  npm run cli:decision

  # Langsung analisis aset dengan AI (Bebas) dalam mode Dry Run:
  npm run cli:decision -- --asset NVDA --force --dry-run

  # Manual override sebagian:
  npm run cli:decision -- --asset TSLA --action OPEN_LONG --size 5 --leverage 2 --force

FLAGS & OPTIONS:
  -a, --asset <TICKER>     Pilihan aset: NVDA, TSLA, AAPL, MSFT (Default: Bebas)
      --action <ACTION>    OPEN_LONG, OPEN_SHORT, HOLD, NO_TRADE, CLOSE (Default: Bebas)
  -s, --size <PERCENT>     Alokasi modal 1-10% (Default: Bebas / Brain recommendation)
  -l, --leverage <LEV>     Leverage 1x atau 2x (Default: Bebas / Brain recommendation)
  -c, --conviction <NUM>   Nilai keyakinan 0-100 (Default: Bebas)
  -t, --thesis <TEXT>      Catatan thesis manual (Default: Bebas / Auto-generated)
  -d, --dry-run            Simulasi di terminal tanpa menyimpan ke DB / on-chain
  -f, --force              Bypass jam bursa jika pasar AS sedang tutup
      --no-trade           Hanya catat decision tanpa membuka posisi trade
  -y, --non-interactive    Lewati semua pertanyaan interaktif
  -h, --help               Tampilkan panduan ini
===============================================================================
`);
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

async function queryGlyphBrain(
  research: SynthesizedResearch,
  treasury: { cash: number; equity: number },
  agentId: string,
  agentPrismaId: string
): Promise<GlyphDecisionOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini";

  const recentMemories = await getRecentMemories(agentId, 3, research.asset);
  const currentPosition = await prisma.position.findFirst({
    where: { agentId: agentPrismaId, asset: research.asset, isOpen: true },
    include: { trade: true },
    orderBy: { openedAt: "desc" },
  });
  const previousDecisions = await prisma.decision.findMany({
    where: { agentId: agentPrismaId, asset: research.asset },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const recentEvents = await prisma.economicEvent.findMany({
    where: { agentId: agentPrismaId },
    orderBy: { timestamp: "desc" },
    take: 5,
  });

  const userPrompt = buildDecisionUserPrompt(
    research,
    treasury,
    currentPosition
      ? {
        asset: currentPosition.asset,
        side: currentPosition.side,
        entryPrice: Number(currentPosition.entryPrice),
        currentPrice: Number(currentPosition.currentPrice),
        unrealizedPnl: Number(currentPosition.unrealizedPnl),
        unrealizedPnlPercent: Number(currentPosition.unrealizedPnlPercent),
        openedAt: currentPosition.openedAt.toISOString(),
      }
      : null,
    previousDecisions.map((prev) => ({
      action: prev.action,
      policyResult: prev.policyResult,
      conviction: prev.conviction,
      thesis: JSON.stringify(prev.thesis),
      createdAt: prev.createdAt.toISOString(),
    })),
    recentEvents.map((evt) => ({
      eventType: evt.eventType,
      title: evt.title,
      result: evt.result,
      timestamp: evt.timestamp.toISOString(),
    })),
    recentMemories
  );

  if (!apiKey) {
    console.warn("⚠️ OPENROUTER_API_KEY tidak terdeteksi, menggunakan fallback decision default.");
    return {
      asset: research.asset,
      action: "NO_TRADE",
      conviction: 50,
      time_horizon: "1d_to_14d",
      fundamental_score: 60,
      technical_score: 60,
      risk_score: 50,
      thesis: {
        fundamental: "Data fundamental stabil dengan kapitalisasi pasar memadai.",
        technical: "Sinyal teknikal konsolidasi di area rata-rata pergerakan harga.",
        catalyst: "Menunggu katalis volume konfirmasi tren berikutnya.",
        risk: "Volatilitas jangka pendek pasar saham global.",
        invalidation: "Penembusan level support utama membatalkan setup saat ini.",
      },
      position_size_percent: 5,
      leverage: 1,
    };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://glyph.network",
      "X-Title": "Glyph Decision CLI",
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
    throw new Error(`OpenRouter Error (${response.status}): ${await response.text()}`);
  }

  const json = await response.json();
  const rawText = json.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(cleanJsonString(rawText));
  return GlyphDecisionSchema.parse(parsed);
}

async function main() {
  const opts = parseCliArgs();

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  console.log("\n===============================================================");
  console.log("⚡ GLYPH AUTONOMOUS DECISION INTERACTIVE CLI");
  console.log("===============================================================\n");

  const agentIdentifier = process.env.GLYPH_AGENT_ID || "1";
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: { treasury: true },
  });

  if (!agent) {
    console.error(`❌ Agent #${agentIdentifier} tidak ditemukan di database. Jalankan 'npm run seed:genesis' terlebih dahulu.`);
    process.exit(1);
  }

  const treasurySummary = await getTreasurySummary(agentIdentifier);
  console.log(`👤 Agent Active:     #${agentIdentifier} (${agent.name})`);
  console.log(`💵 Treasury Cash:    $${treasurySummary.currentBalance.toFixed(2)} USD-SIM`);
  console.log(`📈 Total Equity:     $${treasurySummary.totalEquity.toFixed(2)} USD-SIM\n`);

  // Check market hours
  const marketProvider = new TwelveDataProvider();
  const marketStatus = await marketProvider.getMarketStatus("United States");
  let bypassMarketHours = Boolean(opts.force);

  const isInteractive = !opts.nonInteractive && process.stdin.isTTY;
  const rl = isInteractive ? readline.createInterface({ input, output }) : null;

  let selectedAsset = opts.asset;
  let selectedAction = opts.action;
  let selectedSize = opts.size;
  let selectedLeverage = opts.leverage;
  let selectedThesis = opts.thesis;
  let isDryRun = opts.dryRun;

  try {
    // -------------------------------------------------------------------------
    // QUESTION 1: ASSET
    // -------------------------------------------------------------------------
    if (!selectedAsset && rl) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [1/6] PILIH TARGET ASET (STOCK)                             │");
      console.log("│  [0] Bebas / Biarkan Glyph Brain Memilih (Otomatis)        │");
      console.log("│  [1] NVDA (Nvidia Corp)                                     │");
      console.log("│  [2] TSLA (Tesla Inc)                                       │");
      console.log("│  [3] AAPL (Apple Inc)                                       │");
      console.log("│  [4] MSFT (Microsoft Corp)                                  │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Pilihan Anda [0-4] (Default: 0): ")).trim();

      if (ans === "1") selectedAsset = "NVDA";
      else if (ans === "2") selectedAsset = "TSLA";
      else if (ans === "3") selectedAsset = "AAPL";
      else if (ans === "4") selectedAsset = "MSFT";
      else selectedAsset = undefined; // 0 or empty means Bebas
    }

    console.log(`🎯 Target Aset Terpilih: ${selectedAsset ? selectedAsset : "BEBAS (Glyph Brain menargetkan NVDA)"}\n`);

    // -------------------------------------------------------------------------
    // QUESTION 2: ACTION
    // -------------------------------------------------------------------------
    if (!selectedAction && rl) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [2/6] PILIH TINDAKAN (ACTION)                               │");
      console.log("│  [0] Bebas / Biarkan Glyph Brain Memutuskan (Berdasarkan riset)│");
      console.log("│  [1] OPEN_LONG   (Beli / Buka posisi Long)                  │");
      console.log("│  [2] OPEN_SHORT  (Jual / Buka posisi Short)                 │");
      console.log("│  [3] HOLD        (Tahan posisi saat ini)                    │");
      console.log("│  [4] NO_TRADE    (Tidak ada perdagangan)                    │");
      console.log("│  [5] CLOSE       (Tutup posisi aktif)                       │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Pilihan Anda [0-5] (Default: 0): ")).trim();

      if (ans === "1") selectedAction = "OPEN_LONG";
      else if (ans === "2") selectedAction = "OPEN_SHORT";
      else if (ans === "3") selectedAction = "HOLD";
      else if (ans === "4") selectedAction = "NO_TRADE";
      else if (ans === "5") selectedAction = "CLOSE";
      else selectedAction = undefined; // Bebas
    }
    console.log(`⚡ Action: ${selectedAction || "BEBAS (Dianalisis oleh Glyph Brain)"}\n`);

    // -------------------------------------------------------------------------
    // QUESTION 3: POSITION SIZE
    // -------------------------------------------------------------------------
    if (selectedSize === undefined && rl && (selectedAction === "OPEN_LONG" || selectedAction === "OPEN_SHORT" || !selectedAction)) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [3/6] ALOKASI MODAL (% DARI TREASURY, MAX 10%)              │");
      console.log("│  Ketik angka 1-10, atau tekan Enter / 0 untuk [Bebas]       │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Alokasi modal % [0 untuk Bebas] (Default: 0): ")).trim();
      const parsedNum = parseFloat(ans);
      if (!isNaN(parsedNum) && parsedNum > 0) {
        selectedSize = parsedNum;
      }
    }
    console.log(`📊 Ukuran Posisi: ${selectedSize ? selectedSize + "%" : "BEBAS (Rekomendasi Glyph Brain)"}\n`);

    // -------------------------------------------------------------------------
    // QUESTION 4: LEVERAGE
    // -------------------------------------------------------------------------
    if (selectedLeverage === undefined && rl && (selectedAction === "OPEN_LONG" || selectedAction === "OPEN_SHORT" || !selectedAction)) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [4/6] PILIH LEVERAGE                                        │");
      console.log("│  [0] Bebas / Rekomendasi Glyph Brain                        │");
      console.log("│  [1] 1x (Tanpa leverage)                                    │");
      console.log("│  [2] 2x (Maksimal diperbolehkan)                            │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Pilihan Anda [0-2] (Default: 0): ")).trim();
      if (ans === "1") selectedLeverage = 1;
      else if (ans === "2") selectedLeverage = 2;
    }
    console.log(`⚖️  Leverage: ${selectedLeverage ? selectedLeverage + "x" : "BEBAS (Rekomendasi Glyph Brain)"}\n`);

    // -------------------------------------------------------------------------
    // QUESTION 5: THESIS
    // -------------------------------------------------------------------------
    if (!selectedThesis && rl) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [5/6] MASUKKAN THESIS / CATATAN KHUSUS                      │");
      console.log("│  Tekan Enter untuk [Bebas / Dibuat Otomatis oleh Brain]     │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Thesis manual: ")).trim();
      if (ans.length > 0) {
        selectedThesis = ans;
      }
    }
    console.log(`📝 Thesis: ${selectedThesis ? `"${selectedThesis}"` : "BEBAS (Dibuat otomatis oleh Glyph Brain)"}\n`);

    // -------------------------------------------------------------------------
    // QUESTION 6: EXECUTION MODE
    // -------------------------------------------------------------------------
    if (isDryRun === undefined && rl) {
      console.log("┌─────────────────────────────────────────────────────────────┐");
      console.log("│ [6/6] PILIH MODE EKSEKUSI                                   │");
      console.log("│  [1] Real Run (Simpan ke DB, Portfolio, Commit On-Chain)    │");
      console.log("│  [2] Dry Run  (Simulasi aman di terminal tanpa ubah data)   │");
      console.log("└─────────────────────────────────────────────────────────────┘");
      const ans = (await rl.question("Pilihan Anda [1-2] (Default: 1): ")).trim();
      if (ans === "2") isDryRun = true;
      else isDryRun = false;
    }
    console.log(`🛡️  Mode Eksekusi: ${isDryRun ? "DRY RUN (Simulasi Aman)" : "REAL RUN (Live Execution)"}\n`);

    // Market status verification
    if (!marketStatus.isOpen && !bypassMarketHours) {
      const statusReason = marketStatus.notes || marketStatus.currentStatus;
      if (rl) {
        console.log(`⏸️  [STATUS BURSA] Pasar saham US saat ini TUTUP (${statusReason}).`);
        const ans = (await rl.question("Tetap jalankan dengan bypass jam pasar (--force)? (Y/n): ")).trim().toLowerCase();
        if (ans === "y" || ans === "yes" || ans === "") {
          bypassMarketHours = true;
          console.log("✅ Bypass jam bursa diaktifkan.\n");
        } else {
          console.log("⛔ Eksekusi dibatalkan karena pasar tutup.");
          process.exit(0);
        }
      } else {
        console.warn(`⏸️  [STATUS BURSA] Pasar saham US tutup (${statusReason}). Gunakan --force untuk bypass.`);
        if (!isDryRun) {
          process.exit(0);
        }
      }
    }
  } finally {
    if (rl) rl.close();
  }

  const assetToAnalyze = selectedAsset || "NVDA";

  // ---------------------------------------------------------------------------
  // STEP 1: FETCH / CREATE RESEARCH SNAPSHOT
  // ---------------------------------------------------------------------------
  console.log(`\n⏳ Mengambil data pasar & riset untuk ${assetToAnalyze}...`);
  let snapshot = await prisma.researchSnapshot.findFirst({
    where: { asset: assetToAnalyze },
    orderBy: { createdAt: "desc" },
  });

  if (!snapshot) {
    console.log(`  - Snapshot belum ada, membuat snapshot baru via Twelve Data...`);
    const created = await createResearchSnapshot(assetToAnalyze);
    snapshot = await prisma.researchSnapshot.findUnique({
      where: { id: created.snapshotId },
    });
  }

  if (!snapshot) {
    throw new Error(`Gagal mengambil atau membuat snapshot riset untuk ${assetToAnalyze}.`);
  }

  const quotePrice = (snapshot.marketData as any)?.quote?.price || 120.0;
  const techScore = (snapshot.technicalData as any)?.technicalScore ?? 70;
  const fundScore = (snapshot.fundamentalData as any)?.fundamentalScore ?? 75;

  console.log(`  ✅ Snapshot ID: ${snapshot.id}`);
  console.log(`  💵 Harga Pasar: $${quotePrice}`);
  console.log(`  📊 Technical Score: ${techScore}/100 | Fundamental Score: ${fundScore}/100\n`);

  const researchPayload: SynthesizedResearch = {
    asset: snapshot.asset,
    timestamp: snapshot.createdAt.toISOString(),
    marketData: snapshot.marketData as any,
    fundamentalData: snapshot.fundamentalData as any,
    technicalData: snapshot.technicalData as any,
    newsData: snapshot.newsData as any,
    sourceMetadata: snapshot.sourceMetadata as any,
  };

  // ---------------------------------------------------------------------------
  // STEP 2: GLYPH BRAIN REASONING (OR FILL MISSING FIELDS)
  // ---------------------------------------------------------------------------
  console.log(`🧠 Menghubungi Glyph Brain (AI Reasoning)...`);
  const brainOutput = await queryGlyphBrain(
    researchPayload,
    { cash: treasurySummary.currentBalance, equity: treasurySummary.totalEquity },
    agentIdentifier,
    agent.id
  );

  // Apply user manual overrides if any
  const finalAction = selectedAction || brainOutput.action;
  const finalSize = selectedSize !== undefined ? selectedSize : brainOutput.position_size_percent;
  const finalLeverage = selectedLeverage !== undefined ? selectedLeverage : brainOutput.leverage;
  const finalConviction = opts.conviction !== undefined ? opts.conviction : brainOutput.conviction;
  const finalThesis = {
    fundamental: brainOutput.thesis.fundamental,
    technical: brainOutput.thesis.technical,
    catalyst: selectedThesis || brainOutput.thesis.catalyst,
    risk: brainOutput.thesis.risk,
    invalidation: brainOutput.thesis.invalidation,
  };

  const candidateDecision: GlyphDecisionOutput = {
    asset: assetToAnalyze,
    action: finalAction,
    conviction: finalConviction,
    time_horizon: brainOutput.time_horizon || "1d_to_14d",
    fundamental_score: brainOutput.fundamental_score,
    technical_score: brainOutput.technical_score,
    risk_score: brainOutput.risk_score,
    thesis: finalThesis,
    position_size_percent: finalSize,
    leverage: finalLeverage,
  };

  // ---------------------------------------------------------------------------
  // STEP 3: DETERMINISTIC POLICY ENGINE VALIDATION
  // ---------------------------------------------------------------------------
  console.log(`⚖️  Memvalidasi keputusan via Deterministic Policy Engine...`);
  const policyResult = await evaluateAgentTradeProposal(
    agentIdentifier,
    {
      asset: candidateDecision.asset,
      action: candidateDecision.action,
      conviction: candidateDecision.conviction,
      positionSizePercent: candidateDecision.position_size_percent,
      leverage: candidateDecision.leverage,
    },
    { isMarketOpen: bypassMarketHours || marketStatus.isOpen }
  );

  console.log(`  ↳ Policy Verdict: ${policyResult.approved ? "✅ APPROVED" : "❌ REJECTED"}`);
  if (!policyResult.approved) {
    console.log(`  ↳ Reason: ${policyResult.rejectReason}`);
  }
  console.log(`  ↳ Final Position Size: ${policyResult.clampedPositionPercent}% (Requested: ${candidateDecision.position_size_percent}%)`);
  console.log(`  ↳ Final Leverage: ${policyResult.clampedLeverage}x (Requested: ${candidateDecision.leverage}x)\n`);

  // ---------------------------------------------------------------------------
  // STEP 4: DISPLAY DECISION SUMMARY
  // ---------------------------------------------------------------------------
  console.log("===============================================================");
  console.log(`📋 HASIL DECISION GLYPH (${candidateDecision.asset})`);
  console.log("===============================================================");
  console.log(`🎯 Aksi (Action):       ${candidateDecision.action}`);
  console.log(`🔥 Keyakinan:           ${candidateDecision.conviction}%`);
  console.log(`💰 Posisi (% Kas):      ${policyResult.clampedPositionPercent}%`);
  console.log(`⚡ Leverage:            ${policyResult.clampedLeverage}x`);
  console.log(`📌 Status Policy:       ${policyResult.policyResult}`);
  console.log(`⏱️  Time Horizon:        ${candidateDecision.time_horizon}`);
  console.log("\n💡 THESIS & REASONING:");
  console.log(`  • Fundamental:  ${candidateDecision.thesis.fundamental}`);
  console.log(`  • Technical:    ${candidateDecision.thesis.technical}`);
  console.log(`  • Catalyst:     ${candidateDecision.thesis.catalyst}`);
  console.log(`  • Risk:         ${candidateDecision.thesis.risk}`);
  console.log(`  • Invalidation: ${candidateDecision.thesis.invalidation}`);
  console.log("===============================================================\n");

  // ---------------------------------------------------------------------------
  // STEP 5: EXECUTION (DRY RUN VS REAL RUN)
  // ---------------------------------------------------------------------------
  if (isDryRun) {
    console.log("🛡️  [DRY RUN SELESAI]");
    console.log("  ✅ Tidak ada perubahan yang disimpan ke database.");
    console.log("  ✅ Tidak ada order portofolio yang dibuka.");
    console.log("  ✅ Tidak ada transaksi on-chain yang di-broadcast.");
    console.log("===============================================================\n");
    return;
  }

  // Real Run Execution
  console.log("💾 Menyimpan Decision ke database...");
  const decisionRecord = await prisma.decision.create({
    data: {
      agentId: agent.id,
      asset: candidateDecision.asset,
      action: candidateDecision.action,
      conviction: candidateDecision.conviction,
      timeHorizon: candidateDecision.time_horizon,
      fundamentalScore: candidateDecision.fundamental_score,
      technicalScore: candidateDecision.technical_score,
      riskScore: candidateDecision.risk_score,
      positionSizePercent: policyResult.clampedPositionPercent,
      leverage: policyResult.clampedLeverage,
      thesis: candidateDecision.thesis as any,
      policyResult: policyResult.policyResult,
      policyRejectReason: policyResult.rejectReason,
      researchSnapshotId: snapshot.id,
      promptVersion: GLYPH_DECISION_PROMPT_VERSION,
    },
  });
  console.log(`  ✅ Decision ID tersimpan: ${decisionRecord.id}`);

  let tradeId: string | null = null;
  let tradeNumber: string | undefined;

  // Open simulated trade if approved and action is OPEN_LONG/OPEN_SHORT and not --no-trade
  if (
    !opts.noTrade &&
    policyResult.approved &&
    (candidateDecision.action === "OPEN_LONG" || candidateDecision.action === "OPEN_SHORT")
  ) {
    console.log(`📈 Membuka posisi simulasi ${candidateDecision.action}...`);
    try {
      const openResult = await openSimulatedPosition({
        agentId: agent.agentId,
        asset: candidateDecision.asset,
        side: candidateDecision.action === "OPEN_LONG" ? "LONG" : "SHORT",
        entryPrice: quotePrice,
        proposedPositionPercent: policyResult.clampedPositionPercent,
        proposedLeverage: policyResult.clampedLeverage,
        decisionId: decisionRecord.id,
        scores: {
          conviction: candidateDecision.conviction,
          fundamentalScore: candidateDecision.fundamental_score,
          technicalScore: candidateDecision.technical_score,
          riskScore: candidateDecision.risk_score,
          thesis: candidateDecision.thesis as any,
        },
      });

      tradeId = openResult.trade.id;
      tradeNumber = openResult.trade.tradeNumber;
      await prisma.decision.update({
        where: { id: decisionRecord.id },
        data: { tradeId },
      });
      console.log(`  ✅ Trade #${tradeNumber} berhasil dibuka (ID: ${tradeId})`);
    } catch (err: any) {
      console.warn(`  ⚠️ Gagal membuka trade: ${err.message}`);
    }
  } else if (!opts.noTrade && policyResult.approved && candidateDecision.action === "CLOSE") {
    const activePos = await prisma.position.findFirst({
      where: { agentId: agent.id, asset: candidateDecision.asset, isOpen: true },
      include: { trade: true },
    });
    if (activePos) {
      console.log(`📉 Menutup posisi simulasi ${candidateDecision.asset}...`);
      const closeResult = await closeSimulatedPosition(activePos.id, quotePrice, "MANUAL");
      tradeId = closeResult.tradeId;
      tradeNumber = activePos.trade.tradeNumber;
      console.log(`  ✅ Trade #${tradeNumber} berhasil ditutup.`);
    }
  }

  // Commit decision on-chain
  console.log("🔗 Meng-commit Decision Hash ke on-chain DecisionRegistry...");
  try {
    const onchainResult = await commitDecisionOnchain(decisionRecord.id);
    console.log(`  ✅ On-Chain Transaction Hash: ${onchainResult.transactionHash}`);
    console.log(`  🌐 Explorer URL: ${onchainResult.explorerUrl}`);
  } catch (err: any) {
    console.warn(`  ⚠️ On-chain commit dilewati atau gagal: ${err.message}`);
  }

  // Record Economic Event
  try {
    const now = new Date();
    const eventUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const birthDate = new Date(agent.createdAt);
    const birthUtc = Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate());
    const day = Math.max(1, Math.floor((eventUtc - birthUtc) / (24 * 60 * 60 * 1000)) + 1);

    await prisma.economicEvent.create({
      data: {
        agentId: agent.id,
        eventType: "DECISION_MADE",
        title: `CLI: Evaluated ${candidateDecision.asset} — ${candidateDecision.action} (${candidateDecision.conviction}%)`,
        description: `Policy ${policyResult.policyResult}. Action: ${candidateDecision.action}. Catalyst: ${candidateDecision.thesis.catalyst}`,
        day,
        result: policyResult.policyResult,
        decisionId: decisionRecord.id,
        tradeId,
      },
    });
  } catch (evtErr) {
    // Non-fatal
  }

  console.log("\n===============================================================");
  console.log("🎉 DECISION BERHASIL DIBUAT & DICATAT DENGAN SUKSES!");
  console.log("===============================================================\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal Error:", err);
  process.exit(1);
});
