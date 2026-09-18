import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function TradeDetailLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 relative z-10 space-y-10">
        {/* Back Link Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-4 bg-[#171717]" />
          <Skeleton className="h-3 w-48 bg-[#171717]" />
        </div>

        {/* Trade Header Card Skeleton */}
        <div className="border border-[#171717] bg-[#050505] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141414] pb-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 bg-[#171717]" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 sm:h-10 w-44 bg-[#1e1e1e]" />
                <Skeleton className="h-6 w-20 bg-[#171717]" />
              </div>
            </div>
            <Skeleton className="h-7 w-28 bg-[#141414]" />
          </div>

          {/* 5 Price Metric Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border border-[#141414] bg-[#030303] space-y-1.5">
                <Skeleton className="h-2.5 w-16 bg-[#171717]" />
                <Skeleton className="h-5 w-24 bg-[#1f1f1f]" />
              </div>
            ))}
          </div>
        </div>

        {/* "Why I Traded" 2-Column Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Thesis Cards */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 bg-[#171717]" />
              <Skeleton className="h-8 w-56 bg-[#171717]" />
            </div>

            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 border border-[#171717] bg-[#050505] space-y-2.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 bg-[#171717]" />
                  <Skeleton className="h-3 w-16 bg-[#141414]" />
                </div>
                <Skeleton className="h-4 w-full bg-[#121212]" />
                <Skeleton className="h-4 w-4/5 bg-[#121212]" />
              </div>
            ))}

            {/* Invalidation Alert Card */}
            <div className="p-4 border border-[#b8a77a]/20 bg-[#050505] space-y-2">
              <Skeleton className="h-3 w-36 bg-[#b8a77a]/30" />
              <Skeleton className="h-4 w-3/4 bg-[#141414]" />
            </div>
          </div>

          {/* Right Column: Score Breakdown & Onchain Proof */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 border border-[#171717] bg-[#050505] space-y-5">
              <Skeleton className="h-3 w-36 bg-[#171717]" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24 bg-[#141414]" />
                    <Skeleton className="h-3 w-12 bg-[#141414]" />
                  </div>
                  <Skeleton className="h-1.5 w-full bg-[#141414]" />
                </div>
              ))}
            </div>

            {/* Onchain Proof Card Skeleton */}
            <div className="p-6 border border-[#171717] bg-[#050505] space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-32 bg-[#171717]" />
                <Skeleton className="h-3 w-16 bg-[#6fe39a]/30" />
              </div>
              <Skeleton className="h-9 w-full bg-[#030303] border border-[#141414]" />
              <Skeleton className="h-3 w-48 bg-[#141414]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
