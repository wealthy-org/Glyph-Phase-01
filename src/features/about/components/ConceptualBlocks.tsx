import React from "react";
import { ConceptualBlockItem } from "../types";
import { cn } from "@/lib/utils";

interface ConceptualBlocksProps {
  blocks: ConceptualBlockItem[];
  className?: string;
}

export const ConceptualBlocks: React.FC<ConceptualBlocksProps> = ({
  blocks,
  className,
}) => {
  return (
    <section
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 pt-4 sm:pt-6",
        className
      )}
      aria-label="Core Philosophy & Reasoning"
    >
      {blocks.map((block) => (
        <article key={block.id} className="space-y-3 sm:space-y-4">
          <div className="font-mono text-xs text-[#8FB996] tracking-widest">
            {block.eyebrow}
          </div>
          <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-[#F5F5F5] uppercase">
            {block.heading}
          </h2>
          <div className="space-y-3 text-xs sm:text-sm font-mono text-[#A0A0A0] leading-relaxed font-light">
            {block.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
};
