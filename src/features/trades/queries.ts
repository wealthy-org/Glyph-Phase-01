// ============================================================================
// GLYPH PHASE 01 — SERVER-SIDE TRADE QUERIES
// Fetches live trade records, computed stats, and detailed decision telemetry
// directly from Supabase PostgreSQL via Prisma Client (Server Components only).
// ============================================================================

import { prisma } from "@/lib/prisma";
import { getExplorerTxUrl } from "@/lib/onchain/registry";
import { Trade, TradeSummaryStats, TradeDecisionDetail } from "./types";

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
          netPnl: "$0.00",
          winRatio: "0.0%",
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
      const pnlNum = Number(t.simulatedPnl ?? 0);
      const pnlPct = Number(t.simulatedPnlPercent ?? 0);
      const isPositive = pnlPct >= 0;

      if (t.status === "CLOSED" || t.status === "LIQUIDATED") {
        netPnl += pnlNum;
        closedCount += 1;
        if (pnlPct > 0) winCount += 1;
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

      const exitFormatted = t.exitPrice
        ? `$${Number(t.exitPrice).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "—";

      const pnlFormatted =
        t.simulatedPnlPercent !== null
          ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`
          : "0.0%";

      const proofUrl = t.transactionHash
        ? getExplorerTxUrl(t.transactionHash)
        : "https://explorer.testnet.chain.robinhood.com";

      const marginNum = Number(t.positionSize ?? 0);
      const levNum = Number(t.leverage ?? 1);
      const notionalNum = marginNum * levNum;

      const timeStr =
        t.createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC";

      const pnlDollar =
        pnlNum !== 0
          ? `${pnlNum >= 0 ? "+$" : "-$"}${Math.abs(pnlNum).toFixed(2)}`
          : pnlPct !== 0
          ? `${pnlPct >= 0 ? "+$" : "-$"}${Math.abs(pnlPct).toFixed(2)}`
          : "$0.00";

      const pnlPercent = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`;

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
        size: `${Number(t.leverage).toFixed(0)}×`,
        leverage: `${Number(t.leverage).toFixed(0)}×`,
        pnl: pnlDollar !== "$0.00" ? pnlDollar : pnlFormatted,
        pnlDollar,
        pnlPercent,
        pnlNumber: pnlNum !== 0 ? pnlNum : pnlPct,
        isPositive,
        thesis: isPositive ? "VALIDATED" : "INVALIDATED",
        proofUrl,
        refNumber,
        positionSize: marginNum > 0 ? `$${marginNum.toFixed(2)}` : "-",
        notional: notionalNum > 0 ? `$${notionalNum.toFixed(2)}` : "-",
      };
    });

    const winRatioStr =
      closedCount > 0 ? `${((winCount / closedCount) * 100).toFixed(1)}%` : "0.0%";
    const netPnlStr = `${netPnl >= 0 ? "+$" : "-$"}${Math.abs(netPnl).toFixed(2)}`;

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
    return {
      trades: [],
      stats: {
        totalExecuted: 0,
        netPnl: "$0.00",
        winRatio: "0.0%",
        loggedRatio: "0 / 0 ATTESTED",
        network: "ROBINHOOD",
        networkChain: "TESTNET // 46630",
      },
    };
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
      },
    });

    if (!trade) {
      return null;
    }

    // Fetch memory associated with this trade
    const memory = await prisma.memory.findFirst({
      where: { tradeId: trade.id },
    });

    // Extract thesis components
    const thesisObj = (trade.thesis || trade.decision?.thesis || {}) as Record<
      string,
      any
    >;
    const decisionThesis =
      thesisObj.fundamental ||
      thesisObj.catalyst ||
      `${trade.asset} ${trade.action} position executed under algorithmic risk policy limits.`;

    const catalyst =
      thesisObj.catalyst ||
      "Technical structure breakout and risk-budget alignment.";

    const invalidationLevel =
      thesisObj.invalidation ||
      `Price action breaches calibrated stop boundary.`;

    const fundScore =
      trade.fundamentalScore ?? trade.decision?.fundamentalScore ?? 75;
    const techScore =
      trade.technicalScore ?? trade.decision?.technicalScore ?? 80;
    const riskScore = trade.riskScore ?? trade.decision?.riskScore ?? 50;

    const pnlNum = Number(trade.simulatedPnl ?? 0);
    const pnlPct = Number(trade.simulatedPnlPercent ?? 0);
    const isPositive = pnlPct >= 0;

    const resultPercent =
      trade.simulatedPnlPercent !== null
        ? `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`
        : "0.0%";

    const pnlValue =
      trade.simulatedPnl !== null
        ? `${pnlNum >= 0 ? "+$" : "-$"}${Math.abs(pnlNum).toFixed(2)}`
        : "$0.00";

    const entryPrice = `$${Number(trade.entryPrice).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const exitPrice = trade.exitPrice
      ? `$${Number(trade.exitPrice).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "ACTIVE";

    const txHash =
      trade.transactionHash ||
      trade.decision?.transactionHash ||
      "0x0000000000000000000000000000000000000000";

    const explorerUrl = trade.transactionHash
      ? getExplorerTxUrl(trade.transactionHash)
      : trade.decision?.transactionHash
      ? getExplorerTxUrl(trade.decision.transactionHash)
      : "https://explorer.testnet.chain.robinhood.com";

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

    const marginNum = Number(trade.positionSize ?? 0);
    const levNum = Number(trade.leverage ?? 1);
    const notionalNum = marginNum * levNum;

    return {
      id: trade.tradeNumber,
      tradeNumber: trade.tradeNumber,
      recordLabel: "DECISION RECORD",
      asset: trade.asset,
      action: trade.action as "LONG" | "SHORT",
      leverage: `${Number(trade.leverage).toFixed(0)}×`,
      leverageLabel: `${Number(trade.leverage).toFixed(0)}× SIMULATED LEVERAGE`,
      resultPercent,
      isPositive,
      status: trade.status === "OPEN" ? "OPEN" : "CLOSED",
      entryPrice,
      exitPrice,
      positionSize: marginNum > 0 ? `$${marginNum.toFixed(2)}` : "-",
      notional: notionalNum > 0 ? `$${notionalNum.toFixed(2)}` : "-",
      pnlValue,
      decisionThesis,
      fundamentalAnalysis: {
        title: "Fundamental Analysis",
        description:
          thesisObj.fundamental ||
          "Fundamental valuation, revenue trajectory, and sector catalyst synthesis.",
        score: fundScore,
        maxScore: 100,
      },
      technicalAnalysis: {
        title: "Technical Analysis",
        description:
          thesisObj.technical ||
          "Technical momentum structure, support/resistance, and volatility bounds.",
        score: techScore,
        maxScore: 100,
      },
      catalyst,
      riskScore,
      invalidationLevel,
      onchainProof: {
        txHash,
        network: "ROBINHOOD CHAIN TESTNET",
        explorerUrl,
      },
      memory: formattedMemory,
    };
  } catch (error) {
    console.error(`[TradeDetail] Error fetching live trade ${cleanId}:`, error);
    return null;
  }
}
