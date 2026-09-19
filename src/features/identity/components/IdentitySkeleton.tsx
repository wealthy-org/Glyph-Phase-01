"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface IdentitySkeletonProps {
  className?: string;
}

export const IdentitySkeleton: React.FC<IdentitySkeletonProps> = ({
  className,
}) => {
  return (
    <div className={cn("w-full space-y-6 sm:space-y-8", className)}>
      {/* 1. Page Header Skeleton */}
      <header className="pb-6 border-b border-[#1b1b1b] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]/50 animate-pulse" />
            <Skeleton className="h-3 w-40 bg-[#171717]" />
          </div>
          <Skeleton className="h-8 w-48 bg-[#171717]" />
          <Skeleton className="h-4 w-36 bg-[#141414]" />
          <Skeleton className="h-3 w-64 bg-[#141414]" />
        </div>
        <Skeleton className="h-16 w-40 bg-[#141414] border border-[#1b1b1b]" />
      </header>

      {/* 2. Main Identity Record Skeleton */}
      <div className="border border-[#1b1b1b] bg-[#050505] space-y-0">
        <div className="p-4 border-b border-[#1b1b1b] bg-[#070707] flex items-center justify-between">
          <Skeleton className="h-4 w-44 bg-[#171717]" />
          <Skeleton className="h-4 w-16 bg-[#171717]" />
        </div>

        <div className="p-6 border-b border-[#1b1b1b] flex items-center gap-4">
          <Skeleton className="w-12 h-12 bg-[#171717] rounded-[2px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32 bg-[#171717]" />
            <Skeleton className="h-3.5 w-48 bg-[#141414]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 space-y-2 bg-[#040404]">
              <Skeleton className="h-3 w-28 bg-[#171717]" />
              <Skeleton className="h-5 w-32 bg-[#1c1c1c]" />
              <Skeleton className="h-3 w-40 bg-[#141414]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b]">
          {[4, 5, 6].map((i) => (
            <div key={i} className="p-5 space-y-2 bg-[#040404]">
              <Skeleton className="h-3 w-28 bg-[#171717]" />
              <Skeleton className="h-5 w-32 bg-[#1c1c1c]" />
              <Skeleton className="h-3 w-40 bg-[#141414]" />
            </div>
          ))}
        </div>

        <div className="p-5 border-b border-[#1b1b1b] bg-[#050505] space-y-2">
          <Skeleton className="h-3 w-32 bg-[#171717]" />
          <Skeleton className="h-8 w-full bg-[#121212]" />
        </div>

        <div className="p-5 bg-[#070707] space-y-2">
          <Skeleton className="h-3 w-48 bg-[#171717]" />
          <Skeleton className="h-8 w-full bg-[#121212]" />
        </div>
      </div>

      {/* 3. Verification Skeleton */}
      <div className="border border-[#1b1b1b] bg-[#050505] p-5 space-y-4">
        <Skeleton className="h-4 w-40 bg-[#171717]" />
        <Skeleton className="h-16 w-full bg-[#121212]" />
      </div>

      {/* 4. Architecture Skeleton */}
      <div className="border border-[#1b1b1b] bg-[#050505] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 space-y-2 bg-[#050505]">
            <Skeleton className="h-3 w-20 bg-[#171717]" />
            <Skeleton className="h-4 w-32 bg-[#1c1c1c]" />
            <Skeleton className="h-6 w-full bg-[#141414]" />
          </div>
        ))}
      </div>
    </div>
  );
};
