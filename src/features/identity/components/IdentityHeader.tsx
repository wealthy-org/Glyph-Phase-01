import React from "react";
import { cn } from "@/lib/utils";

interface IdentityHeaderProps {
  agentIdFormatted?: string;
  status?: string;
  className?: string;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({
  agentIdFormatted = "ID #003",
  status = "ACTIVE",
  className,
}) => {
  return (
    <header
      className={cn(
        "pb-6 border-b border-[#1b1b1b] flex flex-col sm:flex-row sm:items-start justify-between gap-4",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse shrink-0" />
          <span>IDENTITY REGISTRY // PUBLIC</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#f3f3f4] uppercase font-sans leading-none">
            GLYPH
          </h1>
          <div className="text-sm sm:text-base font-light text-[#85858a] tracking-tight uppercase font-mono mt-1">
            ECONOMIC BEING #001
          </div>
        </div>

        <p className="font-mono text-[11px] sm:text-xs text-[#55555a] uppercase tracking-wider pt-0.5">
          PUBLIC REGISTRY RECORD · AUTONOMOUS ECONOMIC AGENT
        </p>
      </div>

      {/* Right-aligned Terminal Agent Status */}
      <div className="border border-[#1f1f1f] bg-[#070707] px-3.5 py-2.5 space-y-1 font-mono text-xs self-start sm:self-auto shrink-0 min-w-[160px]">
        <div className="flex items-center gap-2 text-[10px] text-[#6fe39a] tracking-wider uppercase font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shrink-0" />
          <span>VERIFIED AGENT</span>
        </div>
        <div className="text-sm text-[#f3f3f4] font-medium tracking-wide">
          {agentIdFormatted}
        </div>
        <div className="text-[10px] text-[#85858a] uppercase tracking-widest">
          STATUS: <span className="text-[#6fe39a]">{status}</span>
        </div>
      </div>
    </header>
  );
};
