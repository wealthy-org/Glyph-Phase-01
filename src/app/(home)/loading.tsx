import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4]">
      {/* Navigation */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* 1. Hero Skeleton */}
        <section className="relative w-full border-b border-[#171717] bg-[#000000] py-16 sm:py-24">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-pulse" />
              <Skeleton className="h-3 w-40 bg-[#171717]" />
            </div>

            <div className="space-y-4 max-w-3xl">
              <Skeleton className="h-12 sm:h-16 w-3/4 bg-[#171717]" />
              <Skeleton className="h-12 sm:h-16 w-1/2 bg-[#171717]" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4">
              <div className="space-y-2 max-w-lg w-full">
                <Skeleton className="h-4 w-full bg-[#141414]" />
                <Skeleton className="h-4 w-5/6 bg-[#141414]" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-36 bg-[#171717]" />
                <Skeleton className="h-11 w-32 bg-[#171717]" />
                <Skeleton className="h-11 w-36 bg-[#141414]" />
              </div>
            </div>
          </div>

          {/* Marquee Strip Skeleton */}
          <div className="w-full border-t border-[#171717] mt-16 h-12 flex items-center px-6 gap-6">
            <Skeleton className="h-3 w-20 bg-[#141414]" />
            <div className="flex-1 flex items-center gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-3 w-24 bg-[#141414]" />
              ))}
            </div>
          </div>
        </section>

        {/* 2. LiveState Observation Terminal Skeleton */}
        <section className="w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000]">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32 bg-[#171717]" />
                <Skeleton className="h-10 w-72 bg-[#171717]" />
              </div>
              <Skeleton className="h-7 w-48 bg-[#171717]" />
            </div>

            {/* Terminal Window Box */}
            <div className="border border-[#1b1b1b] bg-[#050505]">
              {/* Window Top Chrome */}
              <div className="h-11 px-4 flex items-center justify-between border-b border-[#1b1b1b] bg-[#080808]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                    <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                    <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                  </div>
                  <Skeleton className="h-3 w-40 bg-[#171717]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-pulse" />
                  <span className="font-mono text-[10px] text-[#6fe39a]">SYNCHRONIZING</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#050505]">
                {/* Left: Treasury & Chart */}
                <div className="lg:col-span-8 border border-[#181818] bg-[#040404] p-6 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-36 bg-[#171717]" />
                      <Skeleton className="h-10 w-48 bg-[#202020]" />
                      <Skeleton className="h-3 w-64 bg-[#141414]" />
                    </div>
                    <Skeleton className="h-6 w-32 bg-[#171717]" />
                  </div>

                  {/* Chart Bars Skeleton */}
                  <div className="h-32 flex items-end gap-4 border-b border-[#141414] pb-2">
                    {[45, 30, 60, 40, 80].map((h, idx) => (
                      <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                        <Skeleton
                          className="w-full bg-[#181818]"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Latest Decision Scores */}
                <div className="lg:col-span-4 border border-[#181818] bg-[#040404] p-6 space-y-6">
                  <div className="flex justify-between border-b border-[#141414] pb-3">
                    <Skeleton className="h-3 w-28 bg-[#171717]" />
                    <Skeleton className="h-3 w-16 bg-[#171717]" />
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-[#111111]">
                        <Skeleton className="h-3 w-24 bg-[#141414]" />
                        <Skeleton className="h-3 w-16 bg-[#1a1a1a]" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#171717] space-y-3">
                    <Skeleton className="h-3 w-20 bg-[#141414]" />
                    <Skeleton className="h-5 w-40 bg-[#171717]" />
                    <Skeleton className="h-9 w-full bg-[#171717]" />
                  </div>
                </div>
              </div>

              {/* Bottom Objective Bar */}
              <div className="px-5 py-3.5 bg-[#030303] border-t border-[#181818] flex justify-between items-center">
                <Skeleton className="h-3 w-96 bg-[#141414]" />
                <Skeleton className="h-3 w-48 bg-[#141414]" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Current Thesis Skeleton */}
        <section className="w-full py-16 sm:py-24 border-b border-[#171717] bg-[#000000]">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32 bg-[#171717]" />
                <Skeleton className="h-10 w-80 bg-[#171717]" />
              </div>
              <Skeleton className="h-3 w-48 bg-[#141414]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <Skeleton className="h-12 w-48 bg-[#171717]" />
                <div className="border-l border-[#252525] pl-6 space-y-3">
                  <Skeleton className="h-3 w-28 bg-[#171717]" />
                  <Skeleton className="h-4 w-full bg-[#141414]" />
                  <Skeleton className="h-4 w-4/5 bg-[#141414]" />
                </div>
                <Skeleton className="h-16 w-full bg-[#080808] border border-[#1c1c1c]" />
                <Skeleton className="h-10 w-44 bg-[#171717]" />
              </div>

              <div className="lg:col-span-5 space-y-5 lg:border-l lg:border-[#171717] lg:pl-10">
                <Skeleton className="h-3 w-36 bg-[#171717]" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-28 bg-[#141414]" />
                      <Skeleton className="h-3 w-12 bg-[#141414]" />
                    </div>
                    <Skeleton className="h-1 w-full bg-[#171717]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Reputation Grid Skeleton */}
        <section className="w-full py-16 sm:py-24 bg-[#000000]">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 bg-[#171717]" />
              <Skeleton className="h-10 w-64 bg-[#171717]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#171717] border border-[#171717]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#050505] p-6 space-y-4">
                  <Skeleton className="h-3 w-24 bg-[#171717]" />
                  <Skeleton className="h-10 w-20 bg-[#202020]" />
                  <Skeleton className="h-2.5 w-28 bg-[#141414]" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
