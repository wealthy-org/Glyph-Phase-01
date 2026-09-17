"use client";

import React from "react";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface IdentitySkeletonProps {
  className?: string;
}

export const IdentitySkeleton: React.FC<IdentitySkeletonProps> = ({
  className,
}) => {
  return (
    <div className={cn("w-full space-y-10 sm:space-y-14", className)}>
      {/* 1. Futuristic Loading Status Banner */}
      <div className="border border-[#171717] bg-[#050505] backdrop-blur-md p-4 sm:p-5 relative overflow-hidden">
        {/* Subtle scanline highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6fe39a]/40 to-transparent animate-pulse" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6fe39a] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6fe39a]" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#6fe39a] font-medium tracking-widest uppercase">
                QUERYING ON-CHAIN REGISTRY
              </span>
              <span className="text-[#333338] hidden sm:inline">•</span>
              <span className="text-[#85858a] text-[11px] tracking-wider">
                ERC-8004 // ROBINHOOD TESTNET
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#55555a] tracking-widest uppercase hidden md:inline">
              FETCHING ATTESTATIONS
            </span>
            <div className="h-1.5 w-28 sm:w-36 bg-[#080808] overflow-hidden rounded-none border border-[#171717] relative">
              <div className="h-full bg-[#6fe39a] w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Page Header Skeleton */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#6fe39a]/60 animate-pulse" />
          <Skeleton className="h-3.5 w-44 bg-[#171717]" />
        </div>
        <Skeleton className="h-10 sm:h-12 w-64 sm:w-88 bg-[#171717]" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-xl bg-[#141414]" />
      </header>

      {/* 3. Identity Record Card Skeleton */}
      <div className="border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-8 relative overflow-hidden">
        {/* Decorative corner reticles */}
        <div className="absolute top-2 right-2 font-mono text-[9px] text-[#55555a] select-none">
          SYNCING...
        </div>

        {/* Identity Header: Mark, Being #001, GLYPH, Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <GlyphMark size="lg" animated={true} pulseVariant="modern" className="opacity-75" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-36 bg-[#171717]" />
              <Skeleton className="h-8 sm:h-9 w-48 bg-[#202020]" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 bg-[#0a1a0f] border border-[#6fe39a]/20" />
        </div>

        {/* Standards Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-6 w-32 bg-[#0a0a0a] border border-[#171717]" />
          <Skeleton className="h-6 w-40 bg-[#0a0a0a] border border-[#171717]" />
          <Skeleton className="h-6 w-36 bg-[#0a0a0a] border border-[#171717]" />
        </div>

        <div className="h-[1px] bg-[#171717] w-full" />

        {/* Primary Wallet & Registration Tx */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#171717] bg-[#080808] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32 bg-[#171717]" />
              <Skeleton className="h-3 w-16 bg-[#141414]" />
            </div>
            <Skeleton className="h-6 w-full bg-[#0a0a0a]" />
          </div>

          <div className="border border-[#171717] bg-[#080808] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-36 bg-[#171717]" />
              <Skeleton className="h-3 w-20 bg-[#141414]" />
            </div>
            <Skeleton className="h-6 w-full bg-[#0a0a0a]" />
          </div>
        </div>
      </div>

      {/* 4. Reputation Section Skeleton */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-8 bg-[#171717]" />
          <Skeleton className="h-7 w-40 bg-[#171717]" />
          <Skeleton className="h-4 w-72 bg-[#141414]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-[#171717] bg-[#050505] p-5 sm:p-6 space-y-3"
            >
              <Skeleton className="h-3 w-20 bg-[#171717]" />
              <Skeleton className="h-9 w-24 bg-[#202020]" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Registry Architecture Section Skeleton */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-8 bg-[#171717]" />
          <Skeleton className="h-7 w-56 bg-[#171717]" />
          <Skeleton className="h-4 w-80 bg-[#141414]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-[#171717] bg-[#050505] p-6 sm:p-8 space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-5 w-5 bg-[#171717]" />
                  <Skeleton className="h-5 w-44 bg-[#1e1e1e]" />
                </div>
                <Skeleton className="h-4 w-full bg-[#0a0a0a]" />
                <Skeleton className="h-4 w-4/5 bg-[#141414]" />
              </div>

              <div className="pt-4 border-t border-[#171717]">
                <Skeleton className="h-3.5 w-48 bg-[#171717]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Observational Technical Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#6fe39a] animate-ping" />
          <span>CONNECTING TO ROBINHOOD TESTNET RPC...</span>
        </div>
        <span>ATTESTATION PROOF: ERC-8004 SPECIFICATION</span>
      </footer>
    </div>
  );
};
