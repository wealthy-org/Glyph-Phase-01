import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowDown } from "lucide-react";

export default function AboutLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <div className="w-full space-y-16 sm:space-y-20">
          {/* 1. Editorial Header & Highlighted Quote Skeleton */}
          <header className="space-y-6 sm:space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#6fe39a] animate-pulse" />
                <Skeleton className="h-3 w-48 bg-[#171717]" />
              </div>
              <Skeleton className="h-10 sm:h-14 w-80 sm:w-[440px] bg-[#171717]" />
            </div>

            <Skeleton className="h-5 sm:h-6 w-full max-w-2xl bg-[#141414]" />

            {/* Editorial Quote Box */}
            <div className="border-l-2 border-[#202020] pl-6 sm:pl-8 py-2 space-y-2">
              <Skeleton className="h-5 w-full max-w-xl bg-[#181818]" />
              <Skeleton className="h-5 w-4/5 max-w-lg bg-[#181818]" />
            </div>
          </header>

          <Separator className="bg-[#171717]" />

          {/* 2. Conceptual Philosophy & Reasoning Blocks (2-column layout matching ConceptualBlocks) */}
          <section
            className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 pt-4 sm:pt-6"
            aria-label="Loading Core Philosophy"
          >
            {[1, 2, 3, 4].map((i) => (
              <article key={i} className="space-y-3 sm:space-y-4">
                <Skeleton className="h-3 w-28 bg-[#171717]" />
                <Skeleton className="h-7 w-64 bg-[#1b1b1b]" />
                <div className="space-y-2 pt-1">
                  <Skeleton className="h-3.5 w-full bg-[#121212]" />
                  <Skeleton className="h-3.5 w-11/12 bg-[#121212]" />
                  <Skeleton className="h-3.5 w-4/5 bg-[#121212]" />
                </div>
              </article>
            ))}
          </section>

          <Separator className="bg-[#171717]" />

          {/* 3. The Phase 01 Decision Loop Process Flow Skeleton */}
          <section className="space-y-8 sm:space-y-10 pt-8 sm:pt-12" aria-label="Loading Decision Loop">
            <div className="space-y-1">
              <Skeleton className="h-3 w-32 bg-[#171717]" />
              <Skeleton className="h-8 w-72 bg-[#1b1b1b]" />
              <Skeleton className="h-4 w-96 max-w-full bg-[#141414]" />
            </div>

            {/* Process Flow Outer Panel */}
            <div className="border border-[#171717] bg-[#050505] p-6 sm:p-10 md:p-14">
              <div className="max-w-2xl mx-auto space-y-3">
                {[
                  { step: "01", highlighted: false },
                  { step: "02", highlighted: false },
                  { step: "03", highlighted: false },
                  { step: "04", highlighted: false },
                  { step: "05", highlighted: true },
                  { step: "06", highlighted: false },
                  { step: "07", highlighted: false },
                ].map((item, idx) => (
                  <React.Fragment key={item.step}>
                    <div
                      className={`border p-4 sm:p-5 flex items-start gap-4 ${
                        item.highlighted
                          ? "border-[#6fe39a]/30 bg-[#6fe39a]/5"
                          : "border-[#171717] bg-[#080808]"
                      }`}
                    >
                      {/* Step Index Badge */}
                      <span
                        className={`font-mono text-xs px-2 py-0.5 border rounded-none shrink-0 font-medium ${
                          item.highlighted
                            ? "border-[#6fe39a]/40 text-[#6fe39a] bg-[#6fe39a]/10"
                            : "border-[#171717] text-[#85858a] bg-[#0a0a0a]"
                        }`}
                      >
                        {item.step}
                      </span>

                      {/* Content */}
                      <div className="space-y-1.5 flex-1">
                        <Skeleton
                          className={`h-4 w-32 ${
                            item.highlighted ? "bg-[#6fe39a]/20" : "bg-[#1c1c1c]"
                          }`}
                        />
                        <Skeleton className="h-3 w-full max-w-md bg-[#121212]" />
                      </div>
                    </div>

                    {/* Downward Connector Arrow */}
                    {idx < 6 && (
                      <div className="flex justify-center py-1 text-[#333338]" aria-hidden="true">
                        <ArrowDown size={14} className="text-[#333338]" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Observational Technical Footnote Skeleton */}
          <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
            <Skeleton className="h-3 w-64 bg-[#141414]" />
            <Skeleton className="h-3 w-56 bg-[#141414]" />
          </footer>
        </div>
      </main>
    </div>
  );
}
