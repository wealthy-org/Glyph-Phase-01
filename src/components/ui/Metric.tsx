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
      <span className="text-xs font-mono text-[#666666] uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight",
            trend === "positive" && "text-[#8FB996]",
            trend === "negative" && "text-[#C47A7A]",
            (!trend || trend === "neutral") && "text-[#F5F5F5]"
          )}
        >
          {value}
        </span>
        {metadata && (
          <span className="font-mono text-xs text-[#A0A0A0]">{metadata}</span>
        )}
      </div>
    </div>
  );
};
