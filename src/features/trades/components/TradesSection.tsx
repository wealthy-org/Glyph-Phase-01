"use client";

import React, { useState } from "react";
import { Trade, TradeFilter, TradeSummaryStats } from "../types";
import { TradeSummary } from "./TradeSummary";
import { TradeFilters } from "./TradeFilters";
import { TradeTable } from "./TradeTable";

const DEFAULT_STATS: TradeSummaryStats = {
  totalExecuted: 0,
  netPnl: "$0.00",
  winRatio: "0.0%",
  loggedRatio: "0 OF 0 LOGGED",
  network: "TESTNET",
  networkChain: "ROBINHOOD CHAIN",
};

interface TradesSectionProps {
  initialTrades?: Trade[];
  initialStats?: TradeSummaryStats;
}

export const TradesSection: React.FC<TradesSectionProps> = ({
  initialTrades = [],
  initialStats = DEFAULT_STATS,
}) => {
  const [filter, setFilter] = useState<TradeFilter>("ALL");

  const filteredTrades =
    filter === "ALL"
      ? initialTrades
      : initialTrades.filter((t) => t.thesis === filter);

  return (
    <div className="w-full space-y-10 sm:space-y-12">
      {/* Editorial Header */}
      <header className="space-y-3">
        <span className="eyebrow">EXECUTION // OBSERVE</span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#f3f3f4]">
          PUBLIC TRADE HISTORY
        </h1>
        <p className="text-sm sm:text-base text-[#85858a] font-light max-w-2xl leading-relaxed">
          Every simulated trade made by Glyph. All positions are logged, verified, and linked to explicit thesis formulations.
        </p>
      </header>

      {/* Summary Metrics */}
      <TradeSummary stats={initialStats} />

      {/* Filter Tabs & Counter */}
      <TradeFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        count={filteredTrades.length}
      />

      {/* Trade Data Table */}
      <TradeTable trades={filteredTrades} />

      {/* Observational Technical Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
        <span>TRANCHE AUDIT PROTOCOL: DETERMINISTIC REPLAY</span>
        <span>SETTLEMENT: USDC-SIMULATED MARGIN</span>
      </footer>
    </div>
  );
};
