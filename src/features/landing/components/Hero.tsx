"use client";

import React from "react";
import Link from "next/link";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-[#242424] overflow-hidden">
      {/* Editorial grid watermark / lab background subtle coordinate tick marks */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#F5F5F5_1px,transparent_1px),linear-gradient(to_bottom,#F5F5F5_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col space-y-10 lg:space-y-14">
          {/* Eyebrow Label with shadcn Badge */}
          <div className="inline-flex items-center gap-3">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-2.5 py-1 border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] font-mono text-xs tracking-widest uppercase rounded-none font-normal"
            >
              <span className="h-1.5 w-1.5 bg-[#8FB996] animate-pulse" />
              ECONOMIC BEING #001
            </Badge>
            <span className="text-[#242424]">|</span>
            <span className="font-mono text-xs tracking-widest text-[#666666] hidden sm:inline">
              LIVE OBSERVATION TERMINAL
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
            <div className="relative group hidden md:flex flex-col items-center justify-center p-8 lg:p-10 border border-[#181818] bg-[#0D0D0D]/60 backdrop-blur-sm overflow-hidden select-none">
              {/* Corner crosshairs / technical brackets */}
              <div className="absolute top-2 left-2 font-mono text-[10px] text-[#333333] select-none leading-none pointer-events-none">+</div>
              <div className="absolute top-2 right-2 font-mono text-[10px] text-[#333333] select-none leading-none pointer-events-none">+</div>
              <div className="absolute bottom-2 left-2 font-mono text-[10px] text-[#333333] select-none leading-none pointer-events-none">+</div>
              <div className="absolute bottom-2 right-2 font-mono text-[10px] text-[#333333] select-none leading-none pointer-events-none">+</div>

              {/* Modern pulse wave ripples & glowing aura */}
              <div className="relative flex items-center justify-center py-2">
                {/* Luminous breathing aura */}
                <div className="absolute w-32 h-32 lg:w-36 lg:h-36 rounded-full bg-[radial-gradient(circle,rgba(143,185,150,0.18)_0%,rgba(143,185,150,0.05)_45%,transparent_75%)] animate-aura-breath pointer-events-none blur-sm" />

                {/* Concentric diamond sonar pulse rings */}
                <div className="absolute w-20 h-20 lg:w-24 lg:h-24 border border-[#8FB996]/30 pointer-events-none animate-sonar-ring-1" />
                <div className="absolute w-20 h-20 lg:w-24 lg:h-24 border border-[#F5F5F5]/20 pointer-events-none animate-sonar-ring-2" />

                {/* Sized slightly bigger (2xl) with modern pulse animation */}
                <GlyphMark size="2xl" animated={true} pulseVariant="modern" />
              </div>

              {/* Telemetry metadata status */}
              <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-[#666666] tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8FB996] animate-pulse" />
                <span>SYM.KERNEL.001</span>
              </div>
            </div>
          </div>

          {/* Editorial observation notes & technical specs */}
          <div className="space-y-4">
            <Separator className="bg-[#181818]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
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
          </div>

          {/* Restrained CTAs using shadcn Button */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Primary CTA */}
            <Link href="#live-state">
              <Button
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F5F5F5] text-[#080808] font-mono text-xs tracking-wider uppercase font-medium hover:bg-white hover:shadow-[0_0_20px_rgba(245,245,245,0.15)] transition-all rounded-none h-auto cursor-pointer"
              >
                <span>WATCH GLYPH LIVE</span>
                <ArrowDown size={14} />
              </Button>
            </Link>

            {/* Secondary CTA: Read Thesis */}
            <Link href="#current-thesis">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] hover:text-[#F5F5F5] hover:border-[#666666] font-mono text-xs tracking-wider uppercase transition-colors rounded-none h-auto cursor-pointer"
              >
                <span>READ THESIS</span>
                <ArrowRight size={14} />
              </Button>
            </Link>

            {/* Secondary CTA: Verify Onchain */}
            <Link href="#verify-decision">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] hover:text-[#8FB996] hover:border-[#8FB996]/50 font-mono text-xs tracking-wider uppercase transition-colors rounded-none h-auto cursor-pointer"
              >
                <ShieldCheck size={14} className="text-[#8FB996]" />
                <span>VERIFY ONCHAIN</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
