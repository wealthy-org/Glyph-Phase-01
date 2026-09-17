"use client";

import React, { useState } from "react";
import { LifeCategory } from "../types";
import { LIFE_CATEGORIES, GLYPH_LIFE_EVENTS } from "../data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LifeLogTimeline } from "./LifeLogTimeline";

export const LifeLogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory>("ALL EVENTS");

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

      {/* Category Filter Tabs */}
      <div className="space-y-6">
        <Tabs
          value={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val as LifeCategory)}
          className="w-full"
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

        {/* Thin horizontal divider before the timeline */}
        <Separator className="bg-[#171717] mt-6" />
      </div>

      {/* Chronological Vertical Timeline Spine */}
      <main>
        <LifeLogTimeline
          events={GLYPH_LIFE_EVENTS}
          selectedCategory={selectedCategory}
        />
      </main>

      {/* End of Log Observational Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
        <span>OBSERVATION STREAM: SYNCHRONIZED</span>
        <span>INDEX: 001-ALPHA // 7 COMMITS</span>
      </footer>
    </div>
  );
};
