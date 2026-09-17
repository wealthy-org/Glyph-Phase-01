"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GLYPH_STATE } from "@/data/glyph";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink, ShieldCheck, ArrowRight, Activity, Terminal } from "lucide-react";

export const LiveState: React.FC = () => {
  const [copiedTx, setCopiedTx] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const data = GLYPH_STATE;

  const proof = data.decisionProof || {
    txHash: "0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
    network: "Robinhood Chain Testnet (Simulated Proof)",
    blockNumber: 19482014,
    stateRoot: "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3",
    timestamp: "Sep 17, 2026 · 11:42:09 UTC",
    explorerUrl: "https://sepolia.basescan.org/tx/0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
  };

  const copyTxHash = () => {
    navigator.clipboard.writeText(proof.txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const shortTxHash = `${proof.txHash.slice(0, 6)}...${proof.txHash.slice(-4)}`;

  return (
    <section id="live-state" className="w-full py-16 sm:py-24 border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeader
            index="01"
            title="LIVE STATE"
            description="OBSERVATION TELEMETRY • TELE-FEED #849"
          />

          {/* Active Being Telemetry Indicator */}
          <div className="flex items-center gap-3 font-mono text-xs border border-[#181818] bg-[#0D0D0D] px-3 py-1.5 self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FB996] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8FB996]" />
            </span>
            <span className="text-[#8FB996] tracking-wider font-medium uppercase">
              BEING ACTIVE
            </span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#666666]">CYCLE #{data.cognitiveCycle || 849}</span>
            <span className="text-[#333333]">|</span>
            <span className="text-[#A0A0A0]">TICK 4S AGO</span>
          </div>
        </div>

        {/* Editorial Financial Information Matrix */}
        <div className="space-y-0">
          {/* Row 1: Simulated Portfolio & PnL + Objective */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                  SIMULATED PORTFOLIO & PnL
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-[#A0A0A0] px-1.5 py-0 border-[#242424] bg-[#0D0D0D] rounded-none font-normal"
                >
                  PAPER ECONOMY
                </Badge>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-light text-[#F5F5F5] tracking-tight">
                  ${(data.simulatedPortfolio || 1351.63).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="font-mono text-lg text-[#8FB996] font-medium">
                  {data.simulatedPnL || "+$104.21"} ({data.simulatedPnLPercent || "+8.4%"})
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs text-[#666666] pt-1">
                <span>
                  TREASURY CASH: $
                  {data.treasury.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {data.paperEconomyLabel || "USD-SIM"}
                </span>
                <span className="text-[#242424]">/</span>
                <span className="text-[#8FB996]">ACTIVE ALLOCATION: 1 POSITION</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-2 lg:border-l lg:border-[#181818] lg:pl-10">
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
                <span className="text-[#242424]">/</span>
                <span className="text-[#8FB996]">ASYMMETRIC RISK-ADJUSTED ALPHA</span>
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
                <span className="text-[#242424]">/</span>
                <span>SIMULATED UNREALIZED: +$104.21</span>
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
            {/* Left: Latest Decision Inspection */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                    LATEST DECISION RECORD // #{data.latestDecisionId || "0012"}
                  </span>
                  <div className="font-mono text-base text-[#F5F5F5] font-normal">
                    {data.latestDecisionLabel || "BUY NVDA · 2× SIMULATED LEVERAGE"}
                  </div>
                </div>

                <Link href="/trades/0012">
                  <Button
                    variant="outline"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#242424] hover:border-[#666666] bg-[#0D0D0D] text-[#A0A0A0] hover:text-[#F5F5F5] font-mono text-xs tracking-wider uppercase rounded-none h-auto cursor-pointer"
                  >
                    <span>INSPECT DECISION</span>
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>

              {/* Decision Scores Grid */}
              <div className="grid grid-cols-3 gap-6 max-w-lg pt-1">
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
                      className="bg-[#8FB996] h-full"
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

            {/* Right: Onchain Verification Entry Point (Target for VERIFY ONCHAIN CTA) */}
            <div
              id="verify-decision"
              className="lg:col-span-4 space-y-3 lg:border-l lg:border-[#181818] lg:pl-10"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
                  RECORDED DECISION ONCHAIN
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-[#8FB996] border-[#8FB996]/30 bg-[#8FB996]/10 rounded-none font-normal"
                >
                  ATTESTED
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base text-[#F5F5F5]">
                    {shortTxHash}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={copyTxHash}
                    className="border-[#242424] hover:border-[#666666] bg-transparent text-[#A0A0A0] hover:text-[#F5F5F5] rounded-none cursor-pointer"
                    title="Copy transaction hash"
                    aria-label="Copy onchain transaction hash"
                  >
                    {copiedTx ? <Check size={13} className="text-[#8FB996]" /> : <Copy size={13} />}
                  </Button>
                </div>

                <div className="font-mono text-[11px] text-[#666666] space-y-0.5">
                  <div className="text-[#A0A0A0]">
                    PAYLOAD: DECISION #{data.latestDecisionId || "0012"} COMMIT
                  </div>
                  <div>NETWORK: ROBINHOOD CHAIN TESTNET</div>
                </div>
              </div>

              {/* Verify Onchain Action Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => setVerifyModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#8FB996]/40 hover:border-[#8FB996] bg-[#0D0D0D] hover:bg-[#141414] text-[#8FB996] hover:text-[#A7D1AE] font-mono text-xs tracking-wider uppercase rounded-none h-auto cursor-pointer transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>VERIFY ONCHAIN</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onchain Decision Verification Modal */}
      {verifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setVerifyModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0D0D0D] border border-[#242424] p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-modal-title"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div
                  id="verify-modal-title"
                  className="font-mono text-xs text-[#8FB996] uppercase tracking-wider flex items-center gap-2"
                >
                  <ShieldCheck size={14} />
                  <span>CRYPTOGRAPHIC ATTESTATION AUDIT</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setVerifyModalOpen(false)}
                  className="font-mono text-xs text-[#666666] hover:text-[#F5F5F5] border border-[#242424] rounded-none cursor-pointer"
                >
                  ESC [×]
                </Button>
              </div>
              <h4 className="text-lg font-normal text-[#F5F5F5]">
                Decision #{data.latestDecisionId || "0012"} State Commit
              </h4>
              <p className="text-xs text-[#A0A0A0] font-light leading-relaxed">
                Verification proof anchoring Glyph's autonomous market decision to the blockchain testnet.
              </p>
            </div>

            <Separator className="bg-[#242424]" />

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#666666] block">TRANSACTION HASH</span>
                <div className="flex items-center justify-between p-2.5 bg-[#080808] border border-[#181818] break-all">
                  <span className="text-[#F5F5F5] text-[11px] sm:text-xs">
                    {proof.txHash}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={copyTxHash}
                    className="ml-2 border-[#242424] text-[#A0A0A0] hover:text-[#F5F5F5] rounded-none shrink-0"
                    aria-label="Copy full hash"
                  >
                    {copiedTx ? <Check size={12} className="text-[#8FB996]" /> : <Copy size={12} />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[#666666] block">NETWORK</span>
                  <p className="text-[#F5F5F5]">{proof.network}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#666666] block">BLOCK NUMBER</span>
                  <p className="text-[#F5F5F5]">#{proof.blockNumber.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#666666] block">STATE MERKLE ROOT</span>
                <p className="p-2.5 bg-[#080808] border border-[#181818] text-[#A0A0A0] text-[11px] break-all">
                  {proof.stateRoot}
                </p>
              </div>

              <div className="p-3 bg-[#080808] border border-[#181818] text-[11px] text-[#666666] leading-relaxed">
                <span className="text-[#8FB996] font-medium block mb-1">
                  PROOF OF DECISION INTEGRITY
                </span>
                The payload contains the exact fundamental score (78), technical score (84), invalidation parameter ($168), and timestamp. Modifying any thesis reasoning after execution causes cryptographic invalidation.
              </div>

              <div className="p-2.5 bg-[#141410] border border-[#B8A77A]/20 text-[10px] text-[#B8A77A] leading-relaxed">
                DEMO / TESTNET PROOF: This cryptographic receipt demonstrates verification of an autonomous decision on a testnet chain. It does not execute real financial transactions.
              </div>
            </div>

            <Separator className="bg-[#242424]" />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a
                href={proof.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8FB996] hover:underline"
              >
                <span>VIEW IN TESTNET EXPLORER</span>
                <ExternalLink size={12} />
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 border border-[#242424] hover:bg-[#181818] text-[#F5F5F5] font-mono text-xs tracking-wider uppercase rounded-none h-auto cursor-pointer"
              >
                CLOSE AUDIT
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
