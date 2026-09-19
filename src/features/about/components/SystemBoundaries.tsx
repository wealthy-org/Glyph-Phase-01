import React from "react";
import { SystemBoundaryItem } from "../types";
import { cn } from "@/lib/utils";

interface SystemBoundariesProps {
  boundaries: SystemBoundaryItem[];
  className?: string;
}

export const SystemBoundaries: React.FC<SystemBoundariesProps> = ({
  boundaries,
  className,
}) => {
  return (
    <section className={cn("space-y-3", className)} aria-label="System Boundaries">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>PHASE 01 // SYSTEM BOUNDARIES</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          OPERATIONAL CONSTRAINTS
        </span>
      </div>

      {/* 6-Cell Bordered Terminal Matrix */}
      <div className="border border-[#1b1b1b] bg-[#050505] shadow-xl overflow-hidden divide-y divide-[#1b1b1b]">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {boundaries.slice(0, 2).map((item) => (
            <div
              key={item.label}
              className="p-4 sm:p-5 space-y-1 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="font-mono text-sm sm:text-base font-medium text-[#f3f3f4] tracking-tight">
                {item.value}
              </div>
              <p className="font-mono text-[11px] text-[#85858a] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {boundaries.slice(2, 4).map((item) => (
            <div
              key={item.label}
              className="p-4 sm:p-5 space-y-1 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="font-mono text-sm sm:text-base font-medium text-[#f3f3f4] tracking-tight">
                {item.value}
              </div>
              <p className="font-mono text-[11px] text-[#85858a] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {boundaries.slice(4, 6).map((item) => (
            <div
              key={item.label}
              className="p-4 sm:p-5 space-y-1 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                {item.label}
              </span>
              <div className="font-mono text-sm sm:text-base font-medium text-[#f3f3f4] tracking-tight">
                {item.value}
              </div>
              <p className="font-mono text-[11px] text-[#85858a] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
