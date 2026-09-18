import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function LifeLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <div className="w-full max-w-[760px] mx-auto space-y-10 sm:space-y-12">
          {/* Header Skeleton */}
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#6fe39a] animate-pulse" />
              <Skeleton className="h-3 w-40 bg-[#171717]" />
            </div>
            <Skeleton className="h-10 sm:h-12 w-72 bg-[#171717]" />
            <Skeleton className="h-4 w-full max-w-md bg-[#141414]" />
          </header>

          {/* Category Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {["ALL EVENTS", "GENESIS", "TREASURY", "THESIS", "DECISION", "TRADE", "MEMORY"].map(
                (cat, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-8 px-4 w-24 bg-[#050505] border border-[#1a1a1a]"
                  />
                )
              )}
            </div>
            <Separator className="bg-[#171717] mt-6" />
          </div>

          {/* Chronological Vertical Timeline Spine Skeleton */}
          <div className="space-y-0" role="feed" aria-label="Loading Life Log">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative flex items-start gap-4 sm:gap-6">
                {/* Spine line */}
                {i !== 6 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-[#171717]" />
                )}

                {/* Marker box */}
                <div className="relative z-10 flex items-center justify-center w-[15px] h-[15px] bg-[#000000] border border-[#1a1a1a] shrink-0 mt-1">
                  <div className="w-[3px] h-[3px] bg-[#333333]" />
                </div>

                {/* Content Block Skeleton */}
                <div className="flex-1 pb-10 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-3 w-16 bg-[#171717]" />
                    <span className="text-[#333333]">·</span>
                    <Skeleton className="h-3 w-20 bg-[#141414]" />
                    <span className="text-[#333333]">·</span>
                    <Skeleton className="h-3 w-16 bg-[#141414]" />
                    <Skeleton className="h-4 w-16 bg-[#050505] border border-[#1a1a1a]" />
                  </div>

                  <Skeleton className="h-5 w-3/4 bg-[#171717]" />
                  <Skeleton className="h-3.5 w-full bg-[#121212]" />
                  <Skeleton className="h-3.5 w-4/5 bg-[#121212]" />

                  <div className="pt-1">
                    <Skeleton className="h-3 w-28 bg-[#141414]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footnote Skeleton */}
          <footer className="pt-8 pb-12 border-t border-[#171717] flex justify-between items-center font-mono text-xs text-[#55555a]">
            <Skeleton className="h-3 w-48 bg-[#141414]" />
            <Skeleton className="h-3 w-36 bg-[#141414]" />
          </footer>
        </div>
      </main>
    </div>
  );
}
