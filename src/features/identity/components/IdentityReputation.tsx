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
      <div className="space-y-2">
        <span className="eyebrow">REPUTATION // 001</span>
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f3f3f4] uppercase">
          REPUTATION
        </h2>
        <p className="text-sm text-[#85858a] font-light">
          Verifiable track record committed to autonomous registry state.
        </p>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#171717] border border-[#171717]">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-[#050505] p-5 sm:p-6 space-y-3 hover:bg-[#080808] transition-colors"
          >
            <span className="font-mono text-[10px] sm:text-[11px] text-[#55555a] tracking-widest uppercase block">
              {metric.label}
            </span>
            <div
              className={cn(
                "font-mono text-3xl sm:text-4xl font-light tracking-tight tabular-nums",
                metric.highlight ? "text-[#6fe39a]" : "text-[#f3f3f4]"
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
