import React from "react";
import { DecisionLoopStepItem } from "../types";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionLoopSectionProps {
  steps: DecisionLoopStepItem[];
  className?: string;
}

export const DecisionLoopSection: React.FC<DecisionLoopSectionProps> = ({
  steps,
  className,
}) => {
  return (
    <section className={cn("space-y-3", className)} aria-label="Decision Pipeline">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>DECISION LOOP // PHASE 01</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          COGNITIVE PIPELINE
        </span>
      </div>

      {/* Terminal Pipeline Outer Panel */}
      <div className="border border-[#1b1b1b] bg-[#050505] shadow-xl overflow-hidden divide-y divide-[#1b1b1b]">
        {steps.map((step, idx) => (
          <div
            key={step.step}
            className="p-3.5 sm:p-4 bg-[#050505] hover:bg-[#070707] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
          >
            {/* Step Identification */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={cn(
                  "font-mono text-xs px-2 py-0.5 border rounded-none font-semibold tabular-nums shrink-0",
                  step.badgeClass
                )}
              >
                {step.step}
              </span>

              <h3
                className={cn(
                  "font-mono text-xs sm:text-sm font-medium tracking-wider uppercase min-w-[140px]",
                  step.colorClass
                )}
              >
                {step.label}
              </h3>

              {idx < steps.length - 1 && (
                <div className="hidden sm:flex items-center text-[#333338]" aria-hidden="true">
                  <ArrowDown size={13} className="text-[#44444a]" />
                </div>
              )}
            </div>

            {/* Step Description */}
            <p className="font-mono text-xs text-[#85858a] leading-relaxed flex-1 sm:text-right pl-0 sm:pl-4">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
