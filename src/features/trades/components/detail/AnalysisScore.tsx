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
    <div className={cn("space-y-2 pt-2", className)}>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[#55555a] tracking-widest uppercase">SCORE</span>
        <span className="text-[#f3f3f4] font-medium tracking-wider">
          {score} <span className="text-[#55555a]">/ {maxScore}</span>
        </span>
      </div>
      <Progress
        value={score}
        max={maxScore}
        className="h-[2px] bg-[#171717]"
        indicatorClassName={cn("bg-[#f0f0f1]", indicatorClassName)}
      />
    </div>
  );
};
