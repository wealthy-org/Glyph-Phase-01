import React from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col space-y-2", className)}>
      <span className="font-mono text-xs text-[#666666] tracking-widest uppercase">
        {label}
      </span>
      <div
        className={cn(
          "font-mono text-2xl sm:text-3xl font-medium tracking-tight",
          isPositive && "text-[#8FB996]",
          isNegative && "text-[#C47A7A]",
          !isPositive && !isNegative && "text-[#F5F5F5]"
        )}
      >
        {value}
      </div>
    </div>
  );
};
