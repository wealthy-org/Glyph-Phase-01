import { cn } from "@/lib/utils";
import React from "react";

interface TradeMetricProps {
  label: string;
  value: React.ReactNode;
  isPositive?: boolean;
  isNegative?: boolean;
  className?: string;
}

export const TradeMetric: React.FC<TradeMetricProps> = ({
  label,
  value,
  isPositive,
  isNegative,
  className,
}) => {
  return (
    <div className={cn("min-w-0 flex flex-col space-y-2", className)}>
      <span className="min-w-0 break-words font-mono text-xs text-[#55555a] tracking-widest uppercase leading-tight">
        {label}
      </span>
      <div
        className={cn(
          "min-w-0 break-words whitespace-normal font-mono text-2xl sm:text-3xl font-medium tracking-tight leading-tight",
          isPositive && "text-[#6fe39a]",
          isNegative && "text-[#e06c75]",
          !isPositive && !isNegative && "text-[#f3f3f4]"
        )}
      >
        {value}
      </div>
    </div>
  );
};
