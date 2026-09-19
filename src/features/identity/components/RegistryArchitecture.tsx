import React from "react";
import { ArchitectureItem } from "../types";
import { GLYPH_ARCHITECTURE_ITEMS } from "../data";
import { cn } from "@/lib/utils";

interface RegistryArchitectureProps {
  items?: ArchitectureItem[];
  className?: string;
}

export const RegistryArchitecture: React.FC<RegistryArchitectureProps> = ({
  items = GLYPH_ARCHITECTURE_ITEMS,
  className,
}) => {
  return (
    <section className={cn("space-y-3", className)} aria-label="Registry Architecture">
      {/* Eyebrow & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>REGISTRY ARCHITECTURE</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          CORE SPECIFICATION
        </span>
      </div>

      {/* 4-Block Bordered Terminal Grid / Table */}
      <div className="border border-[#1b1b1b] bg-[#050505] shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b]">
          {items.map((item) => (
            <div
              key={item.index}
              className="p-4 sm:p-5 space-y-2 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <div className="font-mono text-[10px] text-[#6fe39a] tracking-widest uppercase">
                {item.index} // {item.domain}
              </div>

              <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4] tracking-tight">
                {item.name}
              </div>

              <p className="font-mono text-[11px] text-[#85858a] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
