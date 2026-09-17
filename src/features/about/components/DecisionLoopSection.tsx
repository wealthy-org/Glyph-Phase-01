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
        <div className="font-mono text-xs text-[#8FB996] tracking-widest">
          {eyebrow}
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#F5F5F5] uppercase">
          {heading}
        </h2>
        <p className="text-sm text-[#A0A0A0] font-light">
          {description}
        </p>
      </div>

      {/* Process Flow Outer Panel */}
      <div className="border border-[#242424] bg-[#0D0D0D]/40 p-6 sm:p-10 md:p-14">
        <div className="max-w-2xl mx-auto space-y-3">
          {steps.map((step, idx) => (
            <React.Fragment key={step.step}>
              {/* Step Card */}
              <div
                className={cn(
                  "border p-4 sm:p-5 flex items-start gap-4 transition-colors",
                  step.isHighlighted
                    ? "border-[#8FB996]/50 bg-[#8FB996]/5 hover:border-[#8FB996]"
                    : "border-[#242424] bg-[#080808] hover:border-[#383838]"
                )}
              >
                {/* Step Index Badge */}
                <span
                  className={cn(
                    "font-mono text-xs px-2 py-0.5 border rounded-none shrink-0 font-medium",
                    step.isHighlighted
                      ? "border-[#8FB996]/50 text-[#8FB996] bg-[#8FB996]/10"
                      : "border-[#242424] text-[#8FB996] bg-[#0D0D0D]"
                  )}
                >
                  {step.step}
                </span>

                {/* Content */}
                <div className="space-y-1">
                  <h3
                    className={cn(
                      "font-mono text-xs sm:text-sm font-medium tracking-wider uppercase",
                      step.isHighlighted ? "text-[#8FB996]" : "text-[#F5F5F5]"
                    )}
                  >
                    {step.label}
                  </h3>
                  <p className="font-mono text-xs text-[#A0A0A0] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Downward Connector Arrow */}
              {idx < steps.length - 1 && (
                <div
                  className="flex justify-center py-1 text-[#666666]"
                  aria-hidden="true"
                >
                  <ArrowDown size={14} className="text-[#666666]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
