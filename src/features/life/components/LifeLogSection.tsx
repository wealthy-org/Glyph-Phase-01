"use client";

import React, { useState, useMemo } from "react";
import { LifeEvent, StreamFilterCategory } from "../types";
import { cn } from "@/lib/utils";
import { Search, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";

const STREAM_FILTERS: StreamFilterCategory[] = [
  "ALL",
  "ANALYSIS",
  "DECISION",
  "TRADE",
  "MEMORY",
  "SYSTEM",
  "TREASURY",
];

interface EventTypeStyle {
  dot: string;
  badge: string;
  text: string;
  accentBorder: string;
}

const EVENT_TYPE_COLORS: Record<string, EventTypeStyle> = {
  MARKET: {
    dot: "bg-[#38bdf8] shadow-[0_0_0_2px_rgba(56,189,248,0.22)]",
    badge: "text-[#38bdf8] border-[#38bdf8]/35 bg-[#38bdf8]/10",
    text: "text-[#38bdf8]",
    accentBorder: "hover:border-l-[#38bdf8]",
  },
  ANALYSIS: {
    dot: "bg-[#c084fc] shadow-[0_0_0_2px_rgba(192,132,252,0.22)]",
    badge: "text-[#c084fc] border-[#c084fc]/35 bg-[#c084fc]/10",
    text: "text-[#c084fc]",
    accentBorder: "hover:border-l-[#c084fc]",
  },
  DECISION: {
    dot: "bg-[#fbbf24] shadow-[0_0_0_2px_rgba(251,191,36,0.22)]",
    badge: "text-[#fbbf24] border-[#fbbf24]/35 bg-[#fbbf24]/10",
    text: "text-[#fbbf24]",
    accentBorder: "hover:border-l-[#fbbf24]",
  },
  RISK: {
    dot: "bg-[#fb923c] shadow-[0_0_0_2px_rgba(251,146,60,0.22)]",
    badge: "text-[#fb923c] border-[#fb923c]/35 bg-[#fb923c]/10",
    text: "text-[#fb923c]",
    accentBorder: "hover:border-l-[#fb923c]",
  },
  TRADE: {
    dot: "bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.22)]",
    badge: "text-[#6fe39a] border-[#6fe39a]/35 bg-[#6fe39a]/10",
    text: "text-[#6fe39a]",
    accentBorder: "hover:border-l-[#6fe39a]",
  },
  MEMORY: {
    dot: "bg-[#f472b6] shadow-[0_0_0_2px_rgba(244,114,182,0.22)]",
    badge: "text-[#f472b6] border-[#f472b6]/35 bg-[#f472b6]/10",
    text: "text-[#f472b6]",
    accentBorder: "hover:border-l-[#f472b6]",
  },
  SYSTEM: {
    dot: "bg-[#a1a1aa] shadow-[0_0_0_2px_rgba(161,161,170,0.22)]",
    badge: "text-[#a1a1aa] border-[#a1a1aa]/35 bg-[#a1a1aa]/10",
    text: "text-[#a1a1aa]",
    accentBorder: "hover:border-l-[#a1a1aa]",
  },
  TREASURY: {
    dot: "bg-[#2dd4bf] shadow-[0_0_0_2px_rgba(45,212,191,0.22)]",
    badge: "text-[#2dd4bf] border-[#2dd4bf]/35 bg-[#2dd4bf]/10",
    text: "text-[#2dd4bf]",
    accentBorder: "hover:border-l-[#2dd4bf]",
  },
};

interface LifeLogSectionProps {
  initialEvents?: LifeEvent[];
}

export const LifeLogSection: React.FC<LifeLogSectionProps> = ({ initialEvents }) => {
  const events = initialEvents ?? [];
  const [activeFilter, setActiveFilter] = useState<StreamFilterCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleEventExpand = (id: string) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Category Filter Check
      let matchesFilter = true;
      if (activeFilter === "ALL") {
        matchesFilter = true;
      } else if (activeFilter === "ANALYSIS") {
        matchesFilter =
          evt.streamType === "ANALYSIS" ||
          evt.streamType === "MARKET" ||
          evt.eventType === "RESEARCH_STARTED";
      } else if (activeFilter === "DECISION") {
        matchesFilter =
          evt.streamType === "DECISION" ||
          evt.streamType === "RISK" ||
          evt.eventType === "DECISION_MADE";
      } else if (activeFilter === "TRADE") {
        matchesFilter =
          evt.streamType === "TRADE" ||
          ["TRADE_OPENED", "TRADE_CLOSED", "PROFIT_RECORDED", "LOSS_RECORDED"].includes(
            evt.eventType
          );
      } else if (activeFilter === "MEMORY") {
        matchesFilter = evt.streamType === "MEMORY" || evt.eventType === "MEMORY_CREATED";
      } else if (activeFilter === "TREASURY") {
        matchesFilter =
          evt.streamType === "TREASURY" ||
          evt.eventType === "TREASURY_FUNDED" ||
          evt.category === "TREASURY";
      } else if (activeFilter === "SYSTEM") {
        matchesFilter =
          evt.streamType === "SYSTEM" ||
          [
            "AGENT_BORN",
            "IDENTITY_REGISTERED",
            "WALLET_CREATED",
            "REPUTATION_UPDATED",
          ].includes(evt.eventType);
      }

      if (!matchesFilter) return false;

      // 2. Search Query Check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.shortMeta && evt.shortMeta.toLowerCase().includes(q)) ||
        evt.refNumber.toLowerCase().includes(q) ||
        evt.status.toLowerCase().includes(q) ||
        evt.eventType.toLowerCase().includes(q) ||
        (evt.decision?.asset && evt.decision.asset.toLowerCase().includes(q)) ||
        (evt.trade?.asset && evt.trade.asset.toLowerCase().includes(q)) ||
        (evt.txHash && evt.txHash.toLowerCase().includes(q)) ||
        (evt.id && evt.id.toLowerCase().includes(q))
      );
    });
  }, [events, activeFilter, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* ========================================================================= */}
      {/* 1. SINGLE MAIN CONTAINER (Autonomous Activity Stream Workspace)          */}
      {/* ========================================================================= */}
      <div className="w-full border border-[#1b1b1b] bg-[#050505] shadow-2xl relative overflow-hidden">
        {/* ======================================================================= */}
        {/* STREAM HEADER (Left: Title + Subtitle, Right: Search Input)            */}
        {/* ======================================================================= */}
        <div className="p-4 sm:p-6 border-b border-[#1b1b1b] bg-[#080808] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.18)] animate-livepulse shrink-0" />
              <h1 className="font-mono text-sm sm:text-base font-medium tracking-wider text-[#f3f3f4] uppercase">
                AUTONOMOUS STREAM (/LIFE)
              </h1>
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#85858a] font-light pl-4">
              Real-time activity, decisions &amp; memory of Glyph
            </p>
          </div>

          {/* Compact Terminal Search Control */}
          <div className="relative w-full md:w-72 shrink-0">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-[#55555a] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, assets, IDs..."
                className="w-full h-8 pl-8 pr-7 bg-[#050505] border border-[#222222] text-[#f3f3f4] text-xs font-mono placeholder:text-[#55555a] focus:outline-none focus:border-[#444444] transition-colors"
                aria-label="Search events"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-[#55555a] hover:text-[#f3f3f4] p-0.5"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* FILTER BAR (Horizontal Terminal Filter Controls)                       */}
        {/* ======================================================================= */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#171717] bg-[#050505] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
            {STREAM_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const filterColor = filter !== "ALL" ? EVENT_TYPE_COLORS[filter] : null;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-colors shrink-0 cursor-pointer flex items-center gap-1.5",
                    isActive
                      ? "bg-[#141414] text-[#f3f3f4] font-medium border border-[#2e2e32]"
                      : "text-[#71717a] hover:text-[#e4e4e7] border border-transparent hover:border-[#1e1e22] hover:bg-[#0a0a0a]"
                  )}
                  aria-pressed={isActive}
                >
                  {filterColor && (
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full shrink-0", filterColor.dot)}
                      aria-hidden="true"
                    />
                  )}
                  <span>[ {filter} ]</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-[#55555a] tracking-wider shrink-0">
            <span>{filteredEvents.length} EVENTS</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TABLE HEADER LEGEND STRIP                                              */}
        {/* ======================================================================= */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-[#080808] border-b border-[#171717] font-mono text-[10px] text-[#55555a] tracking-wider uppercase select-none">
          <div className="col-span-3">TIMESTAMP / EVENT</div>
          <div className="col-span-2">REF / STATUS</div>
          <div className="col-span-5">ACTIVITY SUMMARY</div>
          <div className="col-span-2 text-right">ACTION / PROOF</div>
        </div>

        {/* ======================================================================= */}
        {/* SCROLLABLE EVENT STREAM (Chronological Rows)                           */}
        {/* ======================================================================= */}
        <div className="max-h-[680px] overflow-y-auto divide-y divide-[#171717]">
          {filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="py-24 px-6 text-center space-y-3 font-mono">
              <span className="text-xs text-[#55555a] tracking-widest uppercase block">
                AUTONOMOUS STREAM
              </span>
              <p className="text-sm text-[#f3f3f4] font-normal">
                No activity recorded yet.
              </p>
              <p className="text-xs text-[#71717a] max-w-sm mx-auto">
                {searchQuery
                  ? `No events matched your search query "${searchQuery}". Try a different keyword or clear filters.`
                  : `Glyph has not generated any life events under category [${activeFilter}].`}
              </p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isExpanded = expandedEventId === evt.id;
              const hasAction = Boolean(evt.actionLabel);
              const eventColor = EVENT_TYPE_COLORS[evt.streamType] || EVENT_TYPE_COLORS.SYSTEM;

              const statusColor =
                evt.statusTone === "positive"
                  ? "text-[#6fe39a]"
                  : evt.statusTone === "negative"
                  ? "text-[#c47a7a]"
                  : "text-[#a1a1aa]";

              return (
                <div
                  key={evt.id}
                  className={cn(
                    "transition-all border-l-2",
                    isExpanded
                      ? cn("bg-[#070707]", eventColor.accentBorder.replace("hover:", ""))
                      : cn("hover:bg-[#080808]/70 bg-[#050505] border-l-transparent", eventColor.accentBorder)
                  )}
                >
                  {/* Event Row Main Body */}
                  <div className="p-4 sm:px-6 sm:py-3.5 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2">
                    {/* Column 1: Timestamp & Semantic Color Event Badge */}
                    <div className="md:col-span-3 flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-[#85858a] tabular-nums shrink-0">
                        {evt.time}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full shrink-0", eventColor.dot)}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider border shrink-0 font-medium",
                            eventColor.badge
                          )}
                        >
                          [{evt.streamType}]
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Reference & Status */}
                    <div className="md:col-span-2 flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-[#55555a] shrink-0">
                        {evt.refNumber}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[10px] font-medium tracking-wider uppercase truncate",
                          statusColor
                        )}
                      >
                        {evt.status}
                      </span>
                    </div>

                    {/* Column 3: Main Description & Short Metadata */}
                    <div className="md:col-span-5 space-y-0.5 min-w-0">
                      <div className="font-sans text-xs sm:text-sm font-normal text-[#f3f3f4] leading-snug">
                        {evt.title}
                      </div>
                      {evt.shortMeta && (
                        <div className="font-mono text-[10px] sm:text-[11px] text-[#71717a] truncate">
                          {evt.shortMeta}
                        </div>
                      )}
                    </div>

                    {/* Column 4: Contextual Action Button (Only when relevant!) */}
                    <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2 pt-1 md:pt-0">
                      {hasAction && (
                        <button
                          type="button"
                          onClick={() => toggleEventExpand(evt.id)}
                          className={cn(
                            "px-2.5 py-1 font-mono text-[10px] sm:text-[11px] tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer border",
                            isExpanded
                              ? "bg-[#161616] text-[#f3f3f4] border-[#383838]"
                              : "bg-[#090909] text-[#85858a] hover:text-[#f3f3f4] border-[#1f1f1f] hover:border-[#333333]"
                          )}
                          aria-expanded={isExpanded}
                        >
                          <span>{isExpanded ? "COLLAPSE" : evt.actionLabel}</span>
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                      )}

                      {/* Onchain verification icon if available and no action button */}
                      {!hasAction && evt.txHash && (
                        <a
                          href={`https://explorer.testnet.chain.robinhood.com/tx/${evt.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-[#55555a] hover:text-[#6fe39a] flex items-center gap-1 transition-colors"
                          title="Verify onchain"
                        >
                          <span>TX</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* =================================================================== */}
                  {/* EXPANDABLE CONTEXTUAL DETAIL ACCORDION PANEL                       */}
                  {/* =================================================================== */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 py-4 bg-[#030303] border-t border-b border-[#1a1a1a] space-y-4 font-mono text-xs text-[#f3f3f4]">
                      {/* DYNAMIC DETAIL BY EVENT TYPE */}

                      {/* A. ANALYSIS DETAIL */}
                      {evt.streamType === "ANALYSIS" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#171717] pb-2 text-[#85858a]">
                            <span className={cn("font-medium tracking-wider", eventColor.text)}>
                              ANALYSIS INSPECTION {evt.refNumber}
                            </span>
                            <span className="text-[11px]">TIME: {evt.time}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-[#171717]/60 text-[11px]">
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                ASSET
                              </span>
                              <span className="text-[#f3f3f4] font-medium">
                                {evt.decision?.asset || "AAPL"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                TYPE
                              </span>
                              <span className="text-[#f3f3f4]">QUANT / FUNDAMENTAL</span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                CONFIDENCE
                              </span>
                              <span className="text-[#6fe39a]">
                                {evt.decision?.conviction || 74}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                VERDICT
                              </span>
                              <span className="text-[#f3f3f4]">COMPLETED</span>
                            </div>
                          </div>

                          {/* Signals Table */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-[#55555a] tracking-wider uppercase block">
                              SIGNALS EVALUATED
                            </span>
                            <div className="divide-y divide-[#171717] border border-[#171717] bg-[#070707] text-[11px]">
                              <div className="px-3 py-1.5 flex items-center justify-between">
                                <span className="text-[#85858a]">Fundamental Score</span>
                                <span className="text-[#f3f3f4]">
                                  {evt.decision?.fundamentalScore ?? 78}/100
                                </span>
                                <span className="text-[#6fe39a] text-[10px]">STRONG</span>
                              </div>
                              <div className="px-3 py-1.5 flex items-center justify-between">
                                <span className="text-[#85858a]">Technical Momentum</span>
                                <span className="text-[#f3f3f4]">
                                  {evt.decision?.technicalScore ?? 72}/100
                                </span>
                                <span className="text-[#6fe39a] text-[10px]">FAVORABLE</span>
                              </div>
                              <div className="px-3 py-1.5 flex items-center justify-between">
                                <span className="text-[#85858a]">Algorithmic Risk Score</span>
                                <span className="text-[#f3f3f4]">
                                  {evt.decision?.riskScore ?? 38}/100
                                </span>
                                <span className="text-[#85858a] text-[10px]">CONTAINED</span>
                              </div>
                            </div>
                          </div>

                          {/* Thesis Description */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] text-[#55555a] tracking-wider uppercase block">
                              RESEARCH THESIS
                            </span>
                            <p className="font-sans text-xs text-[#a1a1aa] leading-relaxed bg-[#060606] p-3 border border-[#171717]">
                              {evt.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* B. DECISION DETAIL */}
                      {evt.streamType === "DECISION" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#171717] pb-2 text-[#85858a]">
                            <span className={cn("font-medium tracking-wider", eventColor.text)}>
                              DECISION VERDICT {evt.refNumber}
                            </span>
                            <span className={statusColor}>
                              POLICY {evt.decision?.policyResult || evt.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-[#171717]/60 text-[11px]">
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                PROPOSED ACTION
                              </span>
                              <span className="text-[#f3f3f4] font-medium">
                                {evt.decision?.action || "LONG"} {evt.decision?.asset || "ASSET"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                CONVICTION
                              </span>
                              <span className="text-[#6fe39a]">
                                {evt.decision?.conviction || 76}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                TIME HORIZON
                              </span>
                              <span className="text-[#f3f3f4]">
                                {evt.decision?.timeHorizon || "1d_to_14d"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                POLICY RESULT
                              </span>
                              <span className={statusColor}>
                                {evt.decision?.policyResult || "APPROVED"}
                              </span>
                            </div>
                          </div>

                          {/* Thesis Structured Components */}
                          {evt.decision?.thesis && (
                            <div className="space-y-2 pt-1">
                              <span className="text-[10px] text-[#55555a] tracking-wider uppercase block">
                                STRUCTURED THESIS BREAKDOWN
                              </span>
                              <div className="space-y-2 text-xs font-sans">
                                {evt.decision.thesis.catalyst && (
                                  <div className="p-2.5 bg-[#060606] border border-[#171717]">
                                    <span className="font-mono text-[10px] text-[#6fe39a] uppercase block mb-1">
                                      CATALYST
                                    </span>
                                    <p className="text-[#a1a1aa] leading-relaxed">
                                      {evt.decision.thesis.catalyst}
                                    </p>
                                  </div>
                                )}
                                {evt.decision.thesis.invalidation && (
                                  <div className="p-2.5 bg-[#060606] border border-[#171717]">
                                    <span className="font-mono text-[10px] text-[#c47a7a] uppercase block mb-1">
                                      INVALIDATION BOUNDARY
                                    </span>
                                    <p className="text-[#a1a1aa] leading-relaxed">
                                      {evt.decision.thesis.invalidation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Onchain Commitment Proof */}
                          {evt.txHash && (
                            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#171717]">
                              <span className="text-[#55555a]">ONCHAIN ATTESTATION:</span>
                              <a
                                href={`https://explorer.testnet.chain.robinhood.com/tx/${evt.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#85858a] hover:text-[#6fe39a] flex items-center gap-1.5 transition-colors"
                              >
                                <span>{evt.txHash.slice(0, 10)}...{evt.txHash.slice(-8)}</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* C. TRADE DETAIL */}
                      {evt.streamType === "TRADE" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#171717] pb-2 text-[#85858a]">
                            <span className={cn("font-medium tracking-wider", eventColor.text)}>
                              EXECUTION LOG {evt.refNumber}
                            </span>
                            <span className={statusColor}>STATUS: {evt.status}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-[#171717]/60 text-[11px]">
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                POSITION
                              </span>
                              <span className="text-[#f3f3f4] font-medium">
                                {evt.trade?.asset || "AAPL"} · {evt.trade?.action || "LONG"} {evt.trade?.leverage || 2}×
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                ENTRY PRICE
                              </span>
                              <span className="text-[#f3f3f4]">
                                {evt.trade?.entryPrice ? `$${evt.trade.entryPrice.toFixed(2)}` : "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                EXIT / TARGET
                              </span>
                              <span className="text-[#f3f3f4]">
                                {evt.trade?.exitPrice
                                  ? `$${evt.trade.exitPrice.toFixed(2)}`
                                  : evt.trade?.targetPrice
                                  ? `$${evt.trade.targetPrice.toFixed(2)}`
                                  : "ACTIVE"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                PNL REALIZED
                              </span>
                              <span className={statusColor}>
                                {evt.result || (evt.trade?.simulatedPnlPercent ? `${evt.trade.simulatedPnlPercent.toFixed(2)}%` : "0.00")}
                              </span>
                            </div>
                          </div>

                          <p className="font-sans text-xs text-[#a1a1aa] leading-relaxed bg-[#060606] p-3 border border-[#171717]">
                            {evt.description}
                          </p>

                          {(evt.trade?.id || evt.tradeId) && (
                            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#171717]">
                              <span className="text-[#55555a]">TRADE RECORD:</span>
                              <Link
                                href={`/trades/${evt.trade?.id || evt.tradeId}`}
                                className="text-[#85858a] hover:text-[#f3f3f4] font-mono text-[11px] tracking-wider transition-colors inline-flex items-center gap-1 group"
                              >
                                <span>TRADE DETAIL</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {/* D. MEMORY DETAIL */}
                      {evt.streamType === "MEMORY" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-[#171717] pb-2 text-[#85858a]">
                            <span className={cn("font-medium tracking-wider", eventColor.text)}>
                              MEMORY CALIBRATION {evt.refNumber}
                            </span>
                            <span className={statusColor}>
                              OUTCOME: {evt.memory?.outcome || evt.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 border-b border-[#171717]/60 text-[11px]">
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                THESIS ACCURACY
                              </span>
                              <span className="text-[#f3f3f4]">
                                {evt.memory?.thesisResult || "CORRECT"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                CONFIDENCE CALIBRATION
                              </span>
                              <span className="text-[#6fe39a]">
                                {evt.memory?.confidenceCalibration || "GOOD"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#55555a] block text-[10px] uppercase">
                                RECORD STATUS
                              </span>
                              <span className="text-[#f3f3f4]">COMMITTED</span>
                            </div>
                          </div>

                          {/* Lesson Learned */}
                          <div className="space-y-2 text-xs font-sans">
                            {evt.memory?.lesson && (
                              <div className="p-3 bg-[#060606] border border-[#171717]">
                                <span className="font-mono text-[10px] text-[#55555a] uppercase block mb-1">
                                  POST-TRADE LESSON
                                </span>
                                <p className="text-[#a1a1aa] leading-relaxed">
                                  {evt.memory.lesson}
                                </p>
                              </div>
                            )}

                            {evt.memory?.adaptation && (
                              <div className="p-3 bg-[#060606] border border-[#171717]">
                                <span className="font-mono text-[10px] text-[#6fe39a] uppercase block mb-1">
                                  ADAPTIVE RULE ADJUSTMENT
                                </span>
                                <p className="text-[#a1a1aa] leading-relaxed">
                                  {evt.memory.adaptation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================================= */}
        {/* STREAM FOOTER (Observability & Sync Telemetry)                          */}
        {/* ======================================================================= */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#1b1b1b] bg-[#070707] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-[#55555a]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
            <span>STREAM SYNCHRONIZED</span>
            <span className="text-[#333333]">·</span>
            <span>SHOWING {filteredEvents.length} OF {events.length} EVENTS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>NETWORK: ROBINHOOD TESTNET // 46630</span>
          </div>
        </div>
      </div>
    </div>
  );
};
