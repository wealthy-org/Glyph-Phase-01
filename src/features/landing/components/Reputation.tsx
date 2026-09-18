import React from "react";
import { GridBackground } from "@/components/ui/GridBackground";
import { LandingReputationData } from "../types";

interface ReputationProps {
  reputation: LandingReputationData;
}

export const Reputation: React.FC<ReputationProps> = ({ reputation }) => {
  const winRateDisplay =
    reputation.winRate !== null ? reputation.winRate.toFixed(1) : "—";

  const winRateNote =
    reputation.closedTradesCount > 0
      ? `${reputation.winningTradesCount} of ${reputation.closedTradesCount} profitable`
      : "No closed trades yet";

  const stats = [
    {
      label: "DECISIONS RECORDED",
      value: reputation.decisionsCount,
      suffix: "",
      note: "Synthesized model updates",
      highlight: false,
    },
    {
      label: "WIN RATE { SIMULATED }",
      value: winRateDisplay,
      suffix: reputation.winRate !== null ? "%" : "",
      note: winRateNote,
      highlight: true,
    },
    {
      label: "THESES PUBLISHED",
      value: reputation.thesesPublished,
      suffix: "",
      note: "Public rationale reports",
      highlight: false,
    },
    {
      label: "TRADES EXECUTED",
      value: reputation.tradesCount,
      suffix: "",
      note: `${reputation.closedTradesCount} closed · ${Math.max(
        0,
        reputation.tradesCount - reputation.closedTradesCount
      )} active`,
      highlight: false,
    },
    {
      label: "ONCHAIN ATTESTATIONS",
      value: reputation.onchainAttestationsCount,
      suffix: "",
      note: "Robinhood Chain commits",
      highlight: false,
    },
  ];

  return (
    <section id="reputation" className="relative w-full py-16 sm:py-24 bg-[#000000] overflow-hidden">
      {/* Subtle modern thin grid background with calm neutral glow */}
      <GridBackground glowColor="neutral" intensity="medium" gridSize={36} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="eyebrow">REPUTATION // TRACK RECORD</span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4] leading-[0.98]">
              Quantifiable survival,<br />
              unforgeable record.
            </h2>
          </div>

          <p className="font-mono text-xs text-[#76767a] tracking-wider uppercase max-w-xs">
            AUTONOMOUS PROOF RECORD // ROBINHOOD CHAIN
          </p>
        </div>

        {/* Track Record Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#171717] border border-[#171717]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#050505] p-6 sm:p-8 flex flex-col justify-between space-y-5 hover:bg-[#080808] transition-colors"
            >
              <span className="font-mono text-[10px] sm:text-[11px] text-[#69696e] tracking-widest uppercase">
                {stat.label}
              </span>

              <div className="space-y-1">
                <div
                  className={`font-mono text-4xl sm:text-5xl font-light tracking-[-0.05em] tabular-nums ${
                    stat.highlight ? "text-[#6fe39a]" : "text-[#f3f3f4]"
                  }`}
                >
                  {stat.value}
                  {stat.suffix && <span className="text-2xl text-[#85858a] ml-1">{stat.suffix}</span>}
                </div>
                <p className="font-mono text-[10px] text-[#55555a] uppercase">
                  {stat.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Observatory Footnote */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-[#55555a] pt-4 border-t border-[#141414]">
          <span>VERIFICATION: ROBINHOOD CHAIN TESTNET ANCHORS (CHAIN ID 46630)</span>
          <span>NET REALIZED PNL: ${reputation.realizedPnl.toFixed(2)} USD-SIM</span>
        </div>
      </div>
    </section>
  );
};
