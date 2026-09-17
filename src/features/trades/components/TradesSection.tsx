"use client";

import React, { useState } from "react";
import { TradeFilter } from "../types";
import { TRADE_SUMMARY_DATA, GLYPH_TRADES_DATA } from "../data";
import { TradeSummary } from "./TradeSummary";
import { TradeFilters } from "./TradeFilters";
import { TradeTable } from "./TradeTable";

export const TradesSection: React.FC = () => {
  const [filter, setFilter] = useState<TradeFilter>("ALL");

  const filteredTrades =
    filter === "ALL"
      ? GLYPH_TRADES_DATA
      : GLYPH_TRADES_DATA.filter((t) => t.thesis === filter);

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
      <TradeSummary stats={TRADE_SUMMARY_DATA} />

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
