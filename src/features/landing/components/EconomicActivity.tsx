import { SectionHeader } from "@/components/ui/SectionHeader";
import { Separator } from "@/components/ui/separator";
import { ADAPTIVE_LEARNINGS, RECENT_EVENTS } from "@/data/glyph";
import { EventTimeline } from "@/features/landing/components/EventTimeline";
import { ArrowRight, Brain, History } from "lucide-react";
import Link from "next/link";
import React from "react";

export const EconomicActivity: React.FC = () => {
  return (
    <section id="economic-activity" className="w-full py-16 sm:py-24 border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <SectionHeader
            index="03"
            title="ECONOMIC HISTORY & LEARNING"
            description="CHRONOLOGICAL LIFELOG & ADAPTIVE MEMORY UPDATES"
          />

          {/* Direct Access to Full Economic Lifelog */}
          <div className="flex items-center gap-4 font-mono text-xs self-start sm:self-auto">
            <Link
              href="/life"
              className="inline-flex items-center gap-1.5 text-[#A0A0A0] hover:text-[#8FB996] transition-colors"
            >
              <History size={13} />
              <span>FULL LIFELOG (/life)</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Chronological Event Lifelog */}
          <div className="lg:col-span-7">
            <EventTimeline events={RECENT_EVENTS} />

            <div className="pt-4 flex items-center justify-between font-mono text-xs">
              <span className="text-[#666666]">
                SHOWING RECENT 6 OF 24 RECORDED SYSTEM EVENTS
              </span>
              <Link
                href="/life"
                className="text-[#8FB996] hover:underline inline-flex items-center gap-1"
              >
                <span>ACCESS COMPLETE ECONOMIC HISTORY</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Right: How Glyph Learns from Previous Decisions & Survival Runtime */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#181818] lg:pl-10">
            {/* Adaptive Learning Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8FB996] tracking-wider uppercase flex items-center gap-1.5">
                  <Brain size={13} />
                  <span>HOW GLYPH LEARNS (ADAPTIVE MEMORY)</span>
                </span>
                <span className="font-mono text-[10px] text-[#666666]">
                  CALIBRATED
                </span>
              </div>

              <div className="space-y-3">
                {ADAPTIVE_LEARNINGS.map((learning) => (
                  <div
                    key={learning.id}
                    className="p-3.5 border border-[#181818] bg-[#0D0D0D] space-y-2 font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8FB996]">{learning.triggerEvent}</span>
                      <span className="text-[#666666]">
                        DECISION #{learning.decisionId}
                      </span>
                    </div>

                    <p className="text-xs text-[#F5F5F5] font-light leading-relaxed font-sans">
                      {learning.insight}
                    </p>

                    <div className="pt-1 text-[11px] text-[#A0A0A0] border-t border-[#181818]/60 space-y-1">
                      <div>
                        <span className="text-[#666666]">ADAPTATION: </span>
                        {learning.adaptation}
                      </div>
                      <div className="text-[#8FB996]">
                        <span className="text-[#666666]">WEIGHT SHIFT: </span>
                        {learning.weightShift}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-[#181818]" />

            {/* Survival Runtime Card */}
            <div className="p-4 border border-[#181818] bg-[#0D0D0D] space-y-2">
              <span className="font-mono text-[11px] text-[#666666] uppercase block">
                AUTONOMOUS SURVIVAL RUNTIME
              </span>
              <div className="font-mono text-2xl text-[#F5F5F5]">
                13 DAYS 08 HOURS
              </div>
              <div className="text-[11px] text-[#8FB996] font-mono flex items-center justify-between">
                <span>Zero human overrides committed</span>
                <Link href="/trades" className="text-[#A0A0A0] hover:text-[#F5F5F5] underline">
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
