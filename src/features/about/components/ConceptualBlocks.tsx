import React from "react";
import { CoreConceptItem } from "../types";
import { cn } from "@/lib/utils";

interface ConceptualBlocksProps {
  blocks: CoreConceptItem[];
  className?: string;
}

export const ConceptualBlocks: React.FC<ConceptualBlocksProps> = ({
  blocks,
  className,
}) => {
  return (
    <section className={cn("space-y-3", className)} aria-label="Core Specification">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>SYSTEM ARCHITECTURE // CONCEPTS</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          CORE PREREQUISITES
        </span>
      </div>

      {/* 2x2 Bordered Terminal Grid */}
      <div className="border border-[#1b1b1b] bg-[#050505] shadow-xl overflow-hidden divide-y divide-[#1b1b1b]">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {blocks.slice(0, 2).map((block) => (
            <div
              key={block.number}
              className="p-4 sm:p-5 space-y-1.5 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <div className="font-mono text-[10px] text-[#6fe39a] tracking-widest uppercase">
                {block.number} // {block.title}
              </div>
              <p className="font-mono text-xs sm:text-[13px] text-[#a1a1aa] leading-relaxed">
                {block.description}
              </p>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {blocks.slice(2, 4).map((block) => (
            <div
              key={block.number}
              className="p-4 sm:p-5 space-y-1.5 bg-[#050505] hover:bg-[#070707] transition-colors"
            >
              <div className="font-mono text-[10px] text-[#6fe39a] tracking-widest uppercase">
                {block.number} // {block.title}
              </div>
              <p className="font-mono text-xs sm:text-[13px] text-[#a1a1aa] leading-relaxed">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
