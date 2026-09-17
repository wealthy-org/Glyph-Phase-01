import React from "react";
import { REPUTATION_DATA } from "@/data/glyph";

export const Reputation: React.FC = () => {
  const rep = REPUTATION_DATA;
  const winRate = ((rep.profitable / rep.trades) * 100).toFixed(1);

  const stats = [
    {
      label: "DECISIONS RECORDED",
      value: rep.decisions,
      suffix: "",
      note: "Synthesized model updates",
      highlight: false,
    },
    {
      label: "WIN RATE { SIMULATED }",
      value: winRate,
      suffix: "%",
      note: `${rep.profitable} of ${rep.trades} profitable`,
      highlight: true,
    },
    {
      label: "THESIS PUBLISHED",
      value: rep.thesesPublished,
      suffix: "",
      note: "Public rationale reports",
      highlight: false,
    },
    {
      label: "TRADES COMMITTED",
      value: rep.trades,
      suffix: "",
      note: "Execution tranches",
      highlight: false,
    },
    {
      label: "ONCHAIN ATTESTATIONS",
      value: rep.onchainProofs,
      suffix: "",
      note: "Immutable state commits",
      highlight: false,
    },
  ];

  return (
    <section id="reputation" className="w-full py-16 sm:py-24 bg-[#000000]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
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
            AUTONOMOUS SCORE: 88.4 / 100
          </p>
        </div>

        {/* Track Record Grid from glyph.html */}
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
          <span>VERIFICATION: ROBINHOOD CHAIN TESTNET ANCHORS</span>
          <span>AUTONOMOUS SURVIVAL SCORE: 88.4 / 100</span>
        </div>
      </div>
    </section>
  );
};
