"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import {
  LandingAgentMeta,
  LandingEconomicEvent,
  LandingMemoryItem,
} from "../types";

interface EconomicActivityProps {
  recentEvents?: LandingEconomicEvent[];
  latestMemory: LandingMemoryItem | null;
  adaptiveLearnings: LandingMemoryItem[];
  agent: LandingAgentMeta;
}

const EconomicActivityComponent: React.FC<EconomicActivityProps> = ({
  latestMemory,
  adaptiveLearnings,
  agent,
}) => {
  const pnlPercent = latestMemory?.pnlPercent ?? null;
  const pnlDisplay =
    pnlPercent !== null
      ? `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(1)}%`
      : "—";

  const isWin = latestMemory?.outcome === "WIN";
  const outcomeColor = isWin ? "text-[#6fe39a]" : latestMemory ? "text-[#c47a7a]" : "text-[#85858a]";
  const verdictColor =
    latestMemory?.thesisResult === "CORRECT"
      ? "text-[#6fe39a]"
      : latestMemory?.thesisResult === "INCORRECT"
        ? "text-[#c47a7a]"
        : "text-[#fbbf24]";

  return (
    <section
      id="economic-activity"
      className="w-full py-12 sm:py-16 border-b border-[#171717] bg-[#000000]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#171717] pb-6">
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest uppercase text-[#85858a]">
              MEMORY // ADAPTATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-[#f3f3f4] leading-[1.05]">
              ECONOMIC HISTORY<br />
              &amp; ADAPTIVE MEMORY.
            </h2>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs self-start sm:self-auto">
            <Link
              href="/life"
              className="inline-flex items-center gap-1.5 text-[#85858a] hover:text-[#f3f3f4] transition-colors uppercase tracking-wider group"
            >
              <span className="border-b border-[#333338] group-hover:border-[#f3f3f4] pb-0.5">
                FULL MEMORY
              </span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* 1. LATEST MEMORY TERMINAL FRAME */}
        <div className="border border-[#1b1b1b] bg-[#050505] p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch shadow-xl">
          {/* Left Column: Outcome & PnL Telemetry */}
          <div className="lg:col-span-4 p-5 border border-[#171717] bg-[#030303] flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                  LATEST MEMORY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse shrink-0" />
              </div>
              <div className={cn("font-mono text-2xl sm:text-3xl font-light tracking-wide uppercase pt-2", outcomeColor)}>
                {latestMemory?.outcome || "PENDING"}
              </div>
              <div className={cn("font-mono text-xl sm:text-2xl font-light tabular-nums", outcomeColor)}>
                {pnlDisplay}
              </div>
            </div>

            <div className="pt-3 border-t border-[#141414] font-mono text-[10px] text-[#55555a] flex items-center justify-between">
              <span>PERSISTENT STATE</span>
              <span className="text-[#85858a]">ONCHAIN ATTESTED</span>
            </div>
          </div>

          {/* Right Column: Persistent Memory Editorial & Adaptation */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4 border-l-0 lg:border-l lg:border-[#171717] lg:pl-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#6fe39a] uppercase tracking-wider font-medium">
                  GLYPH PERSISTENT MEMORY
                </span>
                <span className="text-[#55555a] uppercase">
                  RECORD #{latestMemory?.id ? latestMemory.id.slice(0, 8) : "INITIAL"}
                </span>
              </div>

              {latestMemory ? (
                <>
                  <blockquote className="italic font-sans text-base sm:text-lg text-[#f3f3f4] font-light leading-relaxed border-l-2 border-[#6fe39a]/70 pl-4 py-0.5">
                    &ldquo;{latestMemory.lesson}&rdquo;
                  </blockquote>

                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs border-t border-[#141414]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#55555a] uppercase tracking-wider block">
                        GLYPHS VIEW VERDICT
                      </span>
                      <span className={cn("font-medium", verdictColor)}>
                        {latestMemory.thesisResult}
                      </span>
                    </div>
                    {latestMemory.adaptation && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#55555a] uppercase tracking-wider block">
                          ADAPTATION
                        </span>
                        <span className="text-[#a1a1aa] font-sans text-xs font-light block leading-snug">
                          {latestMemory.adaptation}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-4 font-mono text-xs text-[#71717a]">
                  No reflections recorded yet. Autonomous reflection will form upon completion of the first closed trade.
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] font-mono text-[#55555a] flex items-center justify-between">
              <span>SURVIVAL RUNTIME: {agent.activeDays}D {String(agent.activeHours).padStart(2, "0")}H</span>
              <span className="text-[#6fe39a]">ZERO HUMAN OVERRIDES</span>
            </div>
          </div>
        </div>

        {/* 2. HOW GLYPH LEARNS (3-COLUMN ADAPTATION CARDS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#171717] pb-3">
            <span className="font-mono text-xs text-[#85858a] tracking-wider uppercase">
              HOW GLYPH LEARNS
            </span>
            <span className="font-mono text-[10px] text-[#55555a] uppercase">
              {adaptiveLearnings.length} REFLECTIONS ATTESTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {adaptiveLearnings.length > 0 ? (
              adaptiveLearnings.map((learning) => {
                const isCardWin = learning.outcome === "WIN";
                const badgeColor = isCardWin
                  ? "text-[#6fe39a] border-[#6fe39a]/30 bg-[#6fe39a]/10"
                  : "text-[#c47a7a] border-[#c47a7a]/30 bg-[#c47a7a]/10";

                return (
                  <div
                    key={learning.id}
                    className="p-5 border border-[#1b1b1b] bg-[#050505] space-y-3.5 flex flex-col justify-between hover:border-[#262626] transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className={cn("px-1.5 py-0.5 border font-medium uppercase tracking-wider", badgeColor)}>
                          {learning.outcome} REFLECTION
                        </span>
                        <span className="text-[#71717a] uppercase tracking-wider">
                          {learning.thesisResult}
                        </span>
                      </div>

                      <p className="font-sans text-xs sm:text-[13px] text-[#f0f0f2] font-light leading-relaxed">
                        {learning.lesson}
                      </p>
                    </div>

                    <div className="pt-2.5 text-[11px] font-mono border-t border-[#171717] space-y-1.5">
                      {learning.adaptation && (
                        <div>
                          <span className="text-[#55555a] uppercase">ADAPTATION: </span>
                          <span className="text-[#a1a1aa] font-sans text-xs font-light block mt-0.5">
                            {learning.adaptation}
                          </span>
                        </div>
                      )}
                      {learning.weightShift && (
                        <div className="text-[#6fe39a] text-[10px] pt-0.5">
                          <span className="text-[#55555a] uppercase">WEIGHT SHIFT: </span>
                          <span>{learning.weightShift}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 p-8 border border-[#1b1b1b] bg-[#050505] text-center font-mono text-xs text-[#55555a]">
                NO ADAPTIVE UPDATES RECORDED
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const EconomicActivity = React.memo(EconomicActivityComponent);
