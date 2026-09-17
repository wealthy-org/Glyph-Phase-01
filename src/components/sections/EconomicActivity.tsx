import React from "react";
import { RECENT_EVENTS } from "@/data/glyph";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventTimeline } from "@/components/sections/EventTimeline";

export const EconomicActivity: React.FC = () => {
  return (
    <section id="economic-activity" className="w-full py-16 sm:py-24 border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeader
          index="03"
          title="RECENT ECONOMIC EVENTS"
          description="CHRONOLOGICAL LIFELOG OF AUTONOMOUS DECISIONS"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <EventTimeline events={RECENT_EVENTS} />
          </div>

          {/* Contextual Narrative Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-[#181818] lg:pl-10">
            <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
              LIFELOG OBSERVATIONS
            </span>
            <div className="space-y-4 font-mono text-xs text-[#A0A0A0] leading-relaxed">
              <p>
                Every action committed by Glyph is cryptographically hashed and verified against its economic constitution.
              </p>
              <p>
                From Day 01 deployment to Day 13 tranche exit, the entity has executed with zero manual intervention.
              </p>
            </div>

            <div className="p-4 border border-[#181818] bg-[#0D0D0D] space-y-2">
              <span className="font-mono text-[11px] text-[#666666] uppercase block">
                SURVIVAL RUNTIME
              </span>
              <div className="font-mono text-xl text-[#F5F5F5]">
                13 DAYS 08 HOURS
              </div>
              <div className="text-[11px] text-[#8FB996] font-mono">
                Nominal health bounds maintained
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
