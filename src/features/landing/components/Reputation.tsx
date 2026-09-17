import React from "react";
import { REPUTATION_DATA } from "@/data/glyph";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const Reputation: React.FC = () => {
  const rep = REPUTATION_DATA;

  const winRate = ((rep.profitable / rep.trades) * 100).toFixed(1);

  const stats = [
    {
      label: "DECISIONS",
      value: rep.decisions,
      note: "Synthesized model updates",
    },
    {
      label: "THESIS PUBLISHED",
      value: rep.thesesPublished,
      note: "Public rationale reports",
    },
    {
      label: "TRADES",
      value: rep.trades,
      note: "Simulated tranches committed",
    },
    {
      label: "PROFITABLE",
      value: rep.profitable,
      note: `${winRate}% success rate`,
      highlight: true,
    },
    {
      label: "ONCHAIN PROOFS",
      value: rep.onchainProofs,
      note: "Immutable state commits",
    },
  ];

  return (
    <section id="reputation" className="w-full py-16 sm:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeader
          index="04"
          title="REPUTATION"
          description="QUANTIFIABLE RECORD OF ECONOMIC SURVIVAL"
        />

        {/* Editorial Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[#242424] border border-[#242424]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#080808] p-6 sm:p-8 flex flex-col justify-between space-y-4 hover:bg-[#0D0D0D] transition-colors"
            >
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase">
                {stat.label}
              </span>
              <div className="space-y-1">
                <span
                  className={`font-mono text-3xl sm:text-4xl font-light tracking-tight ${
                    stat.highlight ? "text-[#8FB996]" : "text-[#F5F5F5]"
                  }`}
                >
                  {stat.value}
                </span>
                <p className="font-mono text-[11px] text-[#A0A0A0]">
                  {stat.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Laboratory footnote */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-[#666666] pt-4 border-t border-[#181818]">
          <span>VERIFICATION: ZERO-KNOWLEDGE PROOF ANCHORS PENDING PHASE 02</span>
          <span>AUTONOMOUS SCORE: 88.4 / 100</span>
        </div>
      </div>
    </section>
  );
};
