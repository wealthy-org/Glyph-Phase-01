import React from "react";
import { GridBackground } from "@/components/ui/GridBackground";
import { cn } from "@/lib/utils";
import { LandingReputationData } from "../types";

interface ReputationProps {
  reputation: LandingReputationData;
}

const ReputationComponent: React.FC<ReputationProps> = ({ reputation }) => {
  const winRateDisplay =
    reputation.winRate !== null ? `${reputation.winRate.toFixed(1)}%` : "0.0%";

  const winningCount = reputation.winningTradesCount;
  const closedCount = reputation.closedTradesCount;
  const losingCount = Math.max(0, closedCount - winningCount);
  const openTradesCount = Math.max(0, reputation.tradesCount - closedCount);

  const isPnlPositive = reputation.realizedPnl >= 0;
  const realizedPnlFormatted = `${isPnlPositive ? "+$" : "-$"}${Math.abs(
    reputation.realizedPnl
  ).toFixed(2)}`;

  return (
    <section
      id="reputation"
      className="relative w-full py-12 sm:py-16 bg-[#000000] overflow-hidden border-b border-[#171717]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
    >
      {/* Subtle modern technical grid background */}
      <GridBackground glowColor="neutral" intensity="subtle" gridSize={36} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* SINGLE BORDERED TERMINAL PERFORMANCE FRAME */}
        <div className="border border-[#1b1b1b] bg-[#050505] shadow-2xl relative overflow-hidden">
          {/* 1. TERMINAL HEADER */}
          <div className="p-4 sm:p-6 border-b border-[#1b1b1b] bg-[#070707] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse shrink-0" />
                <span>REPUTATION // TRACK RECORD</span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-light tracking-tight text-[#f3f3f4] uppercase font-sans leading-tight">
                ECONOMIC PERFORMANCE<br />
                &amp; DECISION HISTORY
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-[#85858a] border border-[#222222] bg-[#090909] px-2.5 py-1 self-start sm:self-auto shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shrink-0" />
              <span className="tracking-wider text-[#a1a1aa]">TESTNET</span>
            </div>
          </div>

          {/* 2. PRIMARY 4-COLUMN PERFORMANCE STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b]">
            {/* Metric 1: DECISIONS */}
            <div className="p-4 sm:p-6 space-y-1.5 bg-[#050505]">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                DECISIONS
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-light text-[#f3f3f4] tabular-nums">
                {reputation.decisionsCount}
              </div>
              <div className="font-mono text-[11px] text-[#55555a]">
                Autonomous evaluations
              </div>
            </div>

            {/* Metric 2: TRADES */}
            <div className="p-4 sm:p-6 space-y-1.5 bg-[#050505]">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                TRADES
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-light text-[#f3f3f4] tabular-nums">
                {reputation.tradesCount}
              </div>
              <div className="font-mono text-[11px] text-[#85858a] tabular-nums space-x-1.5">
                <span>{closedCount} CLOSED</span>
                <span className="text-[#333333]">·</span>
                <span>{openTradesCount} ACTIVE</span>
              </div>
            </div>

            {/* Metric 3: WIN RATE */}
            <div className="p-4 sm:p-6 space-y-1.5 bg-[#050505]">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                WIN RATE
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-light text-[#6fe39a] tabular-nums">
                {winRateDisplay}
              </div>
              <div className="font-mono text-[11px] text-[#85858a] tabular-nums">
                {winningCount}W / {losingCount}L
              </div>
            </div>

            {/* Metric 4: REALIZED PNL */}
            <div className="p-4 sm:p-6 space-y-1.5 bg-[#050505]">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                REALIZED PNL
              </span>
              <div
                className={cn(
                  "font-mono text-3xl sm:text-4xl font-light tabular-nums",
                  isPnlPositive ? "text-[#6fe39a]" : "text-[#c47a7a]"
                )}
              >
                {realizedPnlFormatted}
              </div>
              <div className="font-mono text-[11px] text-[#55555a]">
                USD-SIM
              </div>
            </div>
          </div>

          {/* 3. TRADE OUTCOME BREAKDOWN (4 COMPACT STATS) */}
          <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-b border-[#1b1b1b] bg-[#030303]">
            <div>
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block mb-1">
                WINS
              </span>
              <div className="font-mono text-xl sm:text-2xl font-light text-[#6fe39a] tabular-nums">
                {winningCount}
              </div>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                Profitable exits
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block mb-1">
                LOSSES
              </span>
              <div className="font-mono text-xl sm:text-2xl font-light text-[#c47a7a] tabular-nums">
                {losingCount}
              </div>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                Stopped / closed
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block mb-1">
                OPEN POSITION
              </span>
              <div className="font-mono text-xl sm:text-2xl font-light text-[#f3f3f4] tabular-nums">
                {openTradesCount}
              </div>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                Currently active
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block mb-1">
                ONCHAIN ATTESTATIONS
              </span>
              <div className="font-mono text-xl sm:text-2xl font-light text-[#85858a] tabular-nums">
                {reputation.onchainAttestationsCount}
              </div>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                Testnet records
              </span>
            </div>
          </div>

          {/* 4. FOOTER DUAL METRIC BLOCK */}
          <div className="p-4 sm:p-6 bg-[#070707] grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b] font-mono text-xs">
            {/* Left: Simulated Performance */}
            <div className="space-y-3">
              <span className="text-[10px] text-[#66666e] uppercase tracking-wider block font-semibold">
                SIMULATED PERFORMANCE
              </span>
              <div className="space-y-2 text-[11px] sm:text-xs text-[#d4d4d8]">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">REALIZED PNL:</span>
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      isPnlPositive ? "text-[#6fe39a]" : "text-[#c47a7a]"
                    )}
                  >
                    {realizedPnlFormatted} USD-SIM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">CLOSED TRADES:</span>
                  <span className="text-[#f3f3f4] font-medium tabular-nums">{closedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">OPEN POSITION:</span>
                  <span className="text-[#f3f3f4] font-medium tabular-nums">{openTradesCount}</span>
                </div>
              </div>
            </div>

            {/* Right: Network */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-3">
              <span className="text-[10px] text-[#66666e] uppercase tracking-wider block font-semibold">
                NETWORK
              </span>
              <div className="space-y-2 text-[11px] sm:text-xs text-[#d4d4d8]">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">NETWORK:</span>
                  <span className="text-[#f3f3f4] font-medium">ROBINHOOD CHAIN TESTNET</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">CHAIN ID:</span>
                  <span className="text-[#f3f3f4] font-medium tabular-nums">46630</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">ATTESTATION STATE:</span>
                  <span className="text-[#85858a]">0 ANCHORED (PENDING)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Reputation = React.memo(ReputationComponent);
