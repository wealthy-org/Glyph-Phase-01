import React from "react";
import { AnalysisScoreData } from "../../types";
import { Separator } from "@/components/ui/separator";
import { AnalysisScore } from "./AnalysisScore";
import { CatalystSection } from "./CatalystSection";
import { cn } from "@/lib/utils";

interface WhyITradedSectionProps {
  fundamental: AnalysisScoreData;
  technical: AnalysisScoreData;
  catalyst: string;
  className?: string;
}

export const WhyITradedSection: React.FC<WhyITradedSectionProps> = ({
  fundamental,
  technical,
  catalyst,
  className,
}) => {
  return (
    <section
      className={cn(
        "border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Rationale: Why I Traded"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-mono text-xs sm:text-sm text-[#85858a] tracking-widest uppercase font-medium">
          WHY I TRADED
        </h2>
      </div>

      <Separator className="bg-[#171717]" />

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Fundamental Analysis */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-medium text-[#f3f3f4] tracking-tight">
            {fundamental.title}
          </h3>
          <p className="text-sm text-[#85858a] leading-relaxed font-light">
            {fundamental.description}
          </p>
          <AnalysisScore score={fundamental.score} maxScore={fundamental.maxScore} />
        </div>

        {/* Right Column: Technical Analysis */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-medium text-[#f3f3f4] tracking-tight">
            {technical.title}
          </h3>
          <p className="text-sm text-[#85858a] leading-relaxed font-light">
            {technical.description}
          </p>
          <AnalysisScore score={technical.score} maxScore={technical.maxScore} indicatorClassName="bg-[#6fe39a]" />
        </div>
      </div>

      {/* Divider */}
      <Separator className="bg-[#171717]" />

      {/* Catalyst */}
      <CatalystSection catalyst={catalyst} />
    </section>
  );
};
