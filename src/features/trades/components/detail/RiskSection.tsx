import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React from "react";
import { InvalidationAlert } from "./InvalidationAlert";

interface RiskSectionProps {
  riskScore: number | null;
  invalidation: string;
  maxScore?: number;
  className?: string;
}

export const RiskSection: React.FC<RiskSectionProps> = ({
  riskScore,
  invalidation,
  maxScore = 100,
  className,
}) => {
  return (
    <section
      className={cn(
        "border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Risk Parameters & Invalidation"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-mono text-xs sm:text-sm text-[#85858a] tracking-widest uppercase font-medium">
          RISK
        </h2>
      </div>

      <Separator className="bg-[#171717]" />

      {/* Horizontal Layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left: Risk Score */}
        <div className="space-y-2.5">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase block">
            RISK SCORE
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-light text-[#f3f3f4] tracking-tight">
            {riskScore === null ? "N/A" : <>{riskScore} <span className="text-base sm:text-lg text-[#55555a]">/ {maxScore}</span></>}
          </div>
          {riskScore !== null && (
            <Progress
              value={riskScore}
              max={maxScore}
              className="h-[2px] bg-[#171717] mt-2"
              indicatorClassName="bg-[#b8a77a]"
            />
          )}
        </div>

        {/* Right: Invalidation Alert Box */}
        <div>
          <InvalidationAlert invalidation={invalidation} />
        </div>
      </div>
    </section>
  );
};
