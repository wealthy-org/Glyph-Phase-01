import React from "react";
import { TradeSummaryStats } from "../types";

interface TradeSummaryProps {
  stats: TradeSummaryStats;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#242424] border border-[#242424]">
      {/* 1. TOTAL EXECUTED */}
      <div className="bg-[#080808] p-5 sm:p-6 space-y-2 hover:bg-[#0D0D0D] transition-colors">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          TOTAL EXECUTED
        </span>
        <div className="font-mono text-3xl sm:text-4xl font-light text-[#F5F5F5] tracking-tight">
          {stats.totalExecuted}
        </div>
      </div>

      {/* 2. NET SIMULATED P&L */}
      <div className="bg-[#080808] p-5 sm:p-6 space-y-2 hover:bg-[#0D0D0D] transition-colors">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          NET SIMULATED P&amp;L
        </span>
        <div className="font-mono text-3xl sm:text-4xl font-light text-[#8FB996] tracking-tight">
          {stats.netPnl}
        </div>
      </div>

      {/* 3. WIN RATIO */}
      <div className="bg-[#080808] p-5 sm:p-6 space-y-2 hover:bg-[#0D0D0D] transition-colors">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          WIN RATIO
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-3xl sm:text-4xl font-light text-[#F5F5F5] tracking-tight">
            {stats.winRatio}
          </span>
          <span className="font-mono text-[11px] text-[#A0A0A0]">
            {stats.loggedRatio}
          </span>
        </div>
      </div>

      {/* 4. NETWORK */}
      <div className="bg-[#080808] p-5 sm:p-6 space-y-2 hover:bg-[#0D0D0D] transition-colors">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          NETWORK
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-2xl sm:text-3xl font-light text-[#F5F5F5] tracking-tight uppercase">
            {stats.network}
          </span>
          <span className="font-mono text-[11px] text-[#8FB996]">
            {stats.networkChain}
          </span>
        </div>
      </div>
    </div>
  );
};
