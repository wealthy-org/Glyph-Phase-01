"use client";

import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/GridBackground";
import { AlertTriangle, ArrowRight, Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  LandingAgentMeta,
  LandingLatestDecision,
  LandingPositionItem,
  LandingTreasuryData,
} from "../types";

interface LiveStateProps {
  treasury: LandingTreasuryData;
  openPositions: LandingPositionItem[];
  latestDecision: LandingLatestDecision | null;
  agent: LandingAgentMeta;
  cognitiveCycleCount: number;
}

export const LiveState: React.FC<LiveStateProps> = ({
  treasury,
  openPositions,
  latestDecision,
  agent,
  cognitiveCycleCount,
}) => {
  const [copiedTx, setCopiedTx] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const txHash = latestDecision?.transactionHash || null;
  const shortTxHash = txHash
    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
    : "NO ONCHAIN ATTESTATION";

  const copyTxHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const pnlSign = treasury.pnlDollar >= 0 ? "+" : "";
  const pnlColor =
    treasury.pnlDollar > 0
      ? "text-[#6fe39a]"
      : treasury.pnlDollar < 0
        ? "text-[#c47a7a]"
        : "text-[#85858a]";

  const primaryPosition = openPositions[0];
  const positionBadgeText = primaryPosition
    ? openPositions.length > 1
      ? `${openPositions.length} OPEN · ${primaryPosition.asset} ${primaryPosition.leverage}×`
      : `${primaryPosition.asset} · ${primaryPosition.side} · ${primaryPosition.leverage}× SIM`
    : "0 OPEN POSITIONS";

  return (
    <section id="live-state" className="relative w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000] overflow-hidden">
      {/* Subtle modern thin grid background */}
      <GridBackground glowColor="emerald" intensity="medium" gridSize={36} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Active Being Telemetry Indicator */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3 font-mono text-[11px] border border-[#1a1a1a] bg-[#050505] px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse" />
            <span className="text-[#6fe39a] tracking-wider font-medium uppercase">
              BEING {agent.status}
            </span>
            <span className="text-[#252525]">|</span>
            <span className="text-[#85858a]">CYCLE #{cognitiveCycleCount}</span>
            <span className="text-[#252525]">|</span>
            <span className="text-[#55555a]">ID #{agent.agentId}</span>
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
                  {agent.name}
                </span>
                <Link
                  href="/life"
                  className="text-[#606064] hover:text-[#a4a4a7] transition-colors"
                >
                  LIFE LOG
                </Link>
                <Link
                  href="/trades"
                  className="text-[#606064] hover:text-[#a4a4a7] transition-colors"
                >
                  TRADES
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
                    TOTAL PORTFOLIO EQUITY (NAV)
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-light text-[#e8e8e9] tracking-tight">
                    ${treasury.totalEquity.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                    <span className={pnlColor}>
                      {pnlSign}${Math.abs(treasury.pnlDollar).toFixed(2)} ({pnlSign}
                      {treasury.pnlPercent.toFixed(1)}%)
                    </span>
                    <span className="text-[#333333]">·</span>
                    <span className="text-[#85858a]">
                      CASH: ${treasury.cashBalance.toFixed(2)} {treasury.currency}
                    </span>
                    {treasury.allocatedMargin > 0 && (
                      <>
                        <span className="text-[#333333]">·</span>
                        <span className="text-[#69696d]">
                          MARGIN: ${treasury.allocatedMargin.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="px-3 py-1 border border-[#292929] bg-[#101010] text-[#85858a] font-mono text-[10px] sm:text-xs uppercase tracking-wider">
                  {positionBadgeText}
                </div>
              </div>

              {/* Graphical Visual Bars dynamically computed from authoritative portfolio state */}
              <div className="pt-10 sm:pt-14 pb-2">
                {(() => {
                  const totalNotional = openPositions.reduce((sum, p) => sum + p.notional, 0);
                  const baseMax = Math.max(
                    treasury.totalEquity,
                    treasury.initialCapital,
                    totalNotional,
                    100
                  );
                  const seedH = Math.max(18, Math.min(95, Math.round((treasury.initialCapital / baseMax) * 85)));
                  const cashH = Math.max(18, Math.min(95, Math.round((treasury.cashBalance / baseMax) * 85)));
                  const marginH =
                    treasury.allocatedMargin > 0
                      ? Math.max(18, Math.min(95, Math.round((treasury.allocatedMargin / baseMax) * 85)))
                      : 6;
                  const notionalH =
                    totalNotional > 0
                      ? Math.max(20, Math.min(95, Math.round((totalNotional / baseMax) * 85)))
                      : 6;
                  const navH = Math.max(20, Math.min(95, Math.round((treasury.totalEquity / baseMax) * 85)));

                  const chartBars = [
                    {
                      label: "SEED",
                      value: `$${Math.round(treasury.initialCapital)}`,
                      height: `${seedH}%`,
                      bg: "bg-[#1f1f1f] hover:bg-[#2b2b2b]",
                      title: `Initial Seed Capital: $${treasury.initialCapital.toFixed(2)}`,
                    },
                    {
                      label: "CASH",
                      value: `$${Math.round(treasury.cashBalance)}`,
                      height: `${cashH}%`,
                      bg: "bg-[#282828] hover:bg-[#333333]",
                      title: `Available Unallocated Cash: $${treasury.cashBalance.toFixed(2)}`,
                    },
                    {
                      label: "MARGIN",
                      value: `$${Math.round(treasury.allocatedMargin)}`,
                      height: `${marginH}%`,
                      bg: treasury.allocatedMargin > 0 ? "bg-[#3d3d42] hover:bg-[#4d4d54]" : "bg-[#151515]",
                      title: `Committed Position Margin: $${treasury.allocatedMargin.toFixed(2)}`,
                    },
                    {
                      label: "NOTIONAL",
                      value: `$${Math.round(totalNotional)}`,
                      height: `${notionalH}%`,
                      bg:
                        totalNotional > 0
                          ? "bg-[#457858] hover:bg-[#52936a]"
                          : "bg-[#151515]",
                      title: `Total Market Exposure (Notional): $${totalNotional.toFixed(2)}`,
                    },
                    {
                      label: "NAV",
                      value: `$${Math.round(treasury.totalEquity)}`,
                      height: `${navH}%`,
                      bg: "bg-[#6fe39a] shadow-[0_0_15px_rgba(111,227,154,0.3)] hover:bg-[#8ef5b4]",
                      title: `Net Total Equity (NAV): $${treasury.totalEquity.toFixed(2)}`,
                    },
                  ];

                  return (
                    <>
                      <div className="h-28 sm:h-36 flex items-end gap-3 sm:gap-4 px-2 border-b border-[#141414] pb-2">
                        {chartBars.map((bar, idx) => (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col justify-end items-center h-full group/bar"
                          >
                            <span className="font-mono text-[9px] text-[#55555a] group-hover/bar:text-[#f3f3f4] transition-colors pb-1 tabular-nums">
                              {bar.value}
                            </span>
                            <div
                              style={{ height: bar.height }}
                              className={`w-full ${bar.bg} transition-all duration-500 rounded-t-[1px]`}
                              title={bar.title}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-[#55555a] uppercase tracking-wider pt-2 px-2">
                        {chartBars.map((bar, idx) => (
                          <span key={idx} className="flex-1 text-center truncate">
                            {bar.label}
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()}
                <div className="flex justify-between font-mono text-[9px] text-[#3e3e42] uppercase tracking-wider pt-2 px-2 border-t border-[#101010] mt-2">
                  <span>EPOCH 001 GENESIS</span>
                  <span>CURRENT CYCLE #{cognitiveCycleCount}</span>
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
                  {latestDecision ? (
                    latestDecision.policyResult === "APPROVED" ? (
                      <span className="font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider">
                        APPROVED
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#b8a77a] uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={11} />
                        <span>REJECTED</span>
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[10px] text-[#55555a] uppercase tracking-wider">
                      NO DECISIONS
                    </span>
                  )}
                </div>

                {latestDecision ? (
                  <>
                    {/* Score Breakdown Rows */}
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                        <span className="text-[#c6c6c9] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                          Target Asset
                        </span>
                        <span className="text-[#f3f3f4] font-medium">
                          {latestDecision.asset} · {latestDecision.action}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                        <span className="text-[#c6c6c9] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                          Fundamental
                        </span>
                        <span className="text-[#f3f3f4] font-medium">
                          {latestDecision.fundamentalScore ?? "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                        <span className="text-[#c6c6c9] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                          Technical
                        </span>
                        <span className="text-[#6fe39a] font-medium">
                          {latestDecision.technicalScore ?? "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                        <span className="text-[#c6c6c9] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                          Risk Score
                        </span>
                        <span className="text-[#b8a77a] font-medium">
                          {latestDecision.riskScore ?? "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#111111]">
                        <span className="text-[#c6c6c9] flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#6e6e72] rounded-full" />
                          Conviction
                        </span>
                        <span className="text-[#f3f3f4] font-medium">
                          {latestDecision.conviction}%
                        </span>
                      </div>
                    </div>

                    {latestDecision.policyRejectReason && (
                      <div className="p-2 border border-[#b8a77a]/30 bg-[#b8a77a]/5 text-[10px] font-mono text-[#b8a77a] leading-tight">
                        POLICY: {latestDecision.policyRejectReason}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center text-xs font-mono text-[#55555a]">
                    NO DECISION RECORDED YET
                  </div>
                )}
              </div>

              {/* Onchain Record & Attestation Button */}
              <div id="verify-decision" className="pt-4 border-t border-[#171717] space-y-3">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-[#55555a] uppercase tracking-widest block">
                    ONCHAIN RECORD
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8f8f93] hover:text-[#f3f3f4] transition-colors truncate max-w-[200px]">
                      {shortTxHash}
                    </span>
                    {txHash && (
                      <button
                        type="button"
                        onClick={copyTxHash}
                        className="text-[#55555a] hover:text-[#f3f3f4] text-xs p-1 cursor-pointer"
                        title="Copy full hash"
                        aria-label="Copy onchain transaction hash"
                      >
                        {copiedTx ? <Check size={13} className="text-[#6fe39a]" /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  {txHash ? (
                    <Button
                      type="button"
                      onClick={() => setVerifyModalOpen(true)}
                      className="w-full h-9 bg-transparent hover:bg-[#101010] text-[#6fe39a] hover:text-[#8ef5b4] border border-[#6fe39a]/40 hover:border-[#6fe39a] font-sans text-xs font-normal transition-colors rounded-[3px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={13} />
                      <span>Verify Onchain</span>
                    </Button>
                  ) : (
                    <div className="w-full h-9 border border-[#1f1f1f] bg-[#030303] text-[#55555a] font-mono text-[11px] flex items-center justify-center">
                      NO ONCHAIN ATTESTATION
                    </div>
                  )}

                  {latestDecision?.tradeId ? (
                    <Link href={`/trades/${latestDecision.tradeNumber || latestDecision.tradeId}`}>
                      <Button
                        variant="secondary"
                        className="w-full h-9 text-xs font-sans font-normal rounded-[3px] flex items-center justify-center gap-1.5"
                      >
                        <span>Inspect Trade {latestDecision.tradeNumber || ""}</span>
                        <ArrowRight size={12} />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/trades">
                      <Button
                        variant="secondary"
                        className="w-full h-9 text-xs font-sans font-normal rounded-[3px] flex items-center justify-center gap-1.5"
                      >
                        <span>View All Trades</span>
                        <ArrowRight size={12} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Objective Bar at Terminal Bottom */}
          <div className="px-5 py-3.5 bg-[#030303] border-t border-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3 text-[#85858a]">
              <span className="text-[#55555a] uppercase tracking-wider text-[10px]">OBJECTIVE:</span>
              <span className="text-[#f3f3f4] font-light truncate max-w-xl">
                {agent.objective}
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

      {/* Cryptographic Attestation Modal */}
      {verifyModalOpen && latestDecision && txHash && (
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
                Decision #{latestDecision.id.slice(0, 8)} Onchain Proof
              </h4>
              <p className="text-xs text-[#85858a] font-light leading-relaxed">
                Immutable verification proof anchoring Glyph&apos;s autonomous market decision to Robinhood Chain Testnet.
              </p>
            </div>

            <div className="h-px bg-[#171717]" />

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#55555a] block text-[11px] uppercase">TRANSACTION HASH</span>
                <div className="flex items-center justify-between p-2.5 bg-[#030303] border border-[#171717] break-all">
                  <span className="text-[#f3f3f4] text-[11px] sm:text-xs">
                    {txHash}
                  </span>
                  <button
                    type="button"
                    onClick={copyTxHash}
                    className="ml-2 p-1 text-[#85858a] hover:text-[#f3f3f4] cursor-pointer"
                    aria-label="Copy full hash"
                  >
                    {copiedTx ? <Check size={13} className="text-[#6fe39a]" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[#55555a] block text-[11px] uppercase">NETWORK</span>
                  <p className="text-[#f3f3f4] text-xs">Robinhood Chain Testnet (Chain ID 46630)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#55555a] block text-[11px] uppercase">POLICY STATUS</span>
                  <p className={latestDecision.policyResult === "APPROVED" ? "text-[#6fe39a]" : "text-[#b8a77a]"}>
                    {latestDecision.policyResult}
                  </p>
                </div>
              </div>

              {latestDecision.decisionHash && (
                <div className="space-y-1">
                  <span className="text-[#55555a] block text-[11px] uppercase">CANONICAL DECISION HASH</span>
                  <p className="p-2.5 bg-[#030303] border border-[#171717] text-[#85858a] text-[10px] sm:text-[11px] break-all">
                    {latestDecision.decisionHash}
                  </p>
                </div>
              )}

              <div className="p-3 bg-[#030303] border border-[#171717] text-[11px] text-[#76767a] leading-relaxed">
                <span className="text-[#6fe39a] font-medium block mb-1">
                  PROOF OF DECISION INTEGRITY
                </span>
                The payload contains the exact fundamental score ({latestDecision.fundamentalScore ?? "N/A"}), technical score ({latestDecision.technicalScore ?? "N/A"}), risk score ({latestDecision.riskScore ?? "N/A"}), and timestamp. Modifying any reasoning in Glyphs View after execution causes cryptographic invalidation.
              </div>
            </div>

            <div className="h-px bg-[#171717]" />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {latestDecision.explorerUrl && (
                <a
                  href={latestDecision.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6fe39a] hover:underline uppercase"
                >
                  <span>VIEW IN ROBINHOOD TESTNET EXPLORER</span>
                  <ExternalLink size={12} />
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyModalOpen(false)}
                className="h-8 px-4 rounded-[3px] text-xs font-sans font-normal cursor-pointer"
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
