"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/GridBackground";
import { ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { LandingLatestDecision } from "../types";

interface CurrentThesisProps {
  latestDecision: LandingLatestDecision | null;
}

export const CurrentThesis: React.FC<CurrentThesisProps> = ({ latestDecision }) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!latestDecision) {
    return (
      <section id="current-thesis" className="relative w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000] overflow-hidden">
        <GridBackground glowColor="emerald" intensity="medium" gridSize={36} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-6">
          <span className="eyebrow">THESIS // CONVERGENCE</span>
          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4]">
            No thesis recorded.
          </h2>
          <p className="font-mono text-xs text-[#85858a]">
            Glyph has not published an autonomous research thesis in the current epoch.
          </p>
        </div>
      </section>
    );
  }

  const fundamentalScore = latestDecision.fundamentalScore ?? 0;
  const technicalScore = latestDecision.technicalScore ?? 0;
  const riskScore = latestDecision.riskScore ?? 0;
  const thesis = latestDecision.thesis;

  const coreSynthesis =
    thesis.fundamental ||
    thesis.technical ||
    "Autonomous agent reasoning cycle evaluated macro catalysts and technical indicators.";

  const invalidationBoundary =
    thesis.invalidation ||
    "Invalidation triggered on key support level breach or adverse sector momentum.";

  const catalystSummary =
    thesis.catalyst || "Positive sector momentum and earnings guidance";

  return (
    <section id="current-thesis" className="relative w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000] overflow-hidden">
      {/* Subtle modern thin grid background with subtle convergence glow */}
      <GridBackground glowColor="emerald" intensity="medium" gridSize={36} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="eyebrow">THESIS // CONVERGENCE</span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#f3f3f4] leading-[0.98]">
              Autonomous thesis,<br />
              unambiguous boundary.
            </h2>
          </div>

          <p className="font-mono text-xs text-[#76767a] tracking-wider uppercase max-w-xs">
            QUANTITATIVE ENGINE & DISCRETIONARY CONVERGENCE
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
          {/* Left Column: Asset, Direction, Core Synthesis */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#1a1a1a] bg-[#050505] font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-livepulse" />
                  <span>LATEST EVALUATION</span>
                </div>

                {latestDecision.policyResult === "REJECTED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#b8a77a]/40 bg-[#b8a77a]/10 font-mono text-[10px] text-[#b8a77a] uppercase tracking-wider">
                    <AlertTriangle size={11} />
                    <span>POLICY REJECTED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#6fe39a]/30 bg-[#6fe39a]/10 font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider">
                    <span>POLICY APPROVED</span>
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                <h3 className="font-mono text-4xl sm:text-6xl font-light text-[#f3f3f4] tracking-tight">
                  {latestDecision.asset}
                </h3>
                <span className="font-mono text-2xl sm:text-3xl text-[#444448]">/</span>
                <span className="font-mono text-3xl sm:text-4xl text-[#6fe39a] font-normal tracking-wide">
                  {latestDecision.action}
                </span>
                <span className="font-mono text-lg sm:text-xl text-[#85858a]">
                  ({latestDecision.conviction}% Conviction)
                </span>
              </div>
            </div>

            <div className="space-y-3 border-l border-[#252525] pl-6 py-2">
              <span className="font-mono text-[10px] text-[#76767a] tracking-widest uppercase block">
                CORE SYNTHESIS
              </span>
              <p className="text-base sm:text-lg text-[#f0f0f2] font-light leading-relaxed">
                {coreSynthesis}
              </p>
            </div>

            {/* Invalidation Boundary Card */}
            <div className="p-4 sm:p-5 border border-[#1c1c1c] bg-[#050505] flex items-start gap-4">
              <ShieldAlert size={18} className="text-[#b8a77a] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#b8a77a] uppercase tracking-widest block">
                  INVALIDATION BOUNDARY
                </span>
                <p className="font-mono text-sm text-[#f3f3f4]">
                  {invalidationBoundary}
                </p>
              </div>
            </div>

            {/* Read Full Thesis CTA */}
            <div>
              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="h-10 px-5 border border-[#262626] bg-transparent hover:bg-[#0c0c0c] text-[#f3f3f4] hover:border-[#444448] font-sans text-sm font-normal normal-case tracking-normal transition-colors rounded-[3px] flex items-center gap-2 cursor-pointer"
              >
                <span>Read full thesis memorandum</span>
                <ArrowUpRight size={14} />
              </Button>
            </div>
          </div>

          {/* Right Column: Score Breakdown & Analytical Vectors */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#171717] lg:pl-10">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <span className="font-mono text-xs text-[#85858a] tracking-wider uppercase block">
                ANALYSIS BREAKDOWN
              </span>
              <span className="font-mono text-[10px] text-[#55555a] uppercase">
                VECTORS // 4
              </span>
            </div>

            <div className="space-y-5">
              {/* Fundamental */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#85858a]">Fundamental Score</span>
                  <span className="text-[#f3f3f4]">{fundamentalScore} / 100</span>
                </div>
                <div className="w-full bg-[#141414] h-1 overflow-hidden">
                  <motion.div
                    className="bg-[#f0f0f1] h-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${fundamentalScore}%` }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  />
                </div>
              </div>

              {/* Technical */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#85858a]">Technical Momentum</span>
                  <span className="text-[#6fe39a]">{technicalScore} / 100</span>
                </div>
                <div className="w-full bg-[#141414] h-1 overflow-hidden">
                  <motion.div
                    className="bg-[#6fe39a] h-full shadow-[0_0_8px_rgba(111,227,154,0.3)]"
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${technicalScore}%` }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                  />
                </div>
              </div>

              {/* Catalyst */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#85858a]">Catalyst Alignment</span>
                  <span className="text-[#6fe39a] flex items-center gap-1 truncate max-w-[240px]">
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span className="truncate">{catalystSummary}</span>
                  </span>
                </div>
                <div className="w-full bg-[#141414] h-1 overflow-hidden">
                  <motion.div
                    className="bg-[#6fe39a] h-full opacity-80"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  />
                </div>
              </div>

              {/* Risk */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#85858a]">Risk Coefficient</span>
                  <span className="text-[#b8a77a]">{riskScore} / 100</span>
                </div>
                <div className="w-full bg-[#141414] h-1 overflow-hidden">
                  <motion.div
                    className="bg-[#b8a77a] h-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${riskScore}%` }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#171717] font-mono text-[11px] text-[#55555a] leading-relaxed">
              MODEL SIGNALS: Multi-vector research snapshot anchoring fundamental CapEx guidance + technical volume structure.
            </div>
          </div>
        </div>

        {/* 3-Card Capabilities Grid */}
        <div className="pt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#171717] pb-3">
            <span className="font-mono text-xs text-[#85858a] tracking-wider uppercase">
              CAPABILITIES & INTEGRITY GUARDS
            </span>
            <span className="font-mono text-[10px] text-[#55555a] uppercase">
              VERIFICATION SPEC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#171717] border border-[#171717]">
            <div className="bg-[#050505] p-6 sm:p-7 space-y-3 hover:bg-[#090909] transition-colors">
              <span className="font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider block">
                01 // IDENTIFICATION
              </span>
              <h4 className="text-base font-medium text-[#f3f3f4]">Onchain Identity</h4>
              <p className="text-xs text-[#85858a] font-light leading-relaxed">
                Every decision traces back to one verifiable agent — a single ERC-8004 identity on Robinhood Chain, not an anonymous API call.
              </p>
            </div>

            <div className="bg-[#050505] p-6 sm:p-7 space-y-3 hover:bg-[#090909] transition-colors">
              <span className="font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider block">
                02 // GOVERNANCE
              </span>
              <h4 className="text-base font-medium text-[#f3f3f4]">Deterministic Risk Policy</h4>
              <p className="text-xs text-[#85858a] font-light leading-relaxed">
                Leverage, position size, and exposure are clamped by deterministic code — not by the model. The AI proposes. Policy decides.
              </p>
            </div>

            <div className="bg-[#050505] p-6 sm:p-7 space-y-3 hover:bg-[#090909] transition-colors">
              <span className="font-mono text-[10px] text-[#6fe39a] uppercase tracking-wider block">
                03 // AUDITABILITY
              </span>
              <h4 className="text-base font-medium text-[#f3f3f4]">Immutable Research</h4>
              <p className="text-xs text-[#85858a] font-light leading-relaxed">
                The exact market parameters Glyph saw before deciding are frozen and stored. Nothing gets rewritten after the fact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Modal for Read Full Thesis */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#080808] border border-[#202020] p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-[#6fe39a] uppercase tracking-wider">
                  THESIS MEMORANDUM // #{latestDecision.id.slice(0, 8)}
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="font-mono text-xs text-[#666666] hover:text-[#f3f3f4] border border-[#202020] px-2 py-0.5 cursor-pointer"
                >
                  ESC [×]
                </button>
              </div>
              <div className="h-px bg-[#171717]" />
            </div>

            <div className="space-y-4 text-sm text-[#85858a] leading-relaxed font-light">
              <div className="p-3 bg-[#030303] border border-[#171717] space-y-1.5">
                <div className="font-mono text-xs text-[#6fe39a] uppercase flex items-center justify-between">
                  <span>FUNDAMENTAL THESIS</span>
                  <span className="text-[#f3f3f4]">{fundamentalScore} / 100</span>
                </div>
                <p className="text-xs text-[#f0f0f2] font-light">
                  {thesis.fundamental || "No fundamental thesis notes logged."}
                </p>
              </div>

              <div className="p-3 bg-[#030303] border border-[#171717] space-y-1.5">
                <div className="font-mono text-xs text-[#6fe39a] uppercase flex items-center justify-between">
                  <span>TECHNICAL THESIS</span>
                  <span className="text-[#f3f3f4]">{technicalScore} / 100</span>
                </div>
                <p className="text-xs text-[#f0f0f2] font-light">
                  {thesis.technical || "No technical thesis notes logged."}
                </p>
              </div>

              <div className="bg-[#030303] p-3 border border-[#171717] font-mono text-xs space-y-1.5">
                <div className="text-[#55555a] uppercase">RISK & INVALIDATION CONSTRAINTS:</div>
                <div className="text-[#f3f3f4]">
                  • Policy Result:{" "}
                  <span
                    className={
                      latestDecision.policyResult === "APPROVED"
                        ? "text-[#6fe39a]"
                        : "text-[#b8a77a]"
                    }
                  >
                    {latestDecision.policyResult}
                  </span>
                </div>
                {latestDecision.policyRejectReason && (
                  <div className="text-[#b8a77a]">• Reason: {latestDecision.policyRejectReason}</div>
                )}
                <div className="text-[#b8a77a]">• Invalidation Level: {invalidationBoundary}</div>
                {thesis.risk && <div className="text-[#85858a] pt-1">• Risk Analysis: {thesis.risk}</div>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-px bg-[#171717]" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {latestDecision.tradeId ? (
                  <Link
                    href={`/trade/${latestDecision.tradeId}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#6fe39a] hover:underline uppercase"
                  >
                    <span>INSPECT ASSOCIATED TRADE {latestDecision.tradeNumber || ""}</span>
                    <ArrowUpRight size={12} />
                  </Link>
                ) : (
                  <Link
                    href="/trades"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#85858a] hover:text-[#f3f3f4] uppercase"
                  >
                    <span>EXPLORE ALL TRADES</span>
                    <ArrowUpRight size={12} />
                  </Link>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-8 px-4 rounded-[3px] font-sans text-xs font-normal cursor-pointer"
                >
                  Close Memorandum
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
