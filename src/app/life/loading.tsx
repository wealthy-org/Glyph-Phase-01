import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function LifeLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
        <div className="w-full border border-[#1b1b1b] bg-[#050505] shadow-2xl relative overflow-hidden">
          {/* Stream Header Skeleton */}
          <div className="p-4 sm:p-6 border-b border-[#1b1b1b] bg-[#080808] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] animate-pulse" />
                <Skeleton className="h-4 w-48 bg-[#171717]" />
              </div>
              <Skeleton className="h-3 w-64 bg-[#141414] ml-3.5" />
            </div>
            <Skeleton className="h-8 w-full md:w-72 bg-[#0a0a0a] border border-[#222222]" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-[#171717] bg-[#050505] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {["ALL", "ANALYSIS", "TRADE", "MEMORY", "SYSTEM", "TREASURY"].map(
              (item) => (
                <Skeleton key={item} className="h-6 w-16 bg-[#121212] border border-[#1e1e22]" />
              )
            )}
          </div>

          {/* Rows Skeleton */}
          <div className="divide-y divide-[#171717]">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 sm:px-6 sm:py-3.5 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2"
              >
                <div className="md:col-span-3 flex items-center gap-2">
                  <Skeleton className="h-3 w-16 bg-[#171717]" />
                  <Skeleton className="h-4 w-16 bg-[#141414]" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-12 bg-[#171717]" />
                  <Skeleton className="h-3 w-16 bg-[#141414]" />
                </div>
                <div className="md:col-span-5 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 bg-[#171717]" />
                  <Skeleton className="h-3 w-1/2 bg-[#141414]" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Skeleton className="h-6 w-24 bg-[#121212]" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Skeleton */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#1b1b1b] bg-[#070707] flex items-center justify-between">
            <Skeleton className="h-3 w-40 bg-[#171717]" />
            <Skeleton className="h-3 w-32 bg-[#171717]" />
          </div>
        </div>
      </main>
    </div>
  );
}
