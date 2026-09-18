"use client";

import React, { useState } from "react";
import { LifeEvent, LifeCategory } from "../types";
import { LIFE_CATEGORIES, GLYPH_LIFE_EVENTS } from "../data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LifeLogTimeline } from "./LifeLogTimeline";

interface LifeLogSectionProps {
  initialEvents?: LifeEvent[];
}

export const LifeLogSection: React.FC<LifeLogSectionProps> = ({ initialEvents }) => {
  const events = initialEvents && initialEvents.length > 0 ? initialEvents : GLYPH_LIFE_EVENTS;
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory>("ALL EVENTS");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="w-full max-w-[760px] mx-auto space-y-10 sm:space-y-12">
      {/* Editorial Header */}
      <header className="space-y-3">
        <span className="eyebrow">CHRONOLOGICAL // RECORD</span>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4]">
          GLYPH LIFE LOG
        </h1>
        <p className="text-sm sm:text-base text-[#85858a] font-light leading-relaxed">
          A chronological record of Glyph&apos;s economic existence.
        </p>
      </header>

      {/* Category Filter Tabs & Sort Order Toggle */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val as LifeCategory)}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 !h-auto group-data-horizontal/tabs:!h-auto justify-start border-0">
              {LIFE_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className={`rounded-none border font-mono text-xs tracking-wider uppercase px-3.5 py-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#f0f0f1] text-[#080808] border-[#dddddf] font-medium"
                        : "bg-[#050505] text-[#85858a] border-[#1a1a1a] hover:text-[#f3f3f4] hover:border-[#383838]"
                    }`}
                  >
                    {category}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Sort Order Selector */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSortOrder("desc")}
              className={`rounded-none border font-mono text-[11px] tracking-wider uppercase px-2.5 py-1.5 transition-colors cursor-pointer ${
                sortOrder === "desc"
                  ? "bg-[#f0f0f1] text-[#080808] border-[#dddddf] font-medium"
                  : "bg-[#050505] text-[#85858a] border-[#1a1a1a] hover:text-[#f3f3f4] hover:border-[#383838]"
              }`}
              title="Sort latest events first"
            >
              Newest First ↓
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("asc")}
              className={`rounded-none border font-mono text-[11px] tracking-wider uppercase px-2.5 py-1.5 transition-colors cursor-pointer ${
                sortOrder === "asc"
                  ? "bg-[#f0f0f1] text-[#080808] border-[#dddddf] font-medium"
                  : "bg-[#050505] text-[#85858a] border-[#1a1a1a] hover:text-[#f3f3f4] hover:border-[#383838]"
              }`}
              title="Sort chronological starting from Genesis"
            >
              Genesis First ↑
            </button>
          </div>
        </div>

        {/* Thin horizontal divider before the timeline */}
        <Separator className="bg-[#171717] mt-4" />
      </div>

      {/* Chronological Vertical Timeline Spine */}
      <main>
        <LifeLogTimeline
          events={sortedEvents}
          selectedCategory={selectedCategory}
        />
      </main>

      {/* End of Log Observational Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
        <span>OBSERVATION STREAM: SYNCHRONIZED</span>
        <span>INDEX: 001-ALPHA // {events.length} EVENTS</span>
      </footer>
    </div>
  );
};
