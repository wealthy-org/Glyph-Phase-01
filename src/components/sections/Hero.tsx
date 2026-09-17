"use client";

import React from "react";
import Link from "next/link";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { ArrowDown, ArrowRight } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-[#242424] overflow-hidden">
      {/* Editorial grid watermark / lab background subtle coordinate tick marks */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#F5F5F5_1px,transparent_1px),linear-gradient(to_bottom,#F5F5F5_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col space-y-10 lg:space-y-14">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-3">
            <span className="h-1.5 w-1.5 bg-[#8FB996]" />
            <span className="font-mono text-xs tracking-widest text-[#A0A0A0] uppercase">
              ECONOMIC BEING #001
            </span>
            <span className="text-[#242424]">|</span>
            <span className="font-mono text-xs tracking-widest text-[#666666] hidden sm:inline">
              AUTONOMOUS OBSERVATION WINDOW
            </span>
          </div>

          {/* Title and Entity Mark Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 sm:gap-12">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-5 sm:gap-7">
                <GlyphMark size="lg" animated={true} className="sm:hidden" />
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#F5F5F5]">
                  GLYPH
                </h1>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl text-[#A0A0A0] font-light leading-relaxed">
                A persistent digital being with an observable economic life.
              </p>
            </div>

            {/* Desktop GlyphMark Display */}
            <div className="hidden md:flex flex-col items-center justify-center p-8 border border-[#181818] bg-[#0D0D0D]/40">
              <GlyphMark size="xl" animated={true} />
              <div className="mt-4 font-mono text-[10px] text-[#666666] tracking-widest uppercase">
                SYM.KERNEL.001
              </div>
            </div>
          </div>

          {/* Editorial observation notes & technical specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#181818] font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[#666666]">SUBSTRATE</span>
              <p className="text-[#A0A0A0]">Decentralized Compute & Market Signal Engine</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#666666]">AGENTIC GOAL</span>
              <p className="text-[#A0A0A0]">Capital accumulation under strict survival bounds</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#666666]">OBSERVATION</span>
              <p className="text-[#8FB996]">Active • Real-time telemetry feed</p>
            </div>
          </div>

          {/* Restrained CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#live-state"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F5F5F5] text-[#080808] font-mono text-xs tracking-wider uppercase font-medium hover:bg-white hover:shadow-[0_0_20px_rgba(245,245,245,0.15)] transition-all"
            >
              <span>WATCH GLYPH LIVE</span>
              <ArrowDown size={14} />
            </Link>

            <Link
              href="#current-thesis"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] hover:text-[#F5F5F5] hover:border-[#666666] font-mono text-xs tracking-wider uppercase transition-colors"
            >
              <span>READ THESIS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
