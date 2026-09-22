// ============================================================================
// GLYPH PHASE 01 — ASSET-SPECIFIC HISTORICAL RESEARCH CONTEXT
// Query, validate, order, and format the 3 most recent ResearchSnapshots
// for the EXACT same asset being evaluated.
// ============================================================================

import { prisma } from "@/lib/prisma";
import { ResearchSnapshot } from "@/generated/prisma/client";
import {
  FundamentalSummary,
  NewsItem,
  RiskContext,
  SynthesizedResearch,
  TechnicalSummary,
} from "@/types/market";

export interface ValidatedHistoricalSnapshot {
  id: string;
  asset: string;
  createdAt: Date;
  cycleId: string;
  marketData: SynthesizedResearch["marketData"];
  fundamentalData: FundamentalSummary;
  technicalData: TechnicalSummary;
  newsData: NewsItem[];
  sourceMetadata: {
    provider: string;
    fetchedAt: string;
    isCached: boolean;
    riskContext?: RiskContext;
    dataQuality?: string;
    [key: string]: unknown;
  };
}

export type HistoricalResearchResult =
  | {
      ok: true;
      targetAsset: string;
      snapshots: [
        ValidatedHistoricalSnapshot,
        ValidatedHistoricalSnapshot,
        ValidatedHistoricalSnapshot
      ];
      snapshotIds: [string, string, string];
      availableSnapshots: number;
      requiredSnapshots: 3;
    }
  | {
      ok: false;
      targetAsset: string;
      reason: string;
      availableSnapshots: number;
      requiredSnapshots: number;
      snapshots: ValidatedHistoricalSnapshot[];
      snapshotIds: string[];
    };

/**
 * Validates a single ResearchSnapshot row to ensure it belongs to the target asset,
 * has valid timestamps and cycle correlation keys, and is not corrupted.
 */
export function validateSnapshotCandidate(
  candidate: ResearchSnapshot,
  targetAsset: string
): ValidatedHistoricalSnapshot | null {
  const normTarget = targetAsset.trim().toUpperCase();
  const normAsset = (candidate.asset || "").trim().toUpperCase();

  // Strict asset match: Never allow cross-asset contamination
  if (normAsset !== normTarget) {
    return null;
  }

  // Valid createdAt timestamp
  if (!candidate.createdAt || isNaN(new Date(candidate.createdAt).getTime())) {
    return null;
  }

  // Valid non-empty cycle correlation key
  if (!candidate.cycleId || typeof candidate.cycleId !== "string" || candidate.cycleId.trim().length === 0) {
    return null;
  }

  // Valid market data object with quote
  if (!candidate.marketData || typeof candidate.marketData !== "object" || Array.isArray(candidate.marketData)) {
    return null;
  }
  const marketData = candidate.marketData as any;
  if (!marketData.quote || typeof marketData.quote.price !== "number") {
    return null;
  }

  // Valid fundamental data object with scores
  if (!candidate.fundamentalData || typeof candidate.fundamentalData !== "object" || Array.isArray(candidate.fundamentalData)) {
    return null;
  }
  const fundData = candidate.fundamentalData as any;
  if (typeof fundData.fundamentalScore !== "number") {
    return null;
  }

  // Valid technical data object with scores
  if (!candidate.technicalData || typeof candidate.technicalData !== "object" || Array.isArray(candidate.technicalData)) {
    return null;
  }
  const techData = candidate.technicalData as any;
  if (typeof techData.technicalScore !== "number" || typeof techData.trend !== "string") {
    return null;
  }

  // Valid source metadata
  const meta = (candidate.sourceMetadata && typeof candidate.sourceMetadata === "object" && !Array.isArray(candidate.sourceMetadata))
    ? (candidate.sourceMetadata as any)
    : {};

  return {
    id: candidate.id,
    asset: normAsset,
    createdAt: new Date(candidate.createdAt),
    cycleId: candidate.cycleId,
    marketData: candidate.marketData as unknown as SynthesizedResearch["marketData"],
    fundamentalData: candidate.fundamentalData as unknown as FundamentalSummary,
    technicalData: candidate.technicalData as unknown as TechnicalSummary,
    newsData: (Array.isArray(candidate.newsData) ? candidate.newsData : []) as unknown as NewsItem[],
    sourceMetadata: {
      provider: meta.provider || "StockFit Free + Twelve Data Free",
      fetchedAt: meta.fetchedAt || candidate.createdAt.toISOString(),
      isCached: Boolean(meta.isCached),
      riskContext: meta.riskContext,
      dataQuality: meta.dataQuality,
      ...meta,
    },
  };
}

/**
 * Retrieves the 3 most recent valid ResearchSnapshots for the exact target asset.
 * Guarantees:
 * - Strictly isolated by asset (where: { asset: targetAsset })
 * - Ordered chronologically from newest to oldest
 * - Deduplicated and thoroughly validated
 * - Returns ok: false if fewer than 3 valid snapshots exist
 */
export async function getHistoricalResearchSnapshots(
  targetAsset: string,
  minRequired: number = 3
): Promise<HistoricalResearchResult> {
  const normTarget = (targetAsset || "").trim().toUpperCase();
  if (!normTarget) {
    return {
      ok: false,
      targetAsset: "",
      reason: "Target asset is required",
      availableSnapshots: 0,
      requiredSnapshots: minRequired,
      snapshots: [],
      snapshotIds: [],
    };
  }

  // Query exclusively by the exact asset, newest first
  const candidates = await prisma.researchSnapshot.findMany({
    where: {
      asset: normTarget,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20, // query extra candidates in case some are corrupted
  });

  // Validate candidates and ensure uniqueness
  const seenIds = new Set<string>();
  const validSnapshots: ValidatedHistoricalSnapshot[] = [];

  for (const candidate of candidates) {
    if (seenIds.has(candidate.id)) continue;
    const validated = validateSnapshotCandidate(candidate, normTarget);
    if (validated) {
      seenIds.add(candidate.id);
      validSnapshots.push(validated);
    }
  }

  // Ensure strict chronological sort: newest -> previous -> oldest
  validSnapshots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (validSnapshots.length < minRequired) {
    return {
      ok: false,
      targetAsset: normTarget,
      reason: `Insufficient historical research snapshots for ${normTarget}: found ${validSnapshots.length}, required ${minRequired}`,
      availableSnapshots: validSnapshots.length,
      requiredSnapshots: minRequired,
      snapshots: validSnapshots,
      snapshotIds: validSnapshots.map((s) => s.id),
    };
  }

  const selected = validSnapshots.slice(0, 3) as [
    ValidatedHistoricalSnapshot,
    ValidatedHistoricalSnapshot,
    ValidatedHistoricalSnapshot
  ];

  return {
    ok: true,
    targetAsset: normTarget,
    snapshots: selected,
    snapshotIds: [selected[0].id, selected[1].id, selected[2].id],
    availableSnapshots: validSnapshots.length,
    requiredSnapshots: 3,
  };
}

/**
 * Formats the 3 historical snapshots into an LLM prompt block
 * displaying newest -> previous -> oldest progression.
 */
export function formatHistoricalResearchForPrompt(
  snapshots: ValidatedHistoricalSnapshot[]
): string {
  if (snapshots.length === 0) {
    return "  No historical research snapshots available.";
  }

  const labels = ["1. Latest Research (Newest)", "2. Previous Research", "3. Older Research (Oldest)"];

  return snapshots
    .slice(0, 3)
    .map((s, idx) => {
      const label = labels[idx] || `${idx + 1}. Historical Research`;
      const quote = s.marketData?.quote;
      const tech = s.technicalData;
      const fund = s.fundamentalData;
      const risk = s.sourceMetadata?.riskContext;

      return `[${label}]
   Snapshot ID  : ${s.id}
   Timestamp    : ${s.createdAt.toISOString()}
   Cycle ID     : ${s.cycleId}
   Price        : $${quote ? quote.price.toFixed(2) : "N/A"}
   Technical    : Score ${tech?.technicalScore ?? "N/A"}/100 | Trend: ${tech?.trend ?? "N/A"} | RSI(14): ${tech?.rsi14?.toFixed(2) ?? "N/A"} | Volatility: ${tech?.volatilityPercent?.toFixed(2) ?? "N/A"}%
   Fundamental  : Score ${fund?.fundamentalScore ?? "N/A"}/100 | Margin: ${fund?.profitMarginPercent?.toFixed(2) ?? "N/A"}% | Sentiment: ${fund?.sentimentVerdict ?? "N/A"}
   Risk Context : Regime: ${(risk?.regime ?? "uncertain").toUpperCase()} | Level: ${(risk?.level ?? "moderate").toUpperCase()}`;
    })
    .join("\n\n");
}
