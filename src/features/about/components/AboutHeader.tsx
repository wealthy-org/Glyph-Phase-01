import React from "react";
import { cn } from "@/lib/utils";

interface AboutHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  note?: string;
  className?: string;
}

export const AboutHeader: React.FC<AboutHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  badge,
  description,
  note,
  className,
}) => {
  return (
    <header
      className={cn(
        "pb-6 border-b border-[#1b1b1b] flex flex-col md:flex-row md:items-start justify-between gap-6",
        className
      )}
    >
      <div className="space-y-2.5 max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse shrink-0" />
          <span>{eyebrow}</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#f3f3f4] uppercase font-sans leading-none">
            {title}
          </h1>
          <div className="text-sm sm:text-base font-light text-[#85858a] tracking-tight uppercase font-mono mt-1">
            {subtitle}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#a1a1aa] font-light leading-relaxed">
          {description}
        </p>

        {note && (
          <div className="pt-2">
            <div className="border-l border-[#333338] pl-3 py-1 font-mono text-[11px] text-[#71717a] leading-relaxed">
              {note}
            </div>
          </div>
        )}
      </div>

      {/* Right-aligned Terminal Badge */}
      <div className="border border-[#1f1f1f] bg-[#070707] px-3.5 py-2.5 space-y-1 font-mono text-xs self-start md:self-auto shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-[#6fe39a] tracking-wider uppercase font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shrink-0" />
          <span>OBSERVABILITY LAYER</span>
        </div>
        <div className="text-xs text-[#f3f3f4] font-medium tracking-wide">
          PUBLIC OBSERVATION INTERFACE
        </div>
        <div className="text-[10px] text-[#85858a] uppercase tracking-wider">
          PHASE 01 · TESTNET
        </div>
      </div>
    </header>
  );
};
