import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalysisScoreProps {
  score: number;
  maxScore?: number;
  className?: string;
  indicatorClassName?: string;
}

export const AnalysisScore: React.FC<AnalysisScoreProps> = ({
  score,
  maxScore = 100,
  className,
  indicatorClassName,
}) => {
  return (
    <div className={cn("space-y-2.5 pt-2", className)}>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[#666666] tracking-widest uppercase">SCORE</span>
        <span className="text-[#F5F5F5] font-medium tracking-wider">
          {score} <span className="text-[#666666]">/ {maxScore}</span>
        </span>
      </div>
      <Progress
        value={score}
        max={maxScore}
        className="h-[3px] bg-[#1A1A1A]"
        indicatorClassName={cn("bg-[#8FB996]", indicatorClassName)}
      />
    </div>
  );
};
