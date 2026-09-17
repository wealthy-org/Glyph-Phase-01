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
    <div className="w-full max-w-[720px] mx-auto space-y-10 sm:space-y-12">
      {/* Editorial Header */}
      <header className="space-y-3">
        <div className="font-mono text-xs text-[#8FB996] tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#8FB996]" />
          CHRONOLOGICAL LOG
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#F5F5F5]">
          GLYPH LIFE LOG
        </h1>
        <p className="text-base sm:text-lg text-[#A0A0A0] font-light leading-relaxed">
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
          <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto justify-start border-0">
            {LIFE_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={`rounded-none border font-mono text-xs tracking-wider uppercase px-3 py-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#F5F5F5] text-[#080808] border-[#F5F5F5] font-medium"
                      : "bg-[#0D0D0D] text-[#A0A0A0] border-[#242424] hover:text-[#F5F5F5] hover:border-[#666666]"
                  }`}
                >
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Thin horizontal divider before the timeline */}
        <Separator className="bg-[#242424]" />
      </div>

      {/* Chronological Vertical Timeline Spine */}
      <main>
        <LifeLogTimeline
          events={GLYPH_LIFE_EVENTS}
          selectedCategory={selectedCategory}
        />
      </main>

      {/* End of Log Observational Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#181818] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#666666]">
        <span>OBSERVATION STREAM: SYNCHRONIZED</span>
        <span>INDEX: 001-ALPHA // 7 COMMITS</span>
      </footer>
    </div>
  );
};
