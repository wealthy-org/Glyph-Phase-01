"use client";

import { EventTimeline } from "@/features/landing/components/EventTimeline";
import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  LandingEconomicEvent,
  LandingMemoryItem,
  LandingAgentMeta,
} from "../types";

interface EconomicActivityProps {
  recentEvents: LandingEconomicEvent[];
  latestMemory: LandingMemoryItem | null;
  adaptiveLearnings: LandingMemoryItem[];
  agent: LandingAgentMeta;
}

export const EconomicActivity: React.FC<EconomicActivityProps> = ({
  recentEvents,
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
  const ringColor = isWin ? "#6fe39a" : latestMemory ? "#c47a7a" : "#444448";

  return (
    <section id="economic-activity" className="w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="eyebrow">MEMORY // ADAPTATION</span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4] leading-[0.98]">
              Economic history<br />
              &amp; adaptive memory.
            </h2>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs self-start sm:self-auto">
            <Link
              href="/life"
              className="inline-flex items-center gap-2 text-[#85858a] hover:text-[#6fe39a] transition-colors uppercase tracking-wider"
            >
              <History size={13} />
              <span>Full Lifelog (/life)</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Memory Showcase Block */}
        <div className="border border-[#171717] bg-[#050505] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Radial Ring Graphic Visualizer */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center border border-[#1a1a1a] bg-[#040404] p-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#161616"
                  strokeWidth="3.5"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="427"
                  strokeDashoffset={latestMemory ? "100" : "427"}
                  className="filter drop-shadow-[0_0_8px_rgba(111,227,154,0.45)] transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 font-mono">
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: ringColor }}
                >
                  {latestMemory?.outcome || "INITIALIZING"}
                </span>
                <span className="text-3xl sm:text-4xl font-light text-[#f0f0f1] tracking-tight">
                  {pnlDisplay}
                </span>
                <span className="text-[10px] text-[#55555a] tracking-widest uppercase">
                  {latestMemory ? "LATEST MEMORY" : "AWAITING TRADE"}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Editorial Rationale */}
          <div className="lg:col-span-7 space-y-4">
            <span className="eyebrow">GLYPH PERSISTENT MEMORY</span>
            {latestMemory ? (
              <>
                <blockquote className="italic font-sans text-xl sm:text-2xl text-[#f0f0f1] font-light leading-snug">
                  &ldquo;{latestMemory.lesson}&rdquo;
                </blockquote>
                <div className="pt-2 font-mono text-xs text-[#85858a] tracking-wider uppercase space-y-1">
                  <div className="text-[#e7e7e9]">
                    THESIS VERDICT: {latestMemory.thesisResult}
                  </div>
                  {latestMemory.adaptation && (
                    <div className="text-[#55555a] text-[11px]">
                      {latestMemory.adaptation}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <blockquote className="italic font-sans text-lg sm:text-xl text-[#76767a] font-light leading-snug">
                  &ldquo;No reflections recorded. Autonomous reflection will be formed upon the completion of the first closed trade.&rdquo;
                </blockquote>
                <div className="pt-2 font-mono text-xs text-[#55555a] tracking-wider uppercase">
                  STATE: AWAITING POSITION RESOLUTION
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chronological Event Lifelog & Adaptive Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
          {/* Left: Chronological Event Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <span className="font-mono text-xs text-[#85858a] tracking-wider uppercase">
                RECENT LIFELOG ENTRIES
              </span>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                RECORDED // {recentEvents.length}
              </span>
            </div>

            {recentEvents.length > 0 ? (
              <EventTimeline events={recentEvents} />
            ) : (
              <div className="py-12 text-center font-mono text-xs text-[#55555a] border border-[#171717] bg-[#050505]">
                NO ECONOMIC EVENTS RECORDED
              </div>
            )}

            <div className="pt-4 flex items-center justify-between font-mono text-xs border-t border-[#141414]">
              <span className="text-[#55555a]">
                SHOWING RECENT {recentEvents.length} RECORDED EVENTS
              </span>
              <Link
                href="/life"
                className="text-[#6fe39a] hover:underline inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
              >
                <span>ACCESS COMPLETE LOG</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Right: How Glyph Learns from Previous Decisions */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#171717] lg:pl-10">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <span className="font-mono text-xs text-[#85858a] tracking-wider uppercase block">
                HOW GLYPH LEARNS (WEIGHT SHIFTS)
              </span>
              <span className="font-mono text-[10px] text-[#6fe39a] uppercase">
                {adaptiveLearnings.length > 0 ? "ACTIVE" : "STANDBY"}
              </span>
            </div>

            <div className="space-y-3">
              {adaptiveLearnings.length > 0 ? (
                adaptiveLearnings.map((learning) => (
                  <div
                    key={learning.id}
                    className="p-4 border border-[#181818] bg-[#050505] space-y-2 font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6fe39a] font-medium">
                        {learning.outcome} REFLECTION
                      </span>
                      <span className="text-[#55555a]">
                        {learning.thesisResult}
                      </span>
                    </div>

                    <p className="text-xs text-[#f0f0f2] font-light leading-relaxed font-sans">
                      {learning.lesson}
                    </p>

                    <div className="pt-2 text-[11px] text-[#85858a] border-t border-[#141414] space-y-1">
                      {learning.adaptation && (
                        <div>
                          <span className="text-[#55555a]">ADAPTATION: </span>
                          {learning.adaptation}
                        </div>
                      )}
                      {learning.weightShift && (
                        <div className="text-[#6fe39a]">
                          <span className="text-[#55555a]">WEIGHT SHIFT: </span>
                          {learning.weightShift}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 border border-[#181818] bg-[#050505] text-center font-mono text-xs text-[#55555a]">
                  NO ADAPTIVE UPDATES RECORDED
                </div>
              )}
            </div>

            {/* Survival Runtime Status Card */}
            <div className="p-4 border border-[#181818] bg-[#050505] space-y-2">
              <span className="font-mono text-[10px] text-[#55555a] uppercase tracking-wider block">
                AUTONOMOUS SURVIVAL RUNTIME
              </span>
              <div className="font-mono text-2xl text-[#f3f3f4] font-light">
                {agent.activeDays} DAYS {String(agent.activeHours).padStart(2, "0")} HOURS
              </div>
              <div className="text-[11px] text-[#6fe39a] font-mono flex items-center justify-between pt-1 border-t border-[#141414]">
                <span>Zero human overrides committed</span>
                <Link href="/trades" className="text-[#85858a] hover:text-[#f3f3f4] underline">
                  View trades →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
