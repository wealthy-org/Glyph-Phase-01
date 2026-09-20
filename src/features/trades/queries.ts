// ============================================================================
// GLYPH PHASE 01 — SERVER-SIDE TRADE QUERIES
// Fetches live trade records, computed stats, and detailed decision telemetry
// directly from Supabase PostgreSQL via Prisma Client (Server Components only).
// ============================================================================

import { getExplorerTxUrl } from "@/lib/onchain/registry";
import { prisma } from "@/lib/prisma";
import { Trade, TradeDecisionDetail, TradeSummaryStats } from "./types";

/**
 * Fetches real trade execution history and computes dynamic summary metrics directly from DB.
 */
export async function fetchLiveTradesData(): Promise<{
  trades: Trade[];
  stats: TradeSummaryStats;
}> {
  try {
    const dbTrades = await prisma.trade.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!dbTrades || dbTrades.length === 0) {
      return {
        trades: [],
        stats: {
          totalExecuted: 0,
          netPnl: "N/A",
          winRatio: "N/A",
          loggedRatio: "0 / 0 ATTESTED",
          network: "ROBINHOOD",
          networkChain: "TESTNET // 46630",
        },
      };
    }

    let netPnl = 0;
    let winCount = 0;
    let closedCount = 0;
    let loggedCount = 0;

    const trades: Trade[] = dbTrades.map((t) => {
      const pnlNum = t.simulatedPnl === null ? undefined : Number(t.simulatedPnl);
      const pnlPct = t.simulatedPnlPercent === null ? undefined : Number(t.simulatedPnlPercent);
      const isPositive = pnlPct !== undefined && pnlPct > 0;

      if (t.status === "CLOSED" || t.status === "LIQUIDATED") {
        netPnl += pnlNum ?? 0;
        closedCount += 1;
        if ((pnlPct ?? 0) > 0) winCount += 1;
      }

      if (t.transactionHash) {
        loggedCount += 1;
      }

      const dateStr = t.createdAt
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        })
        .toUpperCase();

      const entryFormatted = `$${Number(t.entryPrice).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      const exitFormatted = t.exitPrice !== null
        ? `$${Number(t.exitPrice).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
        : "N/A";

      const pnlFormatted = pnlPct !== undefined
        ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`
        : "N/A";

      const proofUrl = t.transactionHash
        ? getExplorerTxUrl(t.transactionHash)
        : null;

      const timeStr =
        t.createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC";

      const pnlDollar = pnlNum !== undefined
        ? `${pnlNum >= 0 ? "+$" : "-$"}${Math.abs(pnlNum).toFixed(2)}`
        : "N/A";

      const pnlPercent = pnlPct !== undefined
        ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`
        : "N/A";

      const refNumber = t.tradeNumber.includes("GLYPH-")
        ? `#TRD-${t.tradeNumber.replace("GLYPH-", "")}`
        : `#${t.tradeNumber}`;

      return {
        id: t.tradeNumber,
        tradeNumber: t.tradeNumber,
        dbId: t.id,
        date: dateStr,
        time: timeStr,
        timestamp: t.createdAt.toISOString(),
        asset: t.asset,
        action: t.action as "LONG" | "SHORT",
        status: t.status as "OPEN" | "CLOSED" | "LIQUIDATED",
        entry: entryFormatted,
        exit: exitFormatted,
        size: t.quantity != null && t.entryPrice != null
          ? `$${t.quantity.mul(t.entryPrice).toFixed(2)}`
          : "N/A",
        leverage: t.leverage != null ? `${Number(t.leverage).toFixed(0)}×` : "N/A",
        pnl: pnlDollar !== "N/A" ? pnlDollar : pnlFormatted,
        pnlDollar,
        pnlPercent,
        pnlNumber: pnlNum,
        isPositive,
        thesis: "VALIDATED",
        proofUrl,
        refNumber,
        positionSize: t.positionSize != null ? `$${t.positionSize.toString()}` : "N/A",
      };
    });

    const winRatioStr =
      closedCount > 0 ? `${((winCount / closedCount) * 100).toFixed(1)}%` : "N/A";
    const netPnlStr = closedCount > 0
      ? `${netPnl >= 0 ? "+$" : "-$"}${Math.abs(netPnl).toFixed(2)}`
      : "N/A";

    const stats: TradeSummaryStats = {
      totalExecuted: dbTrades.length,
      netPnl: netPnlStr,
      winRatio: winRatioStr,
      loggedRatio: `${loggedCount} OF ${dbTrades.length} LOGGED`,
      network: "TESTNET",
      networkChain: "ROBINHOOD CHAIN",
    };

    return { trades, stats };
  } catch (error) {
    console.error("[TradesQuery] Failed to fetch live trades:", error);
    throw error;
  }
}

/**
 * Fetches real trade detail including decision thesis, research snapshot,
 * onchain proof, and persistent trade memory directly from Supabase PostgreSQL.
 * Returns null if trade does not exist in database.
 */
export async function fetchLiveTradeDetail(
  idOrNumber: string
): Promise<TradeDecisionDetail | null> {
  const cleanId = idOrNumber.trim();

  try {
    const trade = await prisma.trade.findFirst({
      where: {
        OR: [
          { tradeNumber: { equals: cleanId, mode: "insensitive" } },
          { id: cleanId },
        ],
      },
      include: {
        decision: true,
        position: true,
      },
    });

    if (!trade) {
      return null;
    }

    // Fetch memory associated with this trade
    const memory = await prisma.memory.findFirst({
      where: { tradeId: trade.id },
    });

    const researchSnapshot = trade.researchSnapshotId
      ? await prisma.researchSnapshot.findUnique({
        where: { id: trade.researchSnapshotId },
      })
      : null;
    const researchFundamentalData = asRecord(researchSnapshot?.fundamentalData);
    const researchTechnicalData = asRecord(researchSnapshot?.technicalData);
    const decisionThesis = asRecord(trade.decision?.thesis);
    const tradeThesis = asRecord(trade.thesis);
    const thesisObj = Object.keys(decisionThesis).length > 0 ? decisionThesis : tradeThesis;

    const fundScore =
      readNumber(researchFundamentalData.fundamentalScore) ??
      trade.decision?.fundamentalScore ??
      trade.fundamentalScore;
    const techScore =
      readNumber(researchTechnicalData.technicalScore) ??
      trade.decision?.technicalScore ??
      trade.technicalScore;
    const riskScore = trade.decision?.riskScore ?? trade.riskScore;

    const pnlNum = trade.simulatedPnl === null ? null : Number(trade.simulatedPnl);
    const pnlPct = trade.simulatedPnlPercent === null ? null : Number(trade.simulatedPnlPercent);
    const isPositive = pnlPct === null ? null : pnlPct >= 0;

    const resultPercent =
      pnlPct !== null
        ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`
        : "N/A";

    const pnlValue =
      pnlNum !== null
        ? `${pnlNum >= 0 ? "+$" : "-$"}${Math.abs(pnlNum).toFixed(2)}`
        : "N/A";

    const position = trade.position;
    const entryValue = position?.entryPrice ?? trade.entryPrice;
    const marginValue = position?.positionSize ?? trade.positionSize;
    const quantityValue = position?.quantity ?? trade.quantity;
    const leverageValue = position?.leverage ?? trade.leverage;
    const currentPrice = position?.currentPrice ?? null;
    const entryPrice = `$${Number(entryValue).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const exitPrice = trade.exitPrice !== null
      ? `$${Number(trade.exitPrice).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : trade.status === "OPEN" ? "ACTIVE" : "N/A";

    const txHash = trade.transactionHash ?? trade.decision?.transactionHash ?? null;

    const explorerUrl = trade.transactionHash
      ? getExplorerTxUrl(trade.transactionHash)
      : trade.decision?.transactionHash
        ? getExplorerTxUrl(trade.decision.transactionHash)
        : null;

    const formattedMemory = memory
      ? {
        outcome: memory.outcome as "WIN" | "LOSS" | "BREAKEVEN",
        thesisResult: memory.thesisResult as "CORRECT" | "INCORRECT" | "PARTIAL",
        lesson: memory.lesson,
        confidenceCalibration: memory.confidenceCalibration as
          | "GOOD"
          | "OVER_CONFIDENT"
          | "UNDER_CONFIDENT"
          | "NEUTRAL",
        adaptation: memory.adaptation || undefined,
        weightShift: memory.weightShift || undefined,
      }
      : undefined;

    const marginNum = Number(marginValue);
    const levNum = Number(leverageValue);
    const notionalNum = marginNum * levNum;
    const marketValue = currentPrice !== null
      ? `$${(Number(quantityValue) * Number(currentPrice)).toFixed(2)}`
      : "N/A";

    return {
      id: trade.tradeNumber,
      tradeNumber: trade.tradeNumber,
      recordLabel: "DECISION RECORD",
      asset: trade.asset,
      action: trade.action as "LONG" | "SHORT",
      leverage: `${Number(leverageValue).toFixed(0)}×`,
      leverageLabel: `${Number(leverageValue).toFixed(0)}× LEVERAGE`,
      resultPercent,
      isPositive,
      status: trade.status,
      entryPrice,
      exitPrice,
      positionSize: `$${marginNum.toFixed(2)}`,
      notional: `$${notionalNum.toFixed(2)}`,
      quantity: quantityValue.toString(),
      currentPrice: currentPrice !== null ? `$${Number(currentPrice).toFixed(2)}` : "N/A",
      marketValue,
      pnlValue,
      decisionThesis:
        readText(thesisObj.thesis) ??
        readText(thesisObj.fundamental) ??
        readText(thesisObj.catalyst) ??
        "N/A",
      fundamentalAnalysis: {
        title: "Fundamental Analysis",
        description: readText(thesisObj.fundamental) ?? "N/A",
        score: fundScore,
        maxScore: 100,
      },
      technicalAnalysis: {
        title: "Technical Analysis",
        description: readText(thesisObj.technical) ?? "N/A",
        score: techScore,
        maxScore: 100,
      },
      catalyst: readText(thesisObj.catalyst) ?? "N/A",
      riskScore,
      invalidationLevel: readText(thesisObj.invalidation) ?? "N/A",
      onchainProof: {
        txHash,
        network: txHash ? "ROBINHOOD CHAIN TESTNET" : "N/A",
        explorerUrl,
      },
      memory: formattedMemory,
    };
  } catch (error) {
    console.error(`[TradeDetail] Error fetching live trade ${cleanId}:`, error);
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
