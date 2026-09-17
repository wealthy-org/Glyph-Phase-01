"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CURRENT_THESIS } from "@/data/glyph";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export const CurrentThesis: React.FC = () => {
  const thesis = CURRENT_THESIS;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="current-thesis" className="w-full py-16 sm:py-24 border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeader
          index="02"
          title="CURRENT THESIS"
          description="QUANTITATIVE & DISCRETIONARY CONVERGENCE"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Asset, Direction, & Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-2.5 py-1 border-[#242424] bg-[#0D0D0D] font-mono text-xs text-[#8FB996] rounded-none font-normal"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FB996]" />
                DIRECTION ACTIVE
              </Badge>
              <div className="flex items-baseline gap-4">
                <h3 className="font-mono text-4xl sm:text-5xl font-light text-[#F5F5F5] tracking-tight">
                  {thesis.asset}
                </h3>
                <span className="font-mono text-2xl sm:text-3xl text-[#666666]">/</span>
                <span className="font-mono text-3xl sm:text-4xl text-[#8FB996] font-normal">
                  {thesis.direction}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-l-2 border-[#242424] pl-6 py-2">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                CORE SYNTHESIS
              </span>
              <p className="text-base sm:text-lg text-[#F5F5F5] font-light leading-relaxed">
                {thesis.summary}
              </p>
            </div>

            {/* Invalidation Criteria */}
            <div className="p-4 border border-[#242424] bg-[#0D0D0D] flex items-start gap-3.5">
              <ShieldAlert size={18} className="text-[#B8A77A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-mono text-xs text-[#B8A77A] uppercase tracking-wider block">
                  INVALIDATION BOUNDARY
                </span>
                <p className="font-mono text-sm text-[#F5F5F5]">
                  {thesis.invalidation}
                </p>
              </div>
            </div>

            {/* CTA using shadcn Button */}
            <div>
              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#242424] hover:border-[#666666] bg-[#0D0D0D] text-[#F5F5F5] font-mono text-xs tracking-wider uppercase transition-colors rounded-none h-auto cursor-pointer"
              >
                <span>READ FULL THESIS</span>
                <ArrowUpRight size={14} />
              </Button>
            </div>
          </div>

          {/* Right Column: Score Breakdown & Analytical Vectors */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#181818] lg:pl-10">
            <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
              ANALYSIS BREAKDOWN
            </span>

            <div className="space-y-5">
              {/* Fundamental */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#A0A0A0]">Fundamental</span>
                  <span className="text-[#F5F5F5]">{thesis.fundamental} / 100</span>
                </div>
                <div className="w-full bg-[#181818] h-1.5 overflow-hidden">
                  <div
                    className="bg-[#F5F5F5] h-full transition-all duration-300"
                    style={{ width: `${thesis.fundamental}%` }}
                  />
                </div>
              </div>

              {/* Technical */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#A0A0A0]">Technical</span>
                  <span className="text-[#F5F5F5]">{thesis.technical} / 100</span>
                </div>
                <div className="w-full bg-[#181818] h-1.5 overflow-hidden">
                  <div
                    className="bg-[#8FB996] h-full transition-all duration-300"
                    style={{ width: `${thesis.technical}%` }}
                  />
                </div>
              </div>

              {/* Catalyst */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#A0A0A0]">Catalyst Vector</span>
                  <span className="text-[#8FB996] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {thesis.catalyst}
                  </span>
                </div>
                <div className="w-full bg-[#181818] h-1.5 overflow-hidden">
                  <div className="bg-[#8FB996] h-full w-full opacity-80" />
                </div>
              </div>

              {/* Risk */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#A0A0A0]">Risk Coefficient</span>
                  <span className="text-[#B8A77A]">{thesis.risk} / 100</span>
                </div>
                <div className="w-full bg-[#181818] h-1.5 overflow-hidden">
                  <div
                    className="bg-[#B8A77A] h-full transition-all duration-300"
                    style={{ width: `${thesis.risk}%` }}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-[#181818]" />

            <div className="font-mono text-[11px] text-[#666666] leading-relaxed">
              MODEL PARAMS: Multi-modal macro data + Blackwell server delivery pipeline + short-term gamma exposure.
            </div>
          </div>
        </div>
      </div>

      {/* Observation Modal for Read Full Thesis */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0D0D0D] border border-[#242424] p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-[#A0A0A0] uppercase">
                  THESIS MEMORANDUM // #{thesis.asset}-L1
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setModalOpen(false)}
                  className="font-mono text-xs text-[#666666] hover:text-[#F5F5F5] border border-[#242424] rounded-none cursor-pointer"
                >
                  ESC [×]
                </Button>
              </div>
              <Separator className="bg-[#242424]" />
            </div>

            <div className="space-y-4 text-sm text-[#A0A0A0] leading-relaxed font-light">
              <div className="p-3 bg-[#080808] border border-[#181818] space-y-1.5">
                <div className="font-mono text-xs text-[#8FB996] uppercase flex items-center justify-between">
                  <span>FUNDAMENTAL THESIS</span>
                  <span className="text-[#F5F5F5]">{thesis.fundamental} / 100</span>
                </div>
                <p className="text-xs text-[#F5F5F5] font-light">
                  Autonomous agent reasoning cycle evaluated Q3/Q4 hyperscaler CapEx guidance. Commitments indicate sustained datacenter buildouts through 2026. Custom ASIC competition remains fragmented, preserving high gross margin resilience.
                </p>
              </div>

              <div className="p-3 bg-[#080808] border border-[#181818] space-y-1.5">
                <div className="font-mono text-xs text-[#8FB996] uppercase flex items-center justify-between">
                  <span>TECHNICAL THESIS</span>
                  <span className="text-[#F5F5F5]">{thesis.technical} / 100</span>
                </div>
                <p className="text-xs text-[#F5F5F5] font-light">
                  Bullish trend structure confirmed. Price reclaimed 50-day moving average on above-average volume with clean breakout above $170 consolidation range.
                </p>
              </div>

              <div className="bg-[#080808] p-3 border border-[#181818] font-mono text-xs space-y-1">
                <div className="text-[#666666]">RISK & INVALIDATION CONSTRAINTS:</div>
                <div className="text-[#F5F5F5]">• Simulated Leverage: 2.0×</div>
                <div className="text-[#B8A77A]">• Invalidation Level: {thesis.invalidation}</div>
                <div className="text-[#A0A0A0]">• Holding Horizon: 14 - 21 Trading Days</div>
              </div>
            </div>

            <div className="space-y-4">
              <Separator className="bg-[#242424]" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/trades/0012"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8FB996] hover:underline"
                >
                  <span>INSPECT ASSOCIATED TRADE #0012</span>
                  <ArrowUpRight size={12} />
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#242424] hover:bg-[#181818] text-[#F5F5F5] font-mono text-xs tracking-wider uppercase rounded-none h-auto cursor-pointer"
                >
                  CLOSE MEMORANDUM
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
