import React from "react";
import { DecisionLoopStepItem } from "../types";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionLoopSectionProps {
  eyebrow: string;
  heading: string;
  description: string;
  steps: DecisionLoopStepItem[];
  className?: string;
}

export const DecisionLoopSection: React.FC<DecisionLoopSectionProps> = ({
  eyebrow,
  heading,
  description,
  steps,
  className,
}) => {
  return (
    <section className={cn("space-y-8 sm:space-y-10 pt-8 sm:pt-12", className)} aria-label="Process Cycle">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="eyebrow">
          <span>{eyebrow}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#f3f3f4] uppercase">
          {heading}
        </h2>
        <p className="text-sm text-[#85858a] font-light">
          {description}
        </p>
      </div>

      {/* Process Flow Outer Panel */}
      <div className="border border-[#171717] bg-[#050505] p-6 sm:p-10 md:p-14">
        <div className="max-w-2xl mx-auto space-y-3">
          {steps.map((step, idx) => (
            <React.Fragment key={step.step}>
              {/* Step Card */}
              <div
                className={cn(
                  "border p-4 sm:p-5 flex items-start gap-4 transition-colors",
                  step.isHighlighted
                    ? "border-[#6fe39a]/40 bg-[#6fe39a]/5 hover:border-[#6fe39a]"
                    : "border-[#171717] bg-[#080808] hover:border-[#262626]"
                )}
              >
                {/* Step Index Badge */}
                <span
                  className={cn(
                    "font-mono text-xs px-2 py-0.5 border rounded-none shrink-0 font-medium",
                    step.isHighlighted
                      ? "border-[#6fe39a]/50 text-[#6fe39a] bg-[#6fe39a]/10"
                      : "border-[#171717] text-[#85858a] bg-[#0a0a0a]"
                  )}
                >
                  {step.step}
                </span>

                {/* Content */}
                <div className="space-y-1">
                  <h3
                    className={cn(
                      "font-mono text-xs sm:text-sm font-medium tracking-wider uppercase",
                      step.isHighlighted ? "text-[#6fe39a]" : "text-[#f3f3f4]"
                    )}
                  >
                    {step.label}
                  </h3>
                  <p className="font-mono text-xs text-[#85858a] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Downward Connector Arrow */}
              {idx < steps.length - 1 && (
                <div
                  className="flex justify-center py-1 text-[#333338]"
                  aria-hidden="true"
                >
                  <ArrowDown size={14} className="text-[#55555a]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
