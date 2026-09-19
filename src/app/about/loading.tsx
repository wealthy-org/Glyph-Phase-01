import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <div className="w-full space-y-8 sm:space-y-10">
          {/* 1. Header Skeleton */}
          <header className="pb-6 border-b border-[#1b1b1b] flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#6fe39a] animate-pulse" />
                <Skeleton className="h-3 w-48 bg-[#171717]" />
              </div>
              <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 bg-[#171717]" />
              <Skeleton className="h-4 w-44 bg-[#141414]" />
              <Skeleton className="h-3.5 w-full max-w-xl bg-[#141414]" />
            </div>
            <Skeleton className="h-16 w-52 bg-[#121212] border border-[#1b1b1b]" />
          </header>

          {/* 2. System Definition Grid Skeleton */}
          <div className="border border-[#1b1b1b] bg-[#050505] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b]">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="p-3.5 sm:p-4 space-y-1.5 bg-[#050505]">
                <Skeleton className="h-2.5 w-16 bg-[#171717]" />
                <Skeleton className="h-4 w-20 bg-[#1a1a1a]" />
                <Skeleton className="h-2.5 w-24 bg-[#121212]" />
              </div>
            ))}
          </div>

          {/* 3. Core Concepts Grid Skeleton */}
          <div className="border border-[#1b1b1b] bg-[#050505] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 sm:p-5 space-y-2 bg-[#050505]">
                <Skeleton className="h-3 w-28 bg-[#171717]" />
                <Skeleton className="h-4 w-full bg-[#121212]" />
                <Skeleton className="h-4 w-3/4 bg-[#121212]" />
              </div>
            ))}
          </div>

          {/* 4. Decision Pipeline Skeleton */}
          <div className="border border-[#1b1b1b] bg-[#050505] divide-y divide-[#1b1b1b]">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-[#050505]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-7 bg-[#171717]" />
                  <Skeleton className="h-4 w-32 bg-[#1a1a1a]" />
                </div>
                <Skeleton className="h-3 w-64 bg-[#121212]" />
              </div>
            ))}
          </div>

          {/* 5. Boundaries Skeleton */}
          <div className="border border-[#1b1b1b] bg-[#050505] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 sm:p-5 space-y-2 bg-[#050505]">
                <Skeleton className="h-2.5 w-20 bg-[#171717]" />
                <Skeleton className="h-4 w-36 bg-[#1a1a1a]" />
                <Skeleton className="h-3 w-full bg-[#121212]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
