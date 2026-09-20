"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LandingAnalysisState,
  LandingEconomicEvent,
  LandingLatestDecision,
  LandingPositionItem,
} from "../types";

interface HeroProps {
  openPosition?: LandingPositionItem | null;
  latestDecision?: LandingLatestDecision | null;
  latestAnalysis?: LandingAnalysisState | null;
  cycleCount?: number;
  recentEvents?: LandingEconomicEvent[];
}

type AnalysisTab = "fundamental" | "technical" | "risk" | "market" | "glyph-view";

interface TabDefinition {
  id: AnalysisTab;
  label: string;
  title: string;
}

const TABS: TabDefinition[] = [
  { id: "fundamental", label: "FUNDAMENTAL", title: "FUNDAMENTAL ANALYSIS" },
  { id: "technical", label: "TECHNICAL", title: "TECHNICAL ANALYSIS" },
  { id: "risk", label: "RISK", title: "RISK ASSESSMENT" },
  { id: "market", label: "MARKET CONTEXT", title: "MARKET CONTEXT" },
  { id: "glyph-view", label: "GLYPH'S VIEW", title: "GLYPH'S VIEW" },
];

// ============================================================================
// SUBCOMPONENT: OneShotTypewriter (Memoized, One-Shot Reveal per Value)
// ============================================================================
const OneShotTypewriter: React.FC<{
  value: string;
  delay?: number;
  speed?: number;
  className?: string;
}> = React.memo(({ value, delay = 0, speed = 24, className }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (!value || value === "—") {
      setDisplayed(value || "—");
      setDone(true);
      return;
    }

    // On initial page mount, use the staggered delay.
    // On subsequent value updates as stages resolve, update with minimal delay.
    const effectiveDelay = isFirstMount.current ? delay : 40;
    isFirstMount.current = false;

    setDone(false);
    setStarted(false);

    let intervalId: NodeJS.Timeout | null = null;
    const startTimer = setTimeout(() => {
      setStarted(true);
      let idx = 0;
      intervalId = setInterval(() => {
        idx++;
        setDisplayed(value.slice(0, idx));
        if (idx >= value.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, effectiveDelay);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [value, delay, speed]);

  return (
    <span className={className}>
      {done ? value : displayed}
      {started && !done && (
        <span className="inline-block w-1 h-3 bg-[#6fe39a] ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
});

OneShotTypewriter.displayName = "OneShotTypewriter";

// ============================================================================
// STAGES SPECIFICATION & PERSISTENT CYCLE CONFIGURATION
// ============================================================================
interface StageConfig {
  id: AnalysisTab;
  name: string;
  consoleTitle: string;
  pipeline: {
    market: { status: string; symbol: string; color: string; pulse?: boolean };
    analysis: { status: string; symbol: string; color: string; pulse?: boolean };
    decision: { status: string; symbol: string; color: string; pulse?: boolean };
    risk: { status: string; symbol: string; color: string; pulse?: boolean };
    execution: { status: string; symbol: string; color: string; pulse?: boolean };
  };
}

const STAGES: StageConfig[] = [
  {
    id: "fundamental",
    name: "FUNDAMENTAL ANALYSIS",
    consoleTitle: "GLYPH // ANALYZING",
    pipeline: {
      market: { status: "UPDATED", symbol: "✓", color: "text-[#38bdf8]" },
      analysis: { status: "ACTIVE", symbol: "●", color: "text-[#6fe39a]", pulse: true },
      decision: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
      risk: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
      execution: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
    },
  },
  {
    id: "technical",
    name: "TECHNICAL ANALYSIS",
    consoleTitle: "GLYPH // ANALYZING",
    pipeline: {
      market: { status: "UPDATED", symbol: "✓", color: "text-[#38bdf8]" },
      analysis: { status: "ACTIVE", symbol: "●", color: "text-[#6fe39a]", pulse: true },
      decision: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
      risk: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
      execution: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
    },
  },
  {
    id: "risk",
    name: "RISK ASSESSMENT",
    consoleTitle: "GLYPH // ASSESSING RISK",
    pipeline: {
      market: { status: "UPDATED", symbol: "✓", color: "text-[#38bdf8]" },
      analysis: { status: "COMPLETE", symbol: "✓", color: "text-[#c084fc]" },
      decision: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
      risk: { status: "ACTIVE", symbol: "●", color: "text-[#6fe39a]", pulse: true },
      execution: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
    },
  },
  {
    id: "market",
    name: "MARKET CONTEXT",
    consoleTitle: "GLYPH // FORMING DECISION",
    pipeline: {
      market: { status: "UPDATED", symbol: "✓", color: "text-[#38bdf8]" },
      analysis: { status: "COMPLETE", symbol: "✓", color: "text-[#c084fc]" },
      decision: { status: "ACTIVE", symbol: "●", color: "text-[#fbbf24]", pulse: true },
      risk: { status: "APPROVED", symbol: "✓", color: "text-[#6fe39a]" },
      execution: { status: "WAITING", symbol: "—", color: "text-[#55555e]" },
    },
  },
  {
    id: "glyph-view",
    name: "GLYPH'S VIEW",
    consoleTitle: "GLYPH // FORMING VIEW",
    pipeline: {
      market: { status: "UPDATED", symbol: "✓", color: "text-[#38bdf8]" },
      analysis: { status: "COMPLETE", symbol: "✓", color: "text-[#c084fc]" },
      decision: { status: "APPROVED", symbol: "✓", color: "text-[#fbbf24]" },
      risk: { status: "APPROVED", symbol: "✓", color: "text-[#6fe39a]" },
      execution: { status: "ACTIVE", symbol: "●", color: "text-[#6fe39a]", pulse: true },
    },
  },
];

// ============================================================================
// SUBCOMPONENT: AnalysisStreamViewer (Isolated High-Frequency Typewriter Stream)
// Prevents root Hero component from re-rendering during streaming!
// ============================================================================
interface AnalysisStreamViewerProps {
  activeStageText: string;
  activeTabConfig: TabDefinition;
  activeTabIdx: number;
  totalTabs: number;
  activeTab: AnalysisTab;
  latestDecision: LandingLatestDecision | null;
  rawThesis: any;
  viewThesisHref: string;
  elapsedStr: string;
  reasoningStatus: "ACTIVE" | "COUNTDOWN" | "COUNTDOWN_ZERO" | "RECORDED";
  isDecisionRevealed: boolean;
  onTypingFinished?: () => void;
  alreadyCompleted?: boolean;
}

const AnalysisStreamViewer: React.FC<AnalysisStreamViewerProps> = React.memo(({
  activeStageText,
  activeTabConfig,
  activeTabIdx,
  totalTabs,
  activeTab,
  latestDecision,
  rawThesis,
  viewThesisHref,
  elapsedStr,
  reasoningStatus,
  isDecisionRevealed,
  onTypingFinished,
  alreadyCompleted = false,
}) => {
  const [charIdx, setCharIdx] = useState<number>(() =>
    alreadyCompleted ? activeStageText.length : 0
  );
  const [isTyping, setIsTyping] = useState<boolean>(!alreadyCompleted);
  const hasFinishedRef = React.useRef<boolean>(alreadyCompleted);
  const onTypingFinishedRef = React.useRef(onTypingFinished);
  onTypingFinishedRef.current = onTypingFinished;

  useEffect(() => {
    if (alreadyCompleted) {
      setCharIdx(activeStageText.length);
      setIsTyping(false);
      hasFinishedRef.current = true;
      return;
    }

    let timer: NodeJS.Timeout;

    if (charIdx < activeStageText.length) {
      setIsTyping(true);
      timer = setTimeout(() => {
        setCharIdx((prev) => Math.min(activeStageText.length, prev + 1));
      }, 35);
    } else {
      setIsTyping(false);
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        if (onTypingFinishedRef.current) {
          onTypingFinishedRef.current();
        }
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [charIdx, activeStageText.length, alreadyCompleted]);

  return (
    <div className="border-t border-[#1b1b1b]/80 bg-[#070707]">
      {/* CONSOLE TYPING WORKSPACE — DISTINCT TERMINAL SCREEN */}
      <div className="relative px-4 sm:px-6 py-4 space-y-2.5 bg-[#050c08] border-b border-[#102216]/90 shadow-[inset_0_0_24px_rgba(0,0,0,0.85)]">
        {/* Subtle terminal phosphor ambient wash */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(111,227,154,0.04),transparent_65%)] transform-gpu"
          aria-hidden="true"
        />

        {/* Stage Title & Progress */}
        <div className="relative flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-[#85858a]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-livepulse" />
            <span className="text-[#6fe39a] font-medium uppercase tracking-wider">
              {activeTabConfig.title}
            </span>
          </div>
          <span className="text-[#55555e] uppercase">
            STAGE {activeTabIdx + 1} OF {totalTabs}
          </span>
        </div>

        {/* Stage Typewriter Text */}
        <div className="relative min-h-[48px] sm:min-h-[40px] flex items-start">
          <p className="font-mono text-xs sm:text-[13px] text-[#e0e8e3] font-normal leading-relaxed">
            {activeStageText.slice(0, charIdx)}
            <span
              className={cn(
                "inline-block w-1.5 h-3.5 bg-[#6fe39a] ml-1 align-middle",
                isTyping ? "opacity-100" : "animate-pulse"
              )}
              aria-hidden="true"
            />
          </p>
        </div>

        {/* GLYPH'S VIEW METADATA SYNTHESIS (VISIBLE WHEN GLYPH'S VIEW TAB IS ACTIVE) */}
        {activeTab === "glyph-view" && (
          <div className="relative pt-2.5 border-t border-[#102216]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
            {isDecisionRevealed ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[#6fe39a] font-medium">
                  CONVICTION {latestDecision?.conviction != null ? `${latestDecision.conviction}%` : "--"}
                </span>
                <span className="text-[#333338]">·</span>
                <span className="text-[#d4d4d8]">
                  DIRECTION {latestDecision?.action === "OPEN_LONG" ? "LONG" : latestDecision?.action === "OPEN_SHORT" ? "SHORT" : latestDecision?.action === "NO_TRADE" ? "NO_TRADE" : latestDecision?.action === "CLOSE" ? "CLOSE" : "HOLD"}
                </span>
                {rawThesis?.invalidation && (
                  <>
                    <span className="text-[#333338]">·</span>
                    <span className="text-[#71717a]">
                      INVALIDATION: <span className="text-[#b8a77a]">{rawThesis.invalidation}</span>
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#85858a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse" />
                <span className="uppercase tracking-wider text-[10px] text-[#fbbf24]">
                  COMMITTING VERIFIED REASONING...
                </span>
              </div>
            )}

            <Link
              href={viewThesisHref}
              className="inline-flex items-center gap-1.5 text-xs text-[#85858a] hover:text-[#6fe39a] transition-colors group self-start sm:self-auto"
            >
              <span className="border-b border-[#333338] group-hover:border-[#6fe39a] pb-0.5">
                GLYPH&apos;S VIEW
              </span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>

      {/* CONSOLE STATUS FOOTER BAR */}
      <div className="px-4 sm:px-6 py-2 bg-[#050505] flex items-center justify-between font-mono text-[10px] text-[#71717a]">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              !isDecisionRevealed
                ? "bg-[#6fe39a] animate-livepulse"
                : "bg-[#6fe39a]"
            )}
          />
          <span className="text-[#a1a1aa] uppercase tracking-wider">
            {!isDecisionRevealed ? "REASONING ACTIVE" : "DECISION RECORDED"}
          </span>
        </div>
        <div
          className={cn(
            "uppercase tracking-wider font-mono",
            !isDecisionRevealed
              ? "text-[#6fe39a] font-medium"
              : "text-[#85858a]"
          )}
        >
          {!isDecisionRevealed
            ? `STAGE ${activeTabIdx + 1} OF ${totalTabs}`
            : "5/5 STAGES COMPLETE"}
        </div>
      </div>
    </div>
  );
});

AnalysisStreamViewer.displayName = "AnalysisStreamViewer";

// ============================================================================
// SUBCOMPONENT: TechMarquee (Memoized Pure-CSS GPU Marquee)
// ============================================================================
const TechMarquee: React.FC = React.memo(() => (
  <div className="w-full border-t border-[#171717] bg-[#000000] flex items-stretch h-12 sm:h-14 overflow-hidden relative select-none">
    {/* Intro Tag */}
    <div className="flex items-center px-4 sm:px-6 bg-[#000000] border-r border-[#171717] font-mono text-[10px] sm:text-[11px] tracking-widest text-[#555559] uppercase shrink-0 z-10">
      BUILT ON
    </div>

    {/* Marquee Viewport with gradient masks */}
    <div className="flex-1 overflow-hidden relative flex items-center [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className="animate-marquee items-center gap-8 sm:gap-12 px-6 transform-gpu">
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
));

TechMarquee.displayName = "TechMarquee";

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================
export const Hero: React.FC<HeroProps> = ({
  openPosition = null,
  latestDecision: initialLatestDecision = null,
  latestAnalysis: initialLatestAnalysis = null,
  cycleCount = 6,
  recentEvents = [],
}) => {
  // 1. DETERMINISTIC AUTONOMOUS STATE MACHINE
  // Stages: 0: fundamental -> 1: technical -> 2: risk -> 3: market -> 4: glyph-view
  type StagePhase = "TYPING" | "PAUSED" | "COUNTDOWN" | "REVEALED";

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [stagePhase, setStagePhase] = useState<StagePhase>("TYPING");
  const [isDecisionRevealed, setIsDecisionRevealed] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<AnalysisTab | null>(null);
  const [completedTabs, setCompletedTabs] = useState<Set<AnalysisTab>>(() => new Set());
  const [cycleNum, setCycleNum] = useState<number>(() => cycleCount || 6);
  const [mounted, setMounted] = useState<boolean>(false);
  const [liveLatestDecision, setLiveLatestDecision] = useState<LandingLatestDecision | null>(initialLatestDecision);
  const [liveLatestAnalysis, setLiveLatestAnalysis] = useState<LandingAnalysisState | null>(initialLatestAnalysis);

  const latestDecision = liveLatestDecision;
  const latestAnalysis = liveLatestAnalysis;

  // Autonomous timestamps
  const [cycleStartTime, setCycleStartTime] = useState<number>(() => Date.now());
  const [lastStageStartTime, setLastStageStartTime] = useState<number>(() => Date.now());
  const [nowSec, setNowSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    const loadDecisionTelemetry = async () => {
      try {
        const response = await fetch("/api/overview/decision", { cache: "no-store" });
        if (!response.ok || !active) return;
        const payload = await response.json() as {
          latestDecision: LandingLatestDecision | null;
          latestAnalysis: LandingAnalysisState | null;
        };
        if (active) {
          setLiveLatestDecision(payload.latestDecision);
          setLiveLatestAnalysis(payload.latestAnalysis);
        }
      } catch {
        // Keep the last authoritative snapshot visible while polling retries.
      }
    };

    void loadDecisionTelemetry();
    const interval = setInterval(loadDecisionTelemetry, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Ticking clock only for elapsed display
  useEffect(() => {
    const interval = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update lastStageStartTime whenever stage changes
  useEffect(() => {
    setLastStageStartTime(Date.now());
  }, [currentStageIdx]);

  // Timers refs
  const pauseTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const isDecisionFinal = completedTabs.has("glyph-view") || isDecisionRevealed;

  // Event handler called strictly when typing has 100% completed for a tab
  const handleTypingFinished = useCallback((tabId: AnalysisTab) => {
    setCompletedTabs((prev) => {
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setStagePhase("PAUSED");

    // 2.5 seconds (2500ms) pause after typing completes before advancing to next stage
    pauseTimerRef.current = setTimeout(() => {
      setCurrentStageIdx((prevIdx) => {
        if (prevIdx < 4) {
          setStagePhase("TYPING");
          return prevIdx + 1;
        } else {
          setIsDecisionRevealed(true);
          setStagePhase("REVEALED");
          return 4;
        }
      });
    }, 2500);
  }, []);

  const currentStage = STAGES[currentStageIdx];

  // Active tab strictly follows current reasoning stage during autonomous sequence,
  // or user selection if user clicked a tab
  const activeTab: AnalysisTab = selectedTab || currentStage.id;

  const activeStageConfig = STAGES.find((s) => s.id === activeTab) || currentStage;

  const handleTabClick = useCallback(
    (tabId: AnalysisTab) => {
      setSelectedTab(tabId);
    },
    []
  );

  const reasoningStatus: "ACTIVE" | "COUNTDOWN" | "COUNTDOWN_ZERO" | "RECORDED" =
    !isDecisionFinal ? "ACTIVE" : "RECORDED";

  // Dynamic cycle number
  const cycleNumber = cycleNum;

  // Cycle & Stage Timestamps
  const { startedTime, lastUpdateTime, elapsedStr } = useMemo(() => {
    if (!mounted) {
      return {
        startedTime: "--:--:-- UTC",
        lastUpdateTime: "--:--:-- UTC",
        elapsedStr: "00:00",
      };
    }

    const started =
      new Date(cycleStartTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC";

    const lastUpdate =
      new Date(lastStageStartTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC";

    const elapsedTotalSec = Math.max(0, nowSec - Math.floor(cycleStartTime / 1000));
    const mins = Math.floor(elapsedTotalSec / 60);
    const secs = elapsedTotalSec % 60;
    const elapsed = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;

    return { startedTime: started, lastUpdateTime: lastUpdate, elapsedStr: elapsed };
  }, [mounted, cycleStartTime, lastStageStartTime, nowSec]);

  // 2. OPERATION & STOCK IDENTITY (Memoized)
  const hasActivePosition = Boolean(openPosition);
  const hasActiveDecision = Boolean(latestDecision);
  const isStandbyMode = !hasActivePosition && !hasActiveDecision && isDecisionRevealed;
  const rawAsset = openPosition?.asset || latestDecision?.asset || "STANDBY";
  const asset = rawAsset.toUpperCase();
  const positionSubtitle = hasActivePosition
    ? `${openPosition!.side} POSITION · ${openPosition!.leverage}× SIM`
    : hasActiveDecision
      ? "STANDBY // NO UNREALIZED RISK EXPOSURE"
      : "STANDBY // AWAITING FIRST COGNITIVE CYCLE";

  // 3. INTERACTIVE TAB STATE (Follows Glyph's current stage)
  const rawThesis = latestDecision?.thesis;

  const marketContextText = latestAnalysis?.marketContext
    ? [
      latestAnalysis.marketContext.price !== null ? `PRICE $${latestAnalysis.marketContext.price.toFixed(2)}` : null,
      latestAnalysis.marketContext.changePercent !== null ? `CHANGE ${latestAnalysis.marketContext.changePercent.toFixed(2)}%` : null,
      latestAnalysis.marketContext.volume !== null ? `VOLUME ${latestAnalysis.marketContext.volume.toLocaleString("en-US")}` : null,
      latestAnalysis.marketContext.trend ? `TREND ${latestAnalysis.marketContext.trend}` : null,
      latestAnalysis.marketContext.volatilityPercent !== null ? `VOLATILITY ${latestAnalysis.marketContext.volatilityPercent.toFixed(2)}%` : null,
    ].filter((part): part is string => part !== null).join(" · ") || "ANALYZING"
    : "ANALYZING";

  const riskContextText = latestAnalysis?.riskContext
    ? [
      latestAnalysis.riskContext.regime ? `REGIME ${latestAnalysis.riskContext.regime.toUpperCase()}` : null,
      latestAnalysis.riskContext.level ? `LEVEL ${latestAnalysis.riskContext.level.toUpperCase()}` : null,
      latestAnalysis.riskContext.details,
    ].filter((part): part is string => part !== null).join(" · ") || "ANALYZING"
    : "ANALYZING";

  const tabContents = useMemo<Record<AnalysisTab, string>>(
    () => ({
      fundamental:
        rawThesis?.fundamental ||
        "Autonomous valuation engine in standby. Fundamental cash flows, multiples, and revenue acceleration models will synthesize when market intake cycle begins.",
      technical:
        rawThesis?.technical ||
        "Technical chart structure, volume surges, and moving average expansion channels will calculate automatically on cycle execution.",
      risk:
        latestAnalysis?.riskContext ? riskContextText : "ANALYZING",
      market:
        latestAnalysis?.marketContext ? marketContextText : "ANALYZING",
      "glyph-view":
        "Glyph is currently in autonomous standby state on Robinhood Chain Testnet. System initialized and awaiting first live cognitive reasoning cycle.",
    }),
    [latestAnalysis, marketContextText, rawThesis, riskContextText]
  );

  const activeTabIdx = TABS.findIndex((t) => t.id === activeTab);
  const activeTabConfig = TABS[activeTabIdx >= 0 ? activeTabIdx : 0];
  const activeStageText = tabContents[activeTab];

  const targetTradePath =
    latestDecision?.tradeNumber ||
    openPosition?.tradeNumber ||
    (latestDecision?.tradeId ? latestDecision.tradeId : null) ||
    (openPosition?.tradeId ? openPosition.tradeId : null);

  const viewThesisHref = targetTradePath ? `/trades/${targetTradePath}` : "/trades";

  // 4. POSITION TELEMETRY (Memoized Formatted Values)
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

  // 5. DECISION CONTEXT (Dynamic Unresolved States During Analysis and Countdown)
  const targetFormatted = isDecisionRevealed
    ? latestDecision
      ? `${latestDecision.asset} · ${latestDecision.action === "OPEN_LONG" ? "LONG" : latestDecision.action === "OPEN_SHORT" ? "SHORT" : latestDecision.action === "NO_TRADE" ? "NO_TRADE" : latestDecision.action === "CLOSE" ? "CLOSE" : "HOLD"}`
      : "STANDBY"
    : "ANALYZING...";

  const targetColor = isDecisionRevealed ? "text-[#f3f3f4]" : "text-[#85858a]";

  const convictionFormatted = isDecisionRevealed && latestDecision?.conviction != null
    ? `${latestDecision.conviction}%`
    : "--";

  const convictionColor = isDecisionRevealed && latestDecision?.conviction != null ? "text-[#6fe39a]" : "text-[#55555e]";

  const fundamentalFormatted = completedTabs.has("fundamental") && latestAnalysis?.fundamentalScore != null
    ? `${latestAnalysis.fundamentalScore}`
    : "--";

  const technicalFormatted = completedTabs.has("technical") && latestAnalysis?.technicalScore != null
    ? `${latestAnalysis.technicalScore}`
    : "--";

  const riskRegime = latestAnalysis?.riskContext.regime;
  const riskRegimeFormatted = completedTabs.has("risk") && riskRegime
    ? riskRegime.toUpperCase()
    : "--";

  const riskRegimeColor = completedTabs.has("risk") && riskRegime ? "text-[#fbbf24]" : "text-[#55555e]";

  return (
    <section className="relative w-full overflow-hidden border-b border-[#171717] bg-[#000000]">
      {/* Precision technical grid background (Memoized) */}
      <GridBackground glowColor="emerald" intensity="medium" gridSize={32} />

      {/* Subtle radial ambient light wash (GPU composited layers) */}
      <div
        className="absolute -top-4 right-10 w-[380px] h-[260px] pointer-events-none z-1 opacity-40 transform-gpu bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-24 w-[520px] h-[220px] pointer-events-none z-1 opacity-30 transform-gpu bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_68%)]"
        aria-hidden="true"
      />

      {/* Hero Live Operational Terminal Workspace */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* SINGLE BORDERED TERMINAL FRAME */}
        <div className="border border-[#1b1b1b]/80 bg-[#050505] relative overflow-hidden shadow-2xl">
          {/* 1. TERMINAL HEADER */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-[#1b1b1b]/80 bg-[#080808] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={cn(
                "w-2 h-2 rounded-full shrink-0",
                isStandbyMode
                  ? "bg-[#fbbf24] shadow-[0_0_0_2px_rgba(251,191,36,0.25)] animate-pulse"
                  : "bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.25)] animate-livepulse"
              )} />
              <span className="font-mono text-xs sm:text-[13px] tracking-wider uppercase text-[#f3f3f4] font-medium">
                {isStandbyMode ? "AUTONOMOUS AGENT // STANDBY" : "AUTONOMOUS OPERATION // LIVE"}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#85858a]">
              <span className={cn(
                "font-medium tracking-wider",
                isStandbyMode ? "text-[#fbbf24]" : "text-[#6fe39a]"
              )}>
                {isStandbyMode ? "STATUS: DORMANT / READY" : `CYCLE #${cycleNumber}`}
              </span>
            </div>
          </div>

          {/* 2. PRIMARY SUBJECT (STOCK IDENTITY) + CYCLE CONTEXT */}
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
              {isStandbyMode ? (
                <>
                  <div>
                    <span className="text-[#55555a]">CYCLE TRIGGER </span>
                    <span className="text-[#d4d4d8]">CRON SCHEDULED</span>
                  </div>
                  <div>
                    <span className="text-[#55555a]">AGENT UPTIME </span>
                    <span className="text-[#d4d4d8]">DAY 1</span>
                  </div>
                  <div>
                    <span className="text-[#55555a]">SYSTEM STATUS </span>
                    <span className="text-[#fbbf24] font-medium">AWAITING INTAKE</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-[#55555a]">STARTED </span>
                    <span className="text-[#d4d4d8] tabular-nums" suppressHydrationWarning>
                      {startedTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#55555a]">LAST UPDATE </span>
                    <span className="text-[#d4d4d8] tabular-nums" suppressHydrationWarning>
                      {lastUpdateTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#55555a]">ELAPSED </span>
                    <span className="text-[#6fe39a] tabular-nums font-medium" suppressHydrationWarning>
                      {elapsedStr}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. INTERACTIVE LIVE ANALYSIS CONSOLE WITH GLYPH'S VIEW TAB */}
          <div className="border-t border-[#1b1b1b]/80 bg-[#070707]">
            {/* CONSOLE HEADER */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-[#141414]/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#080808]">
              {/* Left: Console Identity & Mode */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", isStandbyMode ? "bg-[#fbbf24] animate-pulse" : "bg-[#6fe39a] animate-livepulse")} />
                  <span className="font-mono text-xs sm:text-[13px] tracking-wider uppercase text-[#f3f3f4] font-medium">
                    {isStandbyMode
                      ? "SYSTEM DIAGNOSTICS // READINESS VERIFIED"
                      : activeTab === "glyph-view"
                        ? `GLYPH // FORMING VIEW ${asset}`
                        : `${activeStageConfig.consoleTitle} ${asset}`}
                  </span>
                </div>

                <div className="font-mono text-[10px] text-[#55555a] flex items-center gap-1 border border-transparent px-1 py-0.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", isStandbyMode ? "bg-[#fbbf24]" : "bg-[#6fe39a] animate-livepulse")} />
                  <span>{isStandbyMode ? "STANDBY" : "AUTO"}</span>
                </div>
              </div>

              {/* Right: Terminal-Style Button Tabs (only show when live analysis is active) */}
              {!isStandbyMode && (
                <div
                  role="tablist"
                  aria-label="Analysis Stages"
                  className="flex flex-wrap items-center justify-start md:justify-end gap-1.5 font-mono"
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleTabClick(tab.id)}
                        className={cn(
                          "text-[10px] sm:text-[11px] tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 border transition-all cursor-pointer font-mono whitespace-nowrap",
                          isActive
                            ? "bg-[#0e1713] border-[#6fe39a]/80 text-[#6fe39a] shadow-[0_0_8px_rgba(111,227,154,0.12)] font-medium"
                            : "bg-[#090909] border-[#202024] text-[#71717a] hover:text-[#e4e4e7] hover:border-[#35353c]"
                        )}
                      >
                        [ {tab.label} ]
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SCREEN: Standby Diagnostics Checklist vs Live Streaming Viewer */}
            {isStandbyMode ? (
              <div className="p-4 sm:p-6 font-mono space-y-4 bg-[#050505]">
                <div className="flex items-center justify-between border-b border-[#141414] pb-2">
                  <div className="flex items-center gap-2 text-xs text-[#6fe39a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
                    <span>SUBSYSTEM READINESS CHECKLIST</span>
                  </div>
                  <span className="text-[10px] text-[#55555a] uppercase font-mono">ALL GATES OPERATIONAL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#080808] border border-[#141414] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#85858a]">[01] ON-CHAIN IDENTITY</span>
                      <span className="text-[#6fe39a] font-medium">VERIFIED</span>
                    </div>
                    <p className="text-[11px] text-[#55555a]">
                      ERC-8004 Identity registered on Robinhood Chain Testnet.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#141414] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#85858a]">[02] PRIMARY WALLET</span>
                      <span className="text-[#6fe39a] font-medium">ARMED</span>
                    </div>
                    <p className="text-[11px] text-[#55555a] truncate">
                      Autonomous Safe account linked & gas funded.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#141414] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#85858a]">[03] RISK POLICY</span>
                      <span className="text-[#6fe39a] font-medium">ACTIVE</span>
                    </div>
                    <p className="text-[11px] text-[#55555a]">
                      Deterministic constraints: max 2× leverage, 10% max allocation.
                    </p>
                  </div>

                  <div className="p-3 bg-[#080808] border border-[#141414] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#85858a]">[04] MARKET INTAKE</span>
                      <span className="text-[#fbbf24] font-medium">STANDBY</span>
                    </div>
                    <p className="text-[11px] text-[#55555a]">
                      Whitelisted universe: NVDA, AAPL, MSFT · Awaiting trigger.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#080808]/60 border border-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#71717a]">
                    No reasoning cycles recorded yet. Glyph is in autonomous standby awaiting scheduled cron intake.
                  </span>
                  <span className="text-[#85858a] shrink-0 font-medium">
                    STATUS: READY
                  </span>
                </div>
              </div>
            ) : (
              <AnalysisStreamViewer
                key={activeTab}
                activeStageText={activeStageText}
                activeTabConfig={activeTabConfig}
                activeTabIdx={activeTabIdx}
                totalTabs={TABS.length}
                activeTab={activeTab}
                latestDecision={latestDecision}
                rawThesis={rawThesis}
                viewThesisHref={viewThesisHref}
                elapsedStr={elapsedStr}
                reasoningStatus={reasoningStatus}
                isDecisionRevealed={isDecisionFinal}
                onTypingFinished={() => handleTypingFinished(activeTab)}
                alreadyCompleted={completedTabs.has(activeTab)}
              />
            )}
          </div>

          {/* 4. POSITION + DECISION (BALANCED 2 COLUMNS) */}
          {/* 4. POSITION + DECISION (BALANCED 2 COLUMNS) */}
          <div className="border-t border-[#1b1b1b]/80 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]/80">
            {/* COLUMN 1: POSITION */}
            <div className="p-4 sm:p-5 space-y-2.5 bg-[#050505]">
              <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest border-b border-[#141414]/80 pb-1.5 flex items-center justify-between">
                <span>POSITION</span>
                {isStandbyMode && (
                  <span className="text-[9px] text-[#85858a] tracking-wider uppercase">
                    NO ACTIVE TRADES
                  </span>
                )}
              </div>
              <div className="space-y-1.5 font-mono text-xs sm:text-[13px]">
                {isStandbyMode ? (
                  <>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">ENTRY</span>
                      <span className="text-[#85858a] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">CURRENT</span>
                      <span className="text-[#85858a] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">SIZE</span>
                      <span className="text-[#85858a] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">NOTIONAL</span>
                      <span className="text-[#85858a] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">UNREALIZED</span>
                      <span className="text-[#85858a] font-medium">—</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">ENTRY</span>
                      <OneShotTypewriter
                        value={entryFormatted}
                        delay={100}
                        className="text-[#f3f3f4] font-medium tabular-nums"
                      />
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">CURRENT</span>
                      <OneShotTypewriter
                        value={currentFormatted}
                        delay={1100}
                        className="text-[#f3f3f4] font-medium tabular-nums"
                      />
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">SIZE</span>
                      <OneShotTypewriter
                        value={sizeFormatted}
                        delay={2100}
                        className="text-[#d4d4d8] tabular-nums"
                      />
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">NOTIONAL</span>
                      <OneShotTypewriter
                        value={notionalFormatted}
                        delay={3100}
                        className="text-[#d4d4d8] tabular-nums"
                      />
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">UNREALIZED</span>
                      <OneShotTypewriter
                        value={unrealizedFormatted}
                        delay={4100}
                        className={cn("font-medium tabular-nums", unrealizedColor)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* COLUMN 2: DECISION */}
            <div className="p-4 sm:p-5 space-y-2.5 bg-[#050505]">
              <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest border-b border-[#141414]/80 pb-1.5 flex items-center justify-between">
                <span>DECISION</span>
                {isStandbyMode ? (
                  <span className="flex items-center gap-1 text-[9px] text-[#85858a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85858a]" />
                    <span className="tracking-wider">STANDBY</span>
                  </span>
                ) : !isDecisionFinal ? (
                  <span className="flex items-center gap-1 text-[9px] text-[#6fe39a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-livepulse" />
                    <span className="tracking-wider">COMPUTING</span>
                  </span>
                ) : null}
              </div>
              <div className="space-y-1.5 font-mono text-xs sm:text-[13px]">
                {isStandbyMode ? (
                  <>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">TARGET</span>
                      <span className="font-medium text-[#85858a]">STANDBY</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">CONVICTION</span>
                      <span className="text-[#55555e] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">FUNDAMENTAL</span>
                      <span className="text-[#55555e] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">TECHNICAL</span>
                      <span className="text-[#55555e] font-medium">—</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">RISK REGIME</span>
                      <span className="text-[#55555e] font-medium">—</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">TARGET</span>
                      {isDecisionFinal ? (
                        <OneShotTypewriter
                          value={targetFormatted}
                          speed={20}
                          className={cn("font-medium truncate", targetColor)}
                        />
                      ) : (
                        <span className="text-[#85858a] font-medium flex items-center gap-1 text-xs sm:text-[13px]">
                          <span>ANALYZING</span>
                          <span className="inline-block w-1.5 h-3 bg-[#6fe39a] animate-pulse align-middle" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">CONVICTION</span>
                      {isDecisionFinal ? (
                        <OneShotTypewriter
                          value={convictionFormatted}
                          speed={20}
                          className={cn("font-medium tabular-nums", convictionColor)}
                        />
                      ) : (
                        <span className="text-[#55555e] font-medium text-xs sm:text-[13px]">
                          --
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">FUNDAMENTAL</span>
                      {completedTabs.has("fundamental") ? (
                        <OneShotTypewriter
                          value={fundamentalFormatted}
                          speed={20}
                          className="text-[#d4d4d8] tabular-nums font-medium"
                        />
                      ) : (
                        <span className="text-[#55555e] font-medium text-xs sm:text-[13px]">
                          --
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">TECHNICAL</span>
                      {completedTabs.has("technical") ? (
                        <OneShotTypewriter
                          value={technicalFormatted}
                          speed={20}
                          className="text-[#d4d4d8] tabular-nums font-medium"
                        />
                      ) : (
                        <span className="text-[#55555e] font-medium text-xs sm:text-[13px]">
                          --
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-white/75 uppercase text-[11px]">RISK REGIME</span>
                      {completedTabs.has("risk") ? (
                        <OneShotTypewriter
                          value={riskRegimeFormatted}
                          speed={20}
                          className={cn("font-medium", riskRegimeColor)}
                        />
                      ) : (
                        <span className="text-[#55555e] font-medium text-xs sm:text-[13px]">
                          --
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 5. AUTONOMOUS PIPELINE (COMPACT HORIZONTAL PIPELINE WITH CONNECTORS) */}
          <div className="border-t border-[#1b1b1b]/80 p-4 sm:p-6 space-y-3 bg-[#060606]">
            <div className="font-mono text-[10px] text-[#55555a] uppercase tracking-widest">
              AUTONOMOUS PIPELINE
            </div>

            {isStandbyMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 font-mono relative">
                {/* 01 MARKET */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">01 MARKET</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="text-[#85858a] font-medium">STANDBY</span>
                    <span className="text-[#55555e]">○</span>
                  </div>
                </div>

                {/* 02 ANALYSIS */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">02 ANALYSIS</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="text-[#85858a] font-medium">STANDBY</span>
                    <span className="text-[#55555e]">○</span>
                  </div>
                </div>

                {/* 03 DECISION */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">03 DECISION</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="text-[#85858a] font-medium">STANDBY</span>
                    <span className="text-[#55555e]">○</span>
                  </div>
                </div>

                {/* 04 RISK */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">04 RISK</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="text-[#6fe39a] font-medium">ARMED</span>
                    <span className="text-[#6fe39a]">✓</span>
                  </div>
                </div>

                {/* 05 EXECUTION */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#66666e] block">05 EXECUTION</span>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="text-[#85858a] font-medium">IDLE</span>
                    <span className="text-[#55555e]">○</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 font-mono relative">
                {/* 01 MARKET */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">01 MARKET</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={cn("font-medium", currentStage.pipeline.market.color)}>
                      {currentStage.pipeline.market.status}
                    </span>
                    <span className={currentStage.pipeline.market.color}>
                      {currentStage.pipeline.market.symbol}
                    </span>
                  </div>
                </div>

                {/* 02 ANALYSIS */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">02 ANALYSIS</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={cn("font-medium", currentStage.pipeline.analysis.color)}>
                      {currentStage.pipeline.analysis.status}
                    </span>
                    {currentStage.pipeline.analysis.pulse ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.3)] animate-livepulse" />
                    ) : (
                      <span className={currentStage.pipeline.analysis.color}>
                        {currentStage.pipeline.analysis.symbol}
                      </span>
                    )}
                  </div>
                </div>

                {/* 03 DECISION */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">03 DECISION</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={cn("font-medium", currentStage.pipeline.decision.color)}>
                      {currentStage.pipeline.decision.status}
                    </span>
                    {currentStage.pipeline.decision.pulse ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_0_2px_rgba(251,191,36,0.3)] animate-livepulse" />
                    ) : (
                      <span className={currentStage.pipeline.decision.color}>
                        {currentStage.pipeline.decision.symbol}
                      </span>
                    )}
                  </div>
                </div>

                {/* 04 RISK */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#66666e] block">04 RISK</span>
                    <span className="hidden sm:inline-block text-[#333338] text-[11px]">──</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={cn("font-medium", currentStage.pipeline.risk.color)}>
                      {currentStage.pipeline.risk.status}
                    </span>
                    {currentStage.pipeline.risk.pulse ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.3)] animate-livepulse" />
                    ) : (
                      <span className={currentStage.pipeline.risk.color}>
                        {currentStage.pipeline.risk.symbol}
                      </span>
                    )}
                  </div>
                </div>

                {/* 05 EXECUTION */}
                <div className="relative p-2.5 sm:p-3 bg-[#090909] border border-[#171717]/80 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#66666e] block">05 EXECUTION</span>
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    {currentStageIdx === 4 && !isDecisionRevealed ? (
                      <>
                        <span className="font-medium text-[#fbbf24]">COMMITTING</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_0_2px_rgba(251,191,36,0.3)] animate-livepulse" />
                      </>
                    ) : (
                      <>
                        <span className={cn("font-medium", currentStage.pipeline.execution.color)}>
                          {currentStage.pipeline.execution.status}
                        </span>
                        {currentStage.pipeline.execution.pulse ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.3)] animate-livepulse" />
                        ) : (
                          <span className={currentStage.pipeline.execution.color}>
                            {currentStage.pipeline.execution.symbol}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 6. OPERATION STATUS FOOTER */}
          <div className="border-t border-[#1b1b1b]/80 px-4 sm:px-6 py-2.5 bg-[#080808] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px] text-[#71717a]">
            <div className="flex items-center gap-2">
              <span className="text-[#55555a] uppercase tracking-wider">OPERATION STATUS:</span>
              <span className="text-[#f3f3f4] font-medium tracking-wide">
                {isDecisionRevealed
                  ? "POSITION ACTIVE · PAPER TRADE · SIMULATED CAPITAL"
                  : stagePhase === "COUNTDOWN"
                    ? "REASONING COMPLETE · COMMITTING CONCLUSION"
                    : "CYCLE IN PROGRESS · PAPER TRADE · SIMULATED CAPITAL"}
              </span>
            </div>
            <div className="text-[#55555a]">
              NETWORK: ROBINHOOD TESTNET // 46630
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee Strip (GPU Composited) */}
      <TechMarquee />
    </section>
  );
};
