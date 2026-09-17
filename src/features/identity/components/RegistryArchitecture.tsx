import React from "react";
import { ArchitectureCardItem } from "../types";
import { ShieldCheck, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistryArchitectureProps {
  cards: ArchitectureCardItem[];
  className?: string;
}

export const RegistryArchitecture: React.FC<RegistryArchitectureProps> = ({
  cards,
  className,
}) => {
  return (
    <section className={cn("space-y-6", className)} aria-label="Registry Architecture">
      {/* Numbered Section Header */}
      <div className="space-y-1">
        <div className="eyebrow">
          // 02 · ARCHITECTURE
        </div>
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f3f3f4] uppercase">
          REGISTRY ARCHITECTURE
        </h2>
        <p className="text-sm text-[#85858a] font-light">
          Cryptographic foundation of autonomous persistence.
        </p>
      </div>

      {/* 2-column Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.iconType === "delegation" ? KeyRound : ShieldCheck;

          return (
            <div
              key={card.title}
              className="border border-[#171717] bg-[#050505] p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#262626] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-[#6fe39a] shrink-0" />
                  <h3 className="text-base sm:text-lg font-light text-[#f3f3f4] tracking-tight">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#85858a] font-light leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Technical Metadata Footer */}
              <div className="pt-4 border-t border-[#171717] font-mono text-[11px] text-[#55555a] tracking-wider uppercase">
                <span className="text-[#85858a]">{card.metaKey}:</span>{" "}
                <span className="text-[#f3f3f4]">{card.metaValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
