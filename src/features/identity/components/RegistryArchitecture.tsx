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
        <div className="font-mono text-xs text-[#8FB996] tracking-widest">
          // 02
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#F5F5F5] uppercase">
          REGISTRY ARCHITECTURE
        </h2>
        <p className="text-sm text-[#A0A0A0] font-light">
          Cryptographic foundation of autonomous persistence.
        </p>
      </div>

      {/* 2-column Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {cards.map((card) => {
          const Icon = card.iconType === "delegation" ? KeyRound : ShieldCheck;

          return (
            <div
              key={card.title}
              className="border border-[#242424] bg-[#0D0D0D] p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#383838] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="text-[#8FB996] shrink-0" />
                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F5] tracking-tight">
                    {card.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#A0A0A0] font-light leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Technical Metadata Footer */}
              <div className="pt-4 border-t border-[#181818] font-mono text-xs text-[#666666] tracking-wider">
                <span className="text-[#888888]">{card.metaKey}:</span>{" "}
                <span className="text-[#A0A0A0]">{card.metaValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
