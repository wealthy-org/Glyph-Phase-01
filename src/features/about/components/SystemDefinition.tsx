import React from "react";
import { SystemDefinitionItem } from "../types";
import { cn } from "@/lib/utils";

interface SystemDefinitionProps {
  items: SystemDefinitionItem[];
  className?: string;
}

export const SystemDefinition: React.FC<SystemDefinitionProps> = ({
  items,
  className,
}) => {
  return (
    <section className={cn("space-y-3", className)} aria-label="System Definition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>SYSTEM DEFINITION</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          FACTUAL SPECIFICATION
        </span>
      </div>

      {/* Bordered Terminal Grid */}
      <div className="border border-[#1b1b1b] bg-[#050505] shadow-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b]">
          {items.map((item) => (
            <div
              key={item.label}
              className="p-3.5 sm:p-4 space-y-1 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <span className="font-mono text-[9px] sm:text-[10px] text-[#66666e] uppercase tracking-wider block">
                {item.label}
              </span>
              <div
                className={cn(
                  "font-mono text-xs sm:text-sm font-medium tracking-tight",
                  item.highlight ? "text-[#6fe39a]" : "text-[#f3f3f4]"
                )}
              >
                {item.value}
              </div>
              {item.subtext && (
                <p className="font-mono text-[10px] text-[#55555a] truncate">
                  {item.subtext}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
