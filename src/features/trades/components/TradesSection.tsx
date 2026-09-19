"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Trade, TradeLedgerFilter, TradeSummaryStats } from "../types";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLBAR_FILTERS: { id: TradeLedgerFilter; label: string }[] = [
  { id: "ALL", label: "ALL" },
  { id: "OPEN", label: "OPEN" },
  { id: "CLOSED", label: "CLOSED" },
  { id: "PROFIT", label: "PROFIT" },
  { id: "LOSS", label: "LOSS" },
];

interface TradesSectionProps {
  initialTrades?: Trade[];
  initialStats?: TradeSummaryStats;
}

export const TradesSection: React.FC<TradesSectionProps> = ({
  initialTrades = [],
}) => {
  const trades = initialTrades;
  const [activeFilter, setActiveFilter] = useState<TradeLedgerFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // 1. Status & Realized PnL Filter Check
      let matchesFilter = true;
      if (activeFilter === "ALL") {
        matchesFilter = true;
      } else if (activeFilter === "OPEN") {
        matchesFilter = t.status === "OPEN";
      } else if (activeFilter === "CLOSED") {
        matchesFilter = t.status === "CLOSED" || t.status === "LIQUIDATED";
      } else if (activeFilter === "PROFIT") {
        matchesFilter =
          (t.status === "CLOSED" || t.status === "LIQUIDATED") &&
          (t.pnlNumber !== undefined ? t.pnlNumber > 0 : t.isPositive);
      } else if (activeFilter === "LOSS") {
        matchesFilter =
          (t.status === "CLOSED" || t.status === "LIQUIDATED") &&
          (t.pnlNumber !== undefined ? t.pnlNumber < 0 : !t.isPositive);
      }

      if (!matchesFilter) return false;

      // 2. Search Query Check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      return (
        t.asset.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.tradeNumber && t.tradeNumber.toLowerCase().includes(q)) ||
        (t.refNumber && t.refNumber.toLowerCase().includes(q)) ||
        (t.status && t.status.toLowerCase().includes(q)) ||
        t.action.toLowerCase().includes(q)
      );
    });
  }, [trades, activeFilter, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* ========================================================================= */}
      {/* 1. MAIN TRADE LEDGER CONTAINER (Observation Terminal Workspace)          */}
      {/* ========================================================================= */}
      <div className="w-full border border-[#1b1b1b] bg-[#050505] shadow-2xl relative overflow-hidden">
        {/* ======================================================================= */}
        {/* LEDGER HEADER (Left: Title + Subtitle, Right: Search Input)             */}
        {/* ======================================================================= */}
        <div className="p-4 sm:p-6 border-b border-[#1b1b1b] bg-[#080808] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.18)] animate-livepulse shrink-0" />
              <h1 className="font-mono text-sm sm:text-base font-medium tracking-wider text-[#f3f3f4] uppercase">
                TRADE LEDGER (/TRADES)
              </h1>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#85858a] font-light pl-4">
              Execution history, positions &amp; realized performance
            </p>
          </div>

          {/* Compact Terminal Search Control */}
          <div className="relative w-full md:w-72 shrink-0">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-[#55555a] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trades, assets, IDs..."
                className="w-full h-8 pl-8 pr-7 bg-[#050505] border border-[#222222] text-[#f3f3f4] text-xs font-mono placeholder:text-[#55555a] focus:outline-none focus:border-[#444444] transition-colors"
                aria-label="Search trades"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-[#55555a] hover:text-[#f3f3f4] p-0.5"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TOOLBAR (Horizontal Terminal Filter Tabs)                               */}
        {/* ======================================================================= */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#171717] bg-[#050505] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
            {TOOLBAR_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-colors shrink-0 cursor-pointer flex items-center gap-1.5",
                    isActive
                      ? "bg-[#141414] text-[#f3f3f4] font-medium border border-[#2e2e32]"
                      : "text-[#71717a] hover:text-[#e4e4e7] border border-transparent hover:border-[#1e1e22] hover:bg-[#0a0a0a]"
                  )}
                  aria-pressed={isActive}
                >
                  <span>[ {filter.label} ]</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-[#55555a] tracking-wider shrink-0">
            <span>{filteredTrades.length} EXECUTIONS</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TABLE CONTENT AREA (Scrollable Table Strip + Dense Rows)                 */}
        {/* ======================================================================= */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px] sm:min-w-[860px]">
            {/* Table Header Strip */}
            <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-2 bg-[#080808] border-b border-[#171717] font-mono text-[10px] text-[#55555a] tracking-wider uppercase select-none items-center">
              <div className="col-span-2">TIME</div>
              <div className="col-span-1">ASSET</div>
              <div className="col-span-1">SIDE</div>
              <div className="col-span-1">SIZE</div>
              <div className="col-span-2">ENTRY</div>
              <div className="col-span-2">EXIT</div>
              <div className="col-span-1">PNL</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1 text-right">REF</div>
            </div>

            {/* Dense Rows */}
            {filteredTrades.length === 0 ? (
              /* Empty State */
              <div className="py-24 px-6 text-center space-y-3 font-mono">
                <span className="text-xs text-[#55555a] tracking-widest uppercase block">
                  TRADE LEDGER
                </span>
                <p className="text-sm text-[#f3f3f4] font-normal">
                  NO TRADES FOUND
                </p>
                <p className="text-xs text-[#71717a] max-w-sm mx-auto">
                  No executions match the current filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#171717]">
                {filteredTrades.map((trade) => {
                  const isLong = trade.action === "LONG";
                  const isClosed = trade.status === "CLOSED" || trade.status === "LIQUIDATED";
                  const isOpen = trade.status === "OPEN";

                  const pnlVal = trade.pnlNumber ?? 0;
                  const isProfit = isClosed && pnlVal > 0;
                  const isLoss = isClosed && pnlVal < 0;

                  const pnlColor = isProfit
                    ? "text-[#6fe39a]"
                    : isLoss
                    ? "text-[#c47a7a]"
                    : "text-[#85858a]";

                  const targetId = trade.id || trade.tradeNumber || trade.dbId;

                  return (
                    <Link
                      key={trade.id}
                      href={`/trades/${targetId}`}
                      className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-[#050505] hover:bg-[#090909] transition-colors items-center font-mono text-xs text-[#f3f3f4] group select-none cursor-pointer"
                    >
                      {/* 1. TIME */}
                      <div className="col-span-2 text-[11px] text-[#85858a] tabular-nums truncate">
                        {trade.time || `${trade.date} UTC`}
                      </div>

                      {/* 2. ASSET */}
                      <div className="col-span-1 font-semibold text-[#f3f3f4] tracking-wide truncate">
                        {trade.asset}
                      </div>

                      {/* 3. SIDE */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase border shrink-0 inline-block",
                            isLong
                              ? "text-[#6fe39a] border-[#6fe39a]/35 bg-[#6fe39a]/10"
                              : "text-[#c47a7a] border-[#c47a7a]/35 bg-[#c47a7a]/10"
                          )}
                        >
                          {trade.action}
                        </span>
                      </div>

                      {/* 4. SIZE */}
                      <div className="col-span-1 text-[11px] text-[#a1a1aa] tabular-nums">
                        {trade.size || trade.leverage || "1×"}
                      </div>

                      {/* 5. ENTRY */}
                      <div className="col-span-2 text-[11px] text-[#d4d4d8] tabular-nums truncate">
                        {trade.entry}
                      </div>

                      {/* 6. EXIT */}
                      <div className="col-span-2 text-[11px] tabular-nums truncate">
                        {isOpen ? (
                          <span className="text-[#85858a]">—</span>
                        ) : (
                          <span className="text-[#d4d4d8]">{trade.exit}</span>
                        )}
                      </div>

                      {/* 7. PNL */}
                      <div className={cn("col-span-1 font-medium tabular-nums truncate text-[11px]", pnlColor)}>
                        {isOpen ? "—" : trade.pnlDollar || trade.pnl}
                      </div>

                      {/* 8. STATUS */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider border shrink-0 inline-block font-medium",
                            isOpen
                              ? "text-[#fbbf24] border-[#fbbf24]/35 bg-[#fbbf24]/10"
                              : "text-[#85858a] border-[#262626] bg-[#141414]"
                          )}
                        >
                          {trade.status || (isClosed ? "CLOSED" : "OPEN")}
                        </span>
                      </div>

                      {/* 9. REF */}
                      <div className="col-span-1 text-right font-mono text-[10px] sm:text-[11px] text-[#71717a] group-hover:text-[#f3f3f4] transition-colors flex items-center justify-end gap-1">
                        <span className="truncate">{trade.refNumber || trade.id}</span>
                        <span className="text-[#55555a] group-hover:text-[#6fe39a] group-hover:translate-x-0.5 transition-all text-xs">
                          →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* STREAM FOOTER (Observability & Sync Telemetry)                          */}
        {/* ======================================================================= */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#1b1b1b] bg-[#070707] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-[#55555a]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
            <span>TRADE LEDGER SYNCHRONIZED</span>
            <span className="text-[#333333]">·</span>
            <span>SHOWING {filteredTrades.length} OF {trades.length} EXECUTIONS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>SETTLEMENT: USDC-SIMULATED MARGIN</span>
            <span className="text-[#333333]">·</span>
            <span>NETWORK: ROBINHOOD TESTNET // 46630</span>
          </div>
        </div>
      </div>
    </div>
  );
};
