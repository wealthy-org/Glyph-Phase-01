"use client";

import React from "react";
import { TradeSummaryStats } from "../types";

interface TradeSummaryProps {
  stats: TradeSummaryStats;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1e1e24] border border-[#1e1e24] rounded-xl overflow-hidden shadow-lg">
      {/* 1. TOTAL EXECUTED */}
      <div className="bg-gradient-to-b from-[#09090c] to-[#040405] p-5 sm:p-6 space-y-2 hover:from-[#0d0d12] transition-colors">
        <span className="font-sans text-xs text-[#8e8e93] uppercase tracking-wider block font-medium">
          Total Executed
        </span>
        <div className="font-mono text-3xl sm:text-4xl font-light text-[#f4f4f5] tracking-tight">
          {stats.totalExecuted}
        </div>
      </div>

      {/* 2. NET SIMULATED P&L */}
      <div className="bg-gradient-to-b from-[#09090c] to-[#040405] p-5 sm:p-6 space-y-2 hover:from-[#0d0d12] transition-colors">
        <span className="font-sans text-xs text-[#8e8e93] uppercase tracking-wider block font-medium">
          Net Simulated P&amp;L
        </span>
        <div className="font-mono text-3xl sm:text-4xl font-light text-[#6fe39a] tracking-tight">
          {stats.netPnl}
        </div>
      </div>

      {/* 3. WIN RATIO */}
      <div className="bg-gradient-to-b from-[#09090c] to-[#040405] p-5 sm:p-6 space-y-2 hover:from-[#0d0d12] transition-colors">
        <span className="font-sans text-xs text-[#8e8e93] uppercase tracking-wider block font-medium">
          Win Ratio
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-3xl sm:text-4xl font-light text-[#f4f4f5] tracking-tight">
            {stats.winRatio}
          </span>
          <span className="font-mono text-[11px] text-[#8e8e93]">
            {stats.loggedRatio}
          </span>
        </div>
      </div>

      {/* 4. NETWORK */}
      <div className="bg-gradient-to-b from-[#09090c] to-[#040405] p-5 sm:p-6 space-y-2 hover:from-[#0d0d12] transition-colors">
        <span className="font-sans text-xs text-[#8e8e93] uppercase tracking-wider block font-medium">
          Settlement Chain
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-2xl sm:text-3xl font-light text-[#f4f4f5] tracking-tight uppercase">
            {stats.network}
          </span>
          <span className="font-mono text-[11px] text-[#6fe39a]">
            {stats.networkChain}
          </span>
        </div>
      </div>
    </div>
  );
};
