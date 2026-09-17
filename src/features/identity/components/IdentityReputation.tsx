import React from "react";
import { ReputationMetricItem } from "../types";
import { cn } from "@/lib/utils";

interface IdentityReputationProps {
  metrics: ReputationMetricItem[];
  className?: string;
}

export const IdentityReputation: React.FC<IdentityReputationProps> = ({
  metrics,
  className,
}) => {
  return (
    <section className={cn("space-y-6", className)} aria-label="Reputation Record">
      {/* Numbered Section Header matching reference */}
      <div className="space-y-1">
        <div className="font-mono text-xs text-[#8FB996] tracking-widest">
          // 01
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#F5F5F5] uppercase">
          REPUTATION
        </h2>
        <p className="text-sm text-[#A0A0A0] font-light">
          Verifiable track record committed to autonomous registry state.
        </p>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border border-[#242424] bg-[#0D0D0D] p-5 sm:p-6 space-y-2 hover:border-[#383838] transition-colors"
          >
            <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
              {metric.label}
            </span>
            <div
              className={cn(
                "font-mono text-3xl sm:text-4xl font-light tracking-tight",
                metric.highlight ? "text-[#8FB996]" : "text-[#F5F5F5]"
              )}
            >
              {metric.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
