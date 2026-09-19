"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GridBackground } from "@/components/ui/GridBackground";
import {
  LandingPositionItem,
  LandingLatestDecision,
  LandingEconomicEvent,
} from "../types";

interface HeroProps {
  openPosition?: LandingPositionItem | null;
  latestDecision?: LandingLatestDecision | null;
  cycleCount?: number;
  recentEvents?: LandingEconomicEvent[];
}

export const Hero: React.FC<HeroProps> = ({
  openPosition = null,
  latestDecision = null,
  cycleCount = 4,
  recentEvents = [],
}) => {

  // =========================================================================
  // 1. CYCLE CONTEXT
  // =========================================================================
  const cycleNumber = cycleCount || 4;

  let startedTime = "—";
  let lastUpdateTime = "—";
  let elapsedStr = "—";

  if (latestDecision?.createdAt) {
    const startedDate = new Date(latestDecision.createdAt);
    startedTime =
      startedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC";

    const latestEventDate =
      recentEvents && recentEvents.length > 0 && recentEvents[0].timestamp
        ? new Date(recentEvents[0].timestamp)
        : openPosition?.openedAt
        ? new Date(openPosition.openedAt)
        : null;

    if (latestEventDate && latestEventDate >= startedDate) {
      lastUpdateTime =
        latestEventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC";

      const diffSec = Math.max(
        0,
        Math.floor((latestEventDate.getTime() - startedDate.getTime()) / 1000)
      );
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      elapsedStr = `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      lastUpdateTime = startedTime;
      elapsedStr = "00:00";
    }
  }

  // =========================================================================
  // 2. OPERATION IDENTITY
  // =========================================================================
  const hasActivePosition = Boolean(openPosition);
  const asset = hasActivePosition ? openPosition!.asset : "NO ACTIVE POSITION";
  const positionSubtitle = hasActivePosition
    ? `${openPosition!.side} POSITION · ${openPosition!.leverage}× SIM`
    : "STANDBY // NO UNREALIZED RISK EXPOSURE";

  // =========================================================================
  // 3. POSITION TELEMETRY (DEEPENED)
  // =========================================================================
  const entryFormatted = hasActivePosition
    ? `$${Number(openPosition!.entryPrice).toFixed(2)}`
    : "—";

  const currentFormatted =
    hasActivePosition && openPosition!.currentPrice
      ? `$${Number(openPosition!.currentPrice).toFixed(2)}`
      : "—";

  const sizeFormatted = hasActivePosition
    ? `${openPosition!.leverage}×`
    : "—";

  const notionalFormatted =
    hasActivePosition && openPosition!.notional
      ? `$${Number(openPosition!.notional).toFixed(2)}`
      : "—";

  const unrealizedVal = openPosition?.unrealizedPnl ?? null;
  const unrealizedFormatted =
    hasActivePosition && unrealizedVal !== null
      ? `${unrealizedVal >= 0 ? "+$" : "-$"}${Math.abs(unrealizedVal).toFixed(2)}`
      : "—";

  const unrealizedColor =
    hasActivePosition && unrealizedVal !== null
      ? unrealizedVal > 0
        ? "text-[#6fe39a]"
        : unrealizedVal < 0
        ? "text-[#c47a7a]"
        : "text-[#85858a]"
      : "text-[#85858a]";

  // =========================================================================
  // 4. DECISION CONTEXT (DEEPENED)
  // =========================================================================
  const targetFormatted = latestDecision
    ? `${latestDecision.asset} · ${latestDecision.action}`
    : "—";

  const convictionFormatted = latestDecision?.conviction
    ? `${latestDecision.conviction}%`
    : "—";

  const fundamentalFormatted =
    latestDecision?.fundamentalScore !== null &&
    latestDecision?.fundamentalScore !== undefined
      ? `${latestDecision.fundamentalScore}`
      : "—";

  const technicalFormatted =
    latestDecision?.technicalScore !== null &&
    latestDecision?.technicalScore !== undefined
      ? `${latestDecision.technicalScore}`
      : "—";

  const riskScoreFormatted =
    latestDecision?.riskScore !== null &&
    latestDecision?.riskScore !== undefined
      ? `${latestDecision.riskScore}`
      : "—";

  const policyFormatted = latestDecision?.policyResult || "APPROVED";
  const policyColor =
    policyFormatted === "APPROVED" ? "text-[#6fe39a]" : "text-[#c47a7a]";

  // =========================================================================
  // 5. THESIS REASONING (WHY) & CANONICAL DETAIL LINK
  // =========================================================================
  const rawThesis = latestDecision?.thesis;
  const thesisSummaryText =
    rawThesis?.catalyst ||
    rawThesis?.fundamental ||
    rawThesis?.technical ||
    (latestDecision ? "No thesis summary available." : "No decision recorded.");

  const targetTradePath =
    latestDecision?.tradeNumber ||
    openPosition?.tradeNumber ||
    (latestDecision?.tradeId ? latestDecision.tradeId : null) ||
    (openPosition?.tradeId ? openPosition.tradeId : null);

  const viewThesisHref = targetTradePath ? `/trades/${targetTradePath}` : "/trades";

  // =========================================================================
  // 6. PIPELINE & EXECUTION STATUS
  // =========================================================================
  const executionStatus = hasActivePosition ? "ACTIVE" : "SETTLED";
  const executionColor = hasActivePosition ? "text-[#6fe39a]" : "text-[#85858a]";

  return (
    <section
      className="relative w-full overflow-hidden border-b border-[#171717] bg-[#000000]"
    >
      {/* Precision technical grid background */}
      <GridBackground glowColor="emerald" intensity="medium" gridSize={32} />

      {/* Subtle radial ambient light wash */}
      <div
        className="absolute -top-4 right-10 w-[380px] h-[260px] pointer-events-none z-1 blur-2xl opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-24 w-[520px] h-[220px] pointer-events-none z-1 blur-3xl opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_68%)]"
        aria-hidden="true"
      />

      {/* Hero Live Operational Terminal Workspace */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* SINGLE BORDERED TERMINAL FRAME */}
        <div className="border border-[#1b1b1b]/80 bg-[#050505]/80 backdrop-blur-md relative overflow-hidden shadow-2xl">
          {/* 3. TERMINAL HEADER */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-[#1b1b1b]/80 bg-[#080808]/70 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.25)] animate-livepulse shrink-0" />
              <span className="font-mono text-xs sm:text-[13px] tracking-wider uppercase text-[#f3f3f4] font-medium">
                AUTONOMOUS OPERATION // LIVE
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#85858a]">
              <span className="text-[#6fe39a] font-medium tracking-wider">
                CYCLE #{cycleNumber}
              </span>
            </div>
          </div>

          {/* 4 & 5. PRIMARY SUBJECT (AAPL) + CYCLE CONTEXT */}
          <div className="p-4 sm:p-6 space-y-3 bg-transparent">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#f3f3f4] uppercase font-sans">
                {asset}
              </h1>
              <p className="font-mono text-xs sm:text-[13px] tracking-wider uppercase text-[#85858a]">
                {positionSubtitle}
              </p>
            </div>

            {/* COMPACT CYCLE METADATA ROW */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 font-mono text-[11px] sm:text-xs pt-2 border-t border-[#141414]/80">
              <div>
                <span className="text-[#55555a]">STARTED </span>
                <span className="text-[#d4d4d8] tabular-nums">{startedTime}</span>
              </div>
              <div>
                <span className="text-[#55555a]">LAST UPDATE </span>
                <span className="text-[#d4d4d8] tabular-nums">{lastUpdateTime}</span>
              </div>
              <div>
                <span className="text-[#55555a]">ELAPSED </span>
                <span className="text-[#6fe39a] tabular-nums font-medium">{elapsedStr}</span>
              </div>
            </div>
          </div>

          {/* 6. POSITION + DECISION (BALANCED 2 COLUMNS) */}
          <div className="border-t border-[#1b1b1b]/80 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]/80">
            {/* COLUMN 1: POSITION */}
            <div className="p-4 sm:p-5 space-y-2.5 bg-[#050505]/40 backdrop-blur-sm">
              <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest border-b border-[#141414]/80 pb-1.5">
                POSITION
              </div>
              <div className="space-y-1.5 font-mono text-xs sm:text-[13px]">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">ENTRY</span>
                  <span className="text-[#f3f3f4] font-medium tabular-nums">{entryFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">CURRENT</span>
                  <span className="text-[#f3f3f4] font-medium tabular-nums">{currentFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">SIZE</span>
                  <span className="text-[#d4d4d8] tabular-nums">{sizeFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">NOTIONAL</span>
                  <span className="text-[#d4d4d8] tabular-nums">{notionalFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">UNREALIZED</span>
                  <span className={cn("font-medium tabular-nums", unrealizedColor)}>{unrealizedFormatted}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: DECISION */}
            <div className="p-4 sm:p-5 space-y-2.5 bg-[#050505]/40 backdrop-blur-sm">
              <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest border-b border-[#141414]/80 pb-1.5">
                DECISION
              </div>
              <div className="space-y-1.5 font-mono text-xs sm:text-[13px]">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">TARGET</span>
                  <span className="text-[#f3f3f4] font-medium truncate">{targetFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">CONVICTION</span>
                  <span className="text-[#6fe39a] font-medium tabular-nums">{convictionFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">FUNDAMENTAL</span>
                  <span className="text-[#d4d4d8] tabular-nums">{fundamentalFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">TECHNICAL</span>
                  <span className="text-[#d4d4d8] tabular-nums">{technicalFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">RISK SCORE</span>
                  <span className="text-[#fbbf24] tabular-nums">{riskScoreFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#71717a] uppercase text-[11px]">POLICY</span>
                  <span className={cn("uppercase font-medium", policyColor)}>{policyFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. THESIS REASONING HIGHLIGHT STRIP */}
          <div className="border-t border-[#1b1b1b]/80 p-4 sm:p-5 bg-[#070707]/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <div className="space-y-1.5 border-l-2 border-[#6fe39a]/80 pl-3.5 sm:pl-4 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#66666e] uppercase tracking-wider">
                <span className="text-[#85858a] font-medium">THESIS // CURRENT DECISION</span>
                {latestDecision && (
                  <>
                    <span className="text-[#333338]">·</span>
                    <span className="text-[#d4d4d8]">{latestDecision.asset} · {latestDecision.action}</span>
                    <span className="text-[#333338]">·</span>
                    <span className="text-[#6fe39a]">{latestDecision.conviction}% CONVICTION</span>
                  </>
                )}
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#e4e4e7] font-normal leading-relaxed">
                &ldquo;{thesisSummaryText}&rdquo;
              </p>
            </div>

            <div className="shrink-0 sm:self-center pl-3.5 sm:pl-0">
              <Link
                href={viewThesisHref}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#85858a] hover:text-[#f3f3f4] transition-colors group"
              >
                <span className="border-b border-[#333338] group-hover:border-[#f3f3f4] pb-0.5">
                  VIEW THESIS
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* 7. AUTONOMOUS PIPELINE (COMPACT HORIZONTAL PIPELINE WITH CONNECTORS) */}
          <div className="border-t border-[#1b1b1b]/80 p-4 sm:p-6 space-y-3 bg-[#060606]/50 backdrop-blur-sm">
            <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest">
              AUTONOMOUS PIPELINE
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 font-mono relative">
              {/* 01 MARKET */}
              <div className="relative p-2.5 sm:p-3 bg-[#090909]/60 backdrop-blur-sm border border-[#171717]/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#66666e] block">01 MARKET</span>
                  <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-[#38bdf8] font-medium">UPDATED</span>
                  <span className="text-[#38bdf8]">✓</span>
                </div>
              </div>

              {/* 02 ANALYSIS */}
              <div className="relative p-2.5 sm:p-3 bg-[#090909]/60 backdrop-blur-sm border border-[#171717]/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#66666e] block">02 ANALYSIS</span>
                  <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-[#c084fc] font-medium">COMPLETE</span>
                  <span className="text-[#c084fc]">✓</span>
                </div>
              </div>

              {/* 03 DECISION */}
              <div className="relative p-2.5 sm:p-3 bg-[#090909]/60 backdrop-blur-sm border border-[#171717]/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#66666e] block">03 DECISION</span>
                  <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-[#fbbf24] font-medium">{policyFormatted}</span>
                  <span className="text-[#fbbf24]">✓</span>
                </div>
              </div>

              {/* 04 RISK */}
              <div className="relative p-2.5 sm:p-3 bg-[#090909]/60 backdrop-blur-sm border border-[#171717]/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#66666e] block">04 RISK</span>
                  <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className={cn("font-medium", policyColor)}>{policyFormatted}</span>
                  <span className={policyColor}>{policyFormatted === "REJECTED" ? "✗" : "✓"}</span>
                </div>
              </div>

              {/* 05 EXECUTION */}
              <div className="relative p-2.5 sm:p-3 bg-[#090909]/60 backdrop-blur-sm border border-[#171717]/80 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#66666e] block">05 EXECUTION</span>
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className={executionColor}>{executionStatus}</span>
                  {hasActivePosition ? (
                    <span className="w-2 h-2 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.3)] animate-livepulse" />
                  ) : (
                    <span className="text-[#85858a]">✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 8. OPERATION STATUS (COMPACT STATUS FOOTER) */}
          <div className="border-t border-[#1b1b1b]/80 px-4 sm:px-6 py-2.5 bg-[#080808]/70 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-[#71717a]">
            <div className="flex items-center gap-2">
              <span className="text-[#55555a] uppercase tracking-wider">OPERATION STATUS:</span>
              <span className="text-[#f3f3f4] font-medium tracking-wide">
                {hasActivePosition
                  ? "POSITION ACTIVE · PAPER TRADE · SIMULATED CAPITAL"
                  : "POSITION CLOSED · PAPER TRADE · SIMULATED CAPITAL"}
              </span>
            </div>
            <div className="text-[#55555a]">
              NETWORK: ROBINHOOD TESTNET // 46630
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee Strip */}
      <div className="w-full border-t border-[#171717] bg-[#000000] flex items-stretch h-12 sm:h-14 overflow-hidden relative select-none">
        {/* Intro Tag */}
        <div className="flex items-center px-4 sm:px-6 bg-[#000000] border-r border-[#171717] font-mono text-[10px] sm:text-[11px] tracking-widest text-[#555559] uppercase shrink-0 z-10">
          BUILT ON
        </div>

        {/* Marquee Viewport with gradient masks */}
        <div className="flex-1 overflow-hidden relative flex items-center [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="animate-marquee items-center gap-8 sm:gap-12 px-6">
            {[
              "NEXT.JS",
              "TYPESCRIPT",
              "WAGMI + VIEM",
              "SAFE PROTOCOL",
              "ERC-8004",
              "OPENROUTER",
              "SUPABASE",
              "ROBINHOOD CHAIN",
              "PRISMA ORM",
              "NEXT.JS",
              "TYPESCRIPT",
              "WAGMI + VIEM",
              "SAFE PROTOCOL",
              "ERC-8004",
              "OPENROUTER",
              "SUPABASE",
              "ROBINHOOD CHAIN",
              "PRISMA ORM",
            ].map((tech, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] sm:text-xs text-[#69696d] hover:text-[#d8d8da] tracking-wider uppercase whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-[#444448] rounded-full" />
                <span>{tech}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
