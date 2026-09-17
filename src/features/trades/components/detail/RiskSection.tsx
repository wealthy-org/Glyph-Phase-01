import React from "react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { InvalidationAlert } from "./InvalidationAlert";
import { cn } from "@/lib/utils";

interface RiskSectionProps {
  riskScore: number;
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
        "border border-[#242424] bg-[#0D0D0D] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Risk Parameters & Invalidation"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-mono text-xs sm:text-sm text-[#A0A0A0] tracking-widest uppercase font-medium">
          RISK
        </h2>
      </div>

      <Separator className="bg-[#242424]" />

      {/* Horizontal Layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left: Risk Score */}
        <div className="space-y-2.5">
          <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
            RISK SCORE
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-medium text-[#F5F5F5] tracking-tight">
            {riskScore} <span className="text-base sm:text-lg text-[#666666]">/ {maxScore}</span>
          </div>
          <Progress
            value={riskScore}
            max={maxScore}
            className="h-[3px] bg-[#1A1A1A] mt-2"
            indicatorClassName="bg-[#B8A77A]"
          />
        </div>

        {/* Right: Invalidation Alert Box */}
        <div>
          <InvalidationAlert invalidation={invalidation} />
        </div>
      </div>
    </section>
  );
};
