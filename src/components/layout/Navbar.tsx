"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { HeaderMetricsData } from "@/lib/header-stats";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  hash?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "OVERVIEW", href: "/" },
  { label: "IDENTITY", href: "/identity" },
  { label: "TRADES", href: "/trades" },
  { label: "LIFE LOG", href: "/life" },
  { label: "ABOUT", href: "/about" },
];

export interface NavbarProps {
  agentId?: string;
  initialMetrics?: Partial<HeaderMetricsData>;
}

// In-memory module cache across client-side page transitions
let globalHeaderCache: HeaderMetricsData | null = null;
let activeFetchPromise: Promise<HeaderMetricsData | null> | null = null;

function formatAgentId(agentId: string | number | undefined): string {
  const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === "4663";
  const fallback = isMainnet ? "485" : "5";
  return String(agentId || fallback).padStart(3, "0");
}

async function fetchHeaderStats(): Promise<HeaderMetricsData | null> {
  if (activeFetchPromise) return activeFetchPromise;

  activeFetchPromise = fetch("/api/agent/header-stats", { cache: "no-store" })
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to fetch header stats");
      const data = await res.json();
      if (data && !data.error) {
        globalHeaderCache = data as HeaderMetricsData;
        return data as HeaderMetricsData;
      }
      return null;
    })
    .catch((err) => {
      console.warn("[Navbar] Stats fetch warning:", err);
      return null;
    })
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

export const Navbar: React.FC<NavbarProps> = ({
  agentId: propAgentId,
  initialMetrics,
}) => {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState<string>("");
  const [utcTime, setUtcTime] = useState<string>("");

  // Check if caller supplied valid non-mocked data
  const hasValidInitial = Boolean(
    initialMetrics &&
    typeof initialMetrics.treasuryEquity === "number" &&
    typeof initialMetrics.pnlPercent === "number"
  );

  // Use initialMetrics if valid, else use global memory cache if present, else null (loading)
  const initialData: HeaderMetricsData | null = hasValidInitial
    ? (initialMetrics as HeaderMetricsData)
    : globalHeaderCache;

  const [metrics, setMetrics] = useState<HeaderMetricsData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (hasValidInitial && initialMetrics) {
      globalHeaderCache = {
        ...(globalHeaderCache || {}),
        ...initialMetrics,
      } as HeaderMetricsData;
    }
  }, [hasValidInitial, initialMetrics]);

  // Track hash on client for hash-based navigation (e.g. #current-thesis)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update live UTC terminal clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live metrics from API without flashing fallback defaults
  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      // If we don't have cached data yet, ensure loading state is active
      if (!globalHeaderCache && !hasValidInitial) {
        setLoading(true);
      }

      const freshData = await fetchHeaderStats();
      if (!isMounted) return;

      if (freshData) {
        setMetrics(freshData);
        setLoading(false);
        setHasError(false);
      } else if (!globalHeaderCache && !hasValidInitial) {
        setLoading(false);
        setHasError(true);
      }
    }

    loadStats();
    const pollInterval = setInterval(loadStats, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [hasValidInitial, propAgentId]);

  const isItemActive = (item: NavItem) => {
    if (item.href === "/") {
      return pathname === "/" && (!currentHash || currentHash === "overview");
    }
    if (item.hash) {
      return pathname === "/" && currentHash === item.hash;
    }
    if (item.href === "/trades") {
      return pathname.startsWith("/trades");
    }
    return pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  };

  const pnlSign = (metrics?.pnlDollar ?? 0) > 0 ? "+" : (metrics?.pnlDollar ?? 0) < 0 ? "-" : "";
  const pnlPercentSign = (metrics?.pnlPercent ?? 0) > 0 ? "+" : "";
  const pnlColorClass =
    (metrics?.pnlPercent ?? 0) > 0
      ? "text-[#6fe39a]"
      : (metrics?.pnlPercent ?? 0) < 0
        ? "text-[#c47a7a]"
        : "text-[#85858a]";

  const formatTreasuryValue = (value: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === "4663";
  const fallbackAgentId = isMainnet ? "485" : "5";
  const formattedAgentId = formatAgentId(
    metrics?.agentId || propAgentId || process.env.NEXT_PUBLIC_GLYPH_AGENT_ID || fallbackAgentId
  );

  const wins = metrics?.winningTradesCount ?? 0;
  const losses = metrics?.losingTradesCount ?? 0;
  const totalEvaluated = wins + losses;
  const winRateNumber =
    totalEvaluated > 0
      ? (metrics?.winRatePercent !== null && metrics?.winRatePercent !== undefined
        ? metrics.winRatePercent
        : (wins / totalEvaluated) * 100)
      : 0.0;
  const formattedWinRate = `${winRateNumber.toFixed(1)}% · ${wins}W / ${losses}L`;

  // Helper to determine if we should render skeleton for values
  const isValueLoading = loading && !metrics;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[#000000] border-b border-[#171717] select-none transform-gpu"
      role="banner"
    >
      {/* ========================================================================= */}
      {/* BARIS PERTAMA: IDENTITAS GLYPH (Glyph Identity Bar)                        */}
      {/* ========================================================================= */}
      <div className="w-full border-b border-[#171717]/80 bg-[#000000]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 h-11 sm:h-12 flex items-center justify-between gap-4">
          {/* Left: Dot + Logo + Brand Name + Tagline */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Pulsing Live Dot */}
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse shrink-0"
              aria-hidden="true"
            />

            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none shrink-0"
              aria-label="Glyph Home"
            >
              <div className="relative w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 overflow-hidden">
                <Image
                  src="/glyph-logo.png"
                  alt="Glyph Logo"
                  width={20}
                  height={20}
                  priority
                  className="w-full h-full object-contain filter brightness-110"
                />
              </div>
              <span className="font-sans text-xs sm:text-sm font-medium tracking-tight text-[#f3f3f4] group-hover:text-white transition-colors">
                GLYPH
              </span>
            </Link>

            {/* Divider & Autonomous Agent Tagline */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#222222] min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-[#71717a] tracking-wider uppercase truncate">
                ECONOMIC BEING · AUTONOMOUS AGENT
              </span>
            </div>
          </div>

          {/* Right: Operational Status & Verified Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Tagline Fallback */}
            <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase sm:hidden">
              AUTONOMOUS AGENT
            </span>

            {/* Verified Agent Link */}
            <Link
              href="/identity"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-transparent border border-[#1b1b1b] hover:border-[#2e2e2e] text-[#85858a] hover:text-[#f3f3f4] text-[10px] font-mono tracking-wider transition-colors"
            >
              <span className="w-1 h-1 bg-[#6fe39a] rounded-full" />
              <span>VERIFIED AGENT #{formattedAgentId}</span>
            </Link>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#1b1b1b] bg-[#050505] font-mono text-[10px] tracking-wider">
              <span className="text-[#55555a] hidden xs:inline">STATUS:</span>
              <span className="text-[#6fe39a] font-medium uppercase">
                {metrics?.agentStatus ?? "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARIS KEDUA: NAVIGASI TERMINAL (Workspace Navigation Bar)                   */}
      {/* ========================================================================= */}
      <div className="w-full border-b border-[#171717] bg-[#000000]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 h-9 sm:h-10 flex items-center justify-between gap-4">
          {/* Horizontal Terminal Navigation Links */}
          <nav
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1"
            aria-label="Terminal Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-1 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0",
                    active
                      ? "bg-[#141414] text-[#f3f3f4] font-medium border border-[#2b2b2b] shadow-sm"
                      : "text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#0a0a0a]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {active && (
                      <span
                        className="w-1 h-1 bg-[#6fe39a] rounded-full shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Live Terminal UTC Shift Telemetry */}
          <div className="hidden lg:flex items-center gap-3 font-mono text-[10px] text-[#55555a] tracking-wider shrink-0">
            <span className="text-[#333333]">/</span>
            <span>CYCLE #{metrics?.cycleCount ?? "1"}</span>
            <span className="text-[#333333]">·</span>
            <span className="text-[#85858a]">{utcTime || "UTC CLOCK"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BARIS KETIGA: STATISTIK / AGENT METRICS STRIP (Observability Strip)         */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#040404]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x divide-[#171717] border-x border-[#171717]">
            {/* Metric 1: PnL */}
            <div className="py-2 px-3.5 sm:px-5 flex flex-col justify-center shrink-0 min-w-[110px] sm:min-w-[130px]">
              <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase">
                PNL (SIM)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5 min-h-[18px] sm:min-h-[20px]">
                {isValueLoading ? (
                  <Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20 my-0.5 rounded-[2px]" />
                ) : metrics ? (
                  <>
                    <span className={cn("font-mono text-xs sm:text-sm font-medium", pnlColorClass)}>
                      {pnlPercentSign}
                      {metrics.pnlPercent.toFixed(2)}%
                    </span>
                    <span className="font-mono text-[10px] text-[#55555a] hidden md:inline">
                      ({pnlSign}${Math.abs(metrics.pnlDollar).toFixed(2)})
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-[#55555a]">—</span>
                )}
              </div>
            </div>

            {/* Metric 2: Treasury */}
            <div className="py-1.5 px-3.5 sm:px-5 flex flex-col justify-center shrink-0">
              <span className="font-mono text-[9px] text-[#55555a] tracking-[0.18em] uppercase mb-1">
                TREASURY // CAPITAL STATE
              </span>
              <div className="flex items-stretch gap-1.5 font-mono">
                <div
                  className="min-w-[104px] px-2 py-1.5 border border-[#244b38] border-l-2 bg-[#07110c] shadow-[inset_0_1px_0_rgba(111,227,154,0.08)]"
                  title="Cash yang tersedia untuk alokasi trade berikutnya"
                >
                  <span className="block text-[8px] tracking-[0.12em] text-[#6fe39a] uppercase">01 // available</span>
                  {isValueLoading ? (
                    <Skeleton className="h-3.5 w-20 mt-1 rounded-[2px]" />
                  ) : metrics ? (
                    <strong className="block mt-0.5 text-[11px] text-[#d9ffe5] font-medium"><span className="text-[#6fe39a]">$</span>{formatTreasuryValue(metrics.treasuryCash).replace("$", "")}</strong>
                  ) : <span className="text-[#55555a]">—</span>}
                </div>
                <div
                  className="min-w-[104px] px-2 py-1.5 border border-[#4d3b20] border-l-2 bg-[#120d05] shadow-[inset_0_1px_0_rgba(224,170,90,0.08)]"
                  title="Cash yang sedang terkunci pada posisi terbuka"
                >
                  <span className="block text-[8px] tracking-[0.12em] text-[#e0aa5a] uppercase">02 // committed</span>
                  {isValueLoading ? (
                    <Skeleton className="h-3.5 w-20 mt-1 rounded-[2px]" />
                  ) : metrics ? (
                    <strong className="block mt-0.5 text-[11px] text-[#ffe7bd] font-medium"><span className="text-[#e0aa5a]">$</span>{formatTreasuryValue(metrics.treasuryAllocatedMargin).replace("$", "")}</strong>
                  ) : <span className="text-[#55555a]">—</span>}
                </div>
                <div
                  className="min-w-[104px] px-2 py-1.5 border border-[#27455a] border-l-2 bg-[#071018] shadow-[inset_0_1px_0_rgba(112,183,223,0.08)]"
                  title="Nilai total treasury: cash, margin, dan unrealized PnL"
                >
                  <span className="block text-[8px] tracking-[0.12em] text-[#70b7df] uppercase">03 // total nav</span>
                  {isValueLoading ? (
                    <Skeleton className="h-3.5 w-20 mt-1 rounded-[2px]" />
                  ) : metrics ? (
                    <strong className="block mt-0.5 text-[11px] text-[#d7f1ff] font-medium"><span className="text-[#70b7df]">$</span>{formatTreasuryValue(metrics.treasuryEquity).replace("$", "")}</strong>
                  ) : <span className="text-[#55555a]">—</span>}
                </div>
              </div>
            </div>

            {/* Metric 3: Active Position */}
            <div className="py-2 px-3.5 sm:px-5 flex flex-col justify-center shrink-0 min-w-[125px] sm:min-w-[160px]">
              <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase">
                POSITION
              </span>
              <div className="mt-0.5 min-h-[18px] sm:min-h-[20px] flex items-center">
                {isValueLoading ? (
                  <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32 my-0.5 rounded-[2px]" />
                ) : metrics ? (
                  <span className="font-mono text-xs sm:text-sm font-medium text-[#f3f3f4] truncate max-w-[140px] sm:max-w-[190px]">
                    {metrics.positionDisplay}
                  </span>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-[#55555a]">NONE</span>
                )}
              </div>
            </div>

            {/* Metric 4: Win Rate */}
            <div className="py-2 px-3.5 sm:px-5 flex flex-col justify-center shrink-0 min-w-[130px] sm:min-w-[160px]">
              <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase">
                WIN RATE
              </span>
              <div className="mt-0.5 min-h-[18px] sm:min-h-[20px] flex items-center">
                {isValueLoading ? (
                  <Skeleton className="h-3.5 sm:h-4 w-26 sm:w-32 my-0.5 rounded-[2px]" />
                ) : metrics ? (
                  <span className="font-mono text-xs sm:text-sm font-medium text-[#f3f3f4]">
                    {formattedWinRate}
                  </span>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-[#55555a]">—</span>
                )}
              </div>
            </div>

            {/* Metric 5: Agent Status */}
            <div className="py-2 px-3.5 sm:px-5 flex flex-col justify-center shrink-0 min-w-[110px] sm:min-w-[130px]">
              <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase">
                AGENT STATUS
              </span>
              <div className="mt-0.5 min-h-[18px] sm:min-h-[20px] flex items-center gap-1.5">
                {isValueLoading ? (
                  <Skeleton className="h-3.5 sm:h-4 w-14 sm:w-16 my-0.5 rounded-[2px]" />
                ) : metrics ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.18)] shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-medium text-[#6fe39a] uppercase">
                      {metrics.agentStatus}
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-[#55555a]">
                    {hasError ? "UNAVAILABLE" : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Metric 6: Network Uplink */}
            <div className="py-2 px-3.5 sm:px-5 flex flex-col justify-center shrink-0 min-w-[130px] hidden md:flex">
              <span className="font-mono text-[9px] text-[#55555a] tracking-wider uppercase">
                UPLINK
              </span>
              <div className="mt-0.5 min-h-[18px] sm:min-h-[20px] flex items-center">
                {isValueLoading ? (
                  <Skeleton className="h-3.5 sm:h-4 w-28 sm:w-32 my-0.5 rounded-[2px]" />
                ) : metrics ? (
                  <span className="font-mono text-xs sm:text-sm text-[#85858a] font-normal truncate">
                    {metrics.network}
                  </span>
                ) : (
                  <span className="font-mono text-xs sm:text-sm text-[#55555a]">
                    ROBINHOOD TESTNET
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
