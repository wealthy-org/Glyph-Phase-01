"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GLYPH_STATE } from "@/data/glyph";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

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
    <section id="live-state" className="w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="eyebrow">INTERFACE // LIVE</span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4] leading-[0.98]">
              Every decision,<br />
              fully legible.
            </h2>
          </div>

          {/* Active Being Telemetry Indicator */}
          <div className="flex items-center gap-3 font-mono text-[11px] border border-[#1a1a1a] bg-[#050505] px-3.5 py-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse" />
            <span className="text-[#6fe39a] tracking-wider font-medium uppercase">
              BEING ACTIVE
            </span>
            <span className="text-[#252525]">|</span>
            <span className="text-[#85858a]">CYCLE #{data.cognitiveCycle || 849}</span>
            <span className="text-[#252525]">|</span>
            <span className="text-[#55555a]">TICK 4S AGO</span>
          </div>
        </div>

        {/* The Signature Observability Terminal Window from glyph.html */}
        <div className="w-full border border-[#1b1b1b] bg-[#050505] overflow-hidden shadow-2xl relative">
          {/* Dashboard Window Chrome Top */}
          <div className="h-10 sm:h-11 px-4 flex items-center justify-between border-b border-[#1b1b1b] bg-[#080808]">
            <div className="flex items-center gap-6">
              {/* Window dots */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-[#38383c]" />
                <span className="w-2 h-2 rounded-full bg-[#38383c]" />
                <span className="w-2 h-2 rounded-full bg-[#38383c]" />
              </div>

              {/* Terminal Tabs */}
              <div className="flex items-center gap-4 sm:gap-6 font-mono text-[11px] uppercase tracking-wider">
                <span className="text-[#f3f3f4] border-b border-[#f3f3f4] pb-0.5 font-medium cursor-default">
                  GLYPH
                </span>
                <Link
                  href="/life"
                  className="text-[#606064] hover:text-[#a4a4a7] transition-colors"
                >
                  LIFE LOG
                </Link>
                <Link
                  href="/identity"
                  className="text-[#606064] hover:text-[#a4a4a7] transition-colors"
                >
                  IDENTITY
                </Link>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="inline-flex items-center gap-2 text-[#6fe39a] font-mono text-[10px] sm:text-[11px] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Terminal Body Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#050505]">
            {/* Left Panel: Chart & Simulated Treasury */}
            <div className="lg:col-span-8 border border-[#181818] bg-[#040404] p-5 sm:p-7 relative flex flex-col justify-between min-h-[320px]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] sm:text-xs text-[#55555a] tracking-wider uppercase block">
                    TREASURY (SIMULATED)
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-light text-[#e8e8e9] tracking-tight">
                    ${(data.simulatedPortfolio || 1351.63).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                    <span className="text-[#6fe39a]">
                      {data.simulatedPnL || "+$104.21"} ({data.simulatedPnLPercent || "+8.4%"})
                    </span>
                    <span className="text-[#333333]">·</span>
                    <span className="text-[#85858a]">CASH: ${data.treasury.toFixed(2)} USD-SIM</span>
                  </div>
                </div>

                <div className="px-3 py-1 border border-[#292929] bg-[#101010] text-[#85858a] font-mono text-[10px] sm:text-xs uppercase tracking-wider">
                  {data.currentPosition || "NVDA · 2× SIM"}
                </div>
              </div>

              {/* Graphical Visual Bars from glyph.html */}
              <div className="pt-12 sm:pt-16 pb-2">
                <div className="h-28 sm:h-36 flex items-end gap-3 sm:gap-4 px-2 border-b border-[#141414] pb-2">
                  <div className="flex-1 bg-[#1b1b1b] h-[34%] hover:bg-[#252525] transition-all" title="Day 1: $1,000" />
                  <div className="flex-1 bg-[#222222] h-[22%] hover:bg-[#2b2b2b] transition-all" title="Day 2: $940" />
                  <div className="flex-1 bg-[#2f2f2f] h-[48%] hover:bg-[#383838] transition-all" title="Day 3: $1,120" />
                  <div className="flex-1 bg-[#444444] h-[39%] hover:bg-[#505050] transition-all" title="Day 4: $1,060" />
                  <div
                    className="flex-1 bg-[#6fe39a] h-[30%] shadow-[0_0_15px_rgba(111,227,154,0.25)] hover:bg-[#8ef5b4] transition-all"
                    title="Active Position: NVDA Long"
                  />
                  <div
                    className="flex-1 bg-[#f0f0f0] h-[61%] shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-white transition-all"
                    title="Current NAV: $1,351.63"
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-[#444448] uppercase tracking-wider pt-2 px-2">
                  <span>EPOCH 001 GENESIS</span>
                  <span>CURRENT CYCLE #{data.cognitiveCycle || 849}</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Latest Decision Breakdown & Onchain Attestation */}
            <div className="lg:col-span-4 border border-[#181818] bg-[#040404] p-5 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#141414] pb-3">
                  <span className="font-mono text-[10px] sm:text-xs text-[#59595e] tracking-wider uppercase block">
                    LATEST DECISION
                  </span>
                  <span className="font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider">
                    VERIFIED
                  </span>
                </div>

                {/* Score Breakdown Rows matching glyph.html */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                    <span className="text-[#c6c6c9] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                      Fundamental
                    </span>
                    <span className="text-[#f3f3f4] font-medium">
                      {data.latestDecision.fundamental}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                    <span className="text-[#c6c6c9] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                      Technical
                    </span>
                    <span className="text-[#6fe39a] font-medium">
                      {data.latestDecision.technical}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                    <span className="text-[#c6c6c9] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                      Risk
                    </span>
                    <span className="text-[#b8a77a] font-medium">
                      {data.latestDecision.risk}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                    <span className="text-[#c6c6c9] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                      Conviction
                    </span>
                    <span className="text-[#f3f3f4] font-medium">
                      {data.conviction}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Onchain Record & Attestation Button */}
              <div id="verify-decision" className="pt-4 border-t border-[#171717] space-y-3">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-[#55555a] uppercase tracking-widest block">
                    ONCHAIN RECORD
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8f8f93] hover:text-[#f3f3f4] transition-colors">
                      {shortTxHash}
                    </span>
                    <button
                      type="button"
                      onClick={copyTxHash}
                      className="text-[#55555a] hover:text-[#f3f3f4] text-xs p-1"
                      title="Copy full hash"
                      aria-label="Copy onchain transaction hash"
                    >
                      {copiedTx ? <Check size={13} className="text-[#6fe39a]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => setVerifyModalOpen(true)}
                    className="w-full h-9 bg-transparent hover:bg-[#101010] text-[#6fe39a] hover:text-[#8ef5b4] border border-[#6fe39a]/40 hover:border-[#6fe39a] font-sans text-xs font-normal transition-colors rounded-[3px] flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={13} />
                    <span>Verify Onchain</span>
                  </Button>

                  <Link href="/trades/0012">
                    <Button
                      variant="secondary"
                      className="w-full h-9 text-xs font-sans font-normal rounded-[3px] flex items-center justify-center gap-1.5"
                    >
                      <span>Inspect Decision</span>
                      <ArrowRight size={12} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Current Objective Bar at Terminal Bottom */}
          <div className="px-5 py-3.5 bg-[#030303] border-t border-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3 text-[#85858a]">
              <span className="text-[#55555a] uppercase tracking-wider text-[10px]">OBJECTIVE:</span>
              <span className="text-[#f3f3f4] font-light truncate max-w-xl">
                {data.objective}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#69696d] uppercase tracking-wider shrink-0">
              <span>POLICY: CONVEX SURVIVAL</span>
              <span className="text-[#252525]">/</span>
              <span>MAX DRAWDOWN: 15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Attestation Modal (Preserved Functionality) */}
      {verifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setVerifyModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#080808] border border-[#202020] p-6 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-modal-title"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div
                  id="verify-modal-title"
                  className="font-mono text-xs text-[#6fe39a] uppercase tracking-wider flex items-center gap-2"
                >
                  <ShieldCheck size={14} />
                  <span>CRYPTOGRAPHIC ATTESTATION AUDIT</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="font-mono text-xs text-[#666666] hover:text-[#f3f3f4] border border-[#202020] px-2 py-0.5 cursor-pointer"
                >
                  ESC [×]
                </button>
              </div>
              <h4 className="text-lg font-light text-[#f3f3f4]">
                Decision #{data.latestDecisionId || "0012"} State Commit
              </h4>
              <p className="text-xs text-[#85858a] font-light leading-relaxed">
                Verification proof anchoring Glyph&apos;s autonomous market decision to the blockchain testnet.
              </p>
            </div>

            <div className="h-px bg-[#171717]" />

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#55555a] block text-[11px] uppercase">TRANSACTION HASH</span>
                <div className="flex items-center justify-between p-2.5 bg-[#030303] border border-[#171717] break-all">
                  <span className="text-[#f3f3f4] text-[11px] sm:text-xs">
                    {proof.txHash}
                  </span>
                  <button
                    type="button"
                    onClick={copyTxHash}
                    className="ml-2 p-1 text-[#85858a] hover:text-[#f3f3f4]"
                    aria-label="Copy full hash"
                  >
                    {copiedTx ? <Check size={13} className="text-[#6fe39a]" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[#55555a] block text-[11px] uppercase">NETWORK</span>
                  <p className="text-[#f3f3f4] text-xs">{proof.network}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#55555a] block text-[11px] uppercase">BLOCK NUMBER</span>
                  <p className="text-[#f3f3f4] text-xs">#{proof.blockNumber.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#55555a] block text-[11px] uppercase">STATE MERKLE ROOT</span>
                <p className="p-2.5 bg-[#030303] border border-[#171717] text-[#85858a] text-[10px] sm:text-[11px] break-all">
                  {proof.stateRoot}
                </p>
              </div>

              <div className="p-3 bg-[#030303] border border-[#171717] text-[11px] text-[#76767a] leading-relaxed">
                <span className="text-[#6fe39a] font-medium block mb-1">
                  PROOF OF DECISION INTEGRITY
                </span>
                The payload contains the exact fundamental score ({data.latestDecision.fundamental}), technical score ({data.latestDecision.technical}), invalidation parameter ($168), and timestamp. Modifying any thesis reasoning after execution causes cryptographic invalidation.
              </div>
            </div>

            <div className="h-px bg-[#171717]" />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a
                href={proof.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6fe39a] hover:underline uppercase"
              >
                <span>VIEW IN TESTNET EXPLORER</span>
                <ExternalLink size={12} />
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyModalOpen(false)}
                className="h-8 px-4 rounded-[3px] text-xs font-sans font-normal"
              >
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
