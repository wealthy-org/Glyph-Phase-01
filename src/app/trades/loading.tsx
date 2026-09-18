import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function TradesLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <div className="w-full space-y-10 sm:space-y-12">
          {/* Header Skeleton */}
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#6fe39a] animate-pulse" />
              <Skeleton className="h-3 w-36 bg-[#171717]" />
            </div>
            <Skeleton className="h-10 sm:h-12 w-80 bg-[#171717]" />
            <Skeleton className="h-4 w-full max-w-xl bg-[#141414]" />
          </header>

          {/* 4 Summary Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-[#171717] bg-[#050505] p-5 sm:p-6 space-y-3"
              >
                <Skeleton className="h-3 w-24 bg-[#171717]" />
                <Skeleton className="h-8 sm:h-9 w-28 bg-[#202020]" />
                <Skeleton className="h-2.5 w-32 bg-[#121212]" />
              </div>
            ))}
          </div>

          {/* Filters Row Skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717] pb-4">
            <div className="flex items-center gap-2">
              {["ALL", "NVDA"].map((t, idx) => (
                <Skeleton key={idx} className="h-7 w-16 bg-[#080808] border border-[#171717]" />
              ))}
            </div>
            <Skeleton className="h-3 w-28 bg-[#141414]" />
          </div>

          {/* Trade Table Skeleton */}
          <div className="border border-[#171717] bg-[#050505] overflow-hidden">
            {/* Table Header */}
            <div className="h-11 px-5 border-b border-[#171717] bg-[#080808] flex items-center justify-between">
              <div className="grid grid-cols-6 gap-4 w-full">
                <Skeleton className="h-3 w-20 bg-[#171717]" />
                <Skeleton className="h-3 w-16 bg-[#171717]" />
                <Skeleton className="h-3 w-20 bg-[#171717]" />
                <Skeleton className="h-3 w-16 bg-[#171717]" />
                <Skeleton className="h-3 w-16 bg-[#171717]" />
                <Skeleton className="h-3 w-24 bg-[#171717]" />
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y divide-[#141414]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="grid grid-cols-6 gap-4 w-full items-center">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16 bg-[#171717]" />
                      <Skeleton className="h-2.5 w-24 bg-[#121212]" />
                    </div>
                    <Skeleton className="h-5 w-14 bg-[#141414]" />
                    <Skeleton className="h-4 w-20 bg-[#171717]" />
                    <Skeleton className="h-4 w-16 bg-[#141414]" />
                    <Skeleton className="h-4 w-16 bg-[#171717]" />
                    <Skeleton className="h-3 w-28 bg-[#141414]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footnote Skeleton */}
          <footer className="pt-8 pb-12 border-t border-[#171717] flex justify-between items-center font-mono text-xs text-[#55555a]">
            <Skeleton className="h-3 w-56 bg-[#141414]" />
            <Skeleton className="h-3 w-44 bg-[#141414]" />
          </footer>
        </div>
      </main>
    </div>
  );
}
