import React from "react";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: React.ReactNode;
  metadata?: string;
  trend?: "positive" | "negative" | "neutral";
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  metadata,
  trend,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <span className="text-xs font-mono text-[#55555a] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-xl sm:text-2xl lg:text-3xl font-light tracking-tight",
            trend === "positive" && "text-[#6fe39a]",
            trend === "negative" && "text-[#e06c75]",
            (!trend || trend === "neutral") && "text-[#f3f3f4]"
          )}
        >
          {value}
        </span>
        {metadata && (
          <span className="font-mono text-xs text-[#85858a]">{metadata}</span>
        )}
      </div>
    </div>
  );
};
