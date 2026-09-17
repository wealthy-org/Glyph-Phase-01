"use client";

import React, { useState } from "react";
import { GLYPH_STATE } from "@/data/glyph";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";

export const LiveState: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const data = GLYPH_STATE;

  const copyAddress = () => {
    navigator.clipboard.writeText(data.onchainAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${data.onchainAddress.slice(0, 5)}...${data.onchainAddress.slice(-4)}`;

  return (
    <section id="live-state" className="w-full py-16 sm:py-24 border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeader
          index="01"
          title="LIVE STATE"
          description="OBSERVATION TELEMETRY • TELE-FEED #849"
        />

        {/* Editorial Financial Information Matrix */}
        <div className="space-y-0">
          {/* Row 1: Treasury & Objective */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-start">
            <div className="lg:col-span-4 space-y-2">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                TREASURY
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-light text-[#F5F5F5] tracking-tight">
                  ${data.treasury.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs text-[#8FB996] px-1.5 py-0.5 border border-[#181818] bg-[#0D0D0D] rounded-none font-normal"
                >
                  USD-SIM
                </Badge>
              </div>
              <p className="font-mono text-[11px] text-[#666666]">
                Available capital for allocation & margin reserves
              </p>
            </div>

            <div className="lg:col-span-8 space-y-2 lg:border-l lg:border-[#181818] lg:pl-10">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                CURRENT OBJECTIVE
              </span>
              <p className="text-xl sm:text-2xl text-[#F5F5F5] font-light leading-snug">
                {data.objective}
              </p>
              <div className="flex items-center gap-6 font-mono text-xs text-[#A0A0A0] pt-2">
                <span>POLICY: CONVEX SURVIVAL</span>
                <span className="text-[#242424]">/</span>
                <span>MAX DRAWDOWN: 15%</span>
              </div>
            </div>
          </div>

          <Separator className="bg-[#242424]" />

          {/* Row 2: Current Position & Conviction */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-start">
            <div className="lg:col-span-8 space-y-2">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                CURRENT POSITION
              </span>
              <div className="font-mono text-2xl sm:text-3xl text-[#F5F5F5] tracking-wide font-normal">
                {data.currentPosition}
              </div>
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#A0A0A0] pt-1">
                <Badge
                  variant="outline"
                  className="border-[#242424] bg-[#0D0D0D] text-[#8FB996] font-mono text-xs rounded-none font-normal flex items-center gap-1.5 py-0.5 px-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8FB996]" />
                  EXPOSURE ACTIVE
                </Badge>
                <span className="text-[#242424]">/</span>
                <span>ENTRY: $174.20</span>
                <span className="text-[#242424]">/</span>
                <span>TARGET: $192.00</span>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2 lg:border-l lg:border-[#181818] lg:pl-10">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                CONVICTION
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-light text-[#F5F5F5]">
                  {data.conviction}%
                </span>
                <span className="font-mono text-xs text-[#8FB996]">
                  HIGH CONFIDENCE
                </span>
              </div>
              <div className="w-full bg-[#181818] h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-[#8FB996] h-full transition-all duration-500"
                  style={{ width: `${data.conviction}%` }}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-[#242424]" />

          {/* Row 3: Latest Decision & Onchain Proof */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                LATEST DECISION SCORES
              </span>
              <div className="grid grid-cols-3 gap-6 max-w-lg">
                <div className="space-y-1">
                  <div className="text-xs text-[#A0A0A0]">Fundamental</div>
                  <div className="font-mono text-2xl sm:text-3xl text-[#F5F5F5]">
                    {data.latestDecision.fundamental}
                  </div>
                  <div className="w-full bg-[#181818] h-1 mt-1">
                    <div
                      className="bg-[#F5F5F5] h-full"
                      style={{ width: `${data.latestDecision.fundamental}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-[#A0A0A0]">Technical</div>
                  <div className="font-mono text-2xl sm:text-3xl text-[#F5F5F5]">
                    {data.latestDecision.technical}
                  </div>
                  <div className="w-full bg-[#181818] h-1 mt-1">
                    <div
                      className="bg-[#F5F5F5] h-full"
                      style={{ width: `${data.latestDecision.technical}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-[#A0A0A0]">Risk</div>
                  <div className="font-mono text-2xl sm:text-3xl text-[#B8A77A]">
                    {data.latestDecision.risk}
                  </div>
                  <div className="w-full bg-[#181818] h-1 mt-1">
                    <div
                      className="bg-[#B8A77A] h-full"
                      style={{ width: `${data.latestDecision.risk}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-3 lg:border-l lg:border-[#181818] lg:pl-10">
              <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                ONCHAIN
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base text-[#F5F5F5]">
                  {shortAddress}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={copyAddress}
                  className="border-[#242424] hover:border-[#666666] bg-transparent text-[#A0A0A0] hover:text-[#F5F5F5] rounded-none cursor-pointer"
                  title="Copy full address"
                  aria-label="Copy onchain address"
                >
                  {copied ? <Check size={13} className="text-[#8FB996]" /> : <Copy size={13} />}
                </Button>
              </div>
              <div className="font-mono text-[11px] text-[#666666] flex items-center gap-2">
                <span>IDENTITY PROOF: BASE SEPOLIA</span>
                <ExternalLink size={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
