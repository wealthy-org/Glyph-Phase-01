"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MemorySectionProps {
  memory?: {
    outcome: "WIN" | "LOSS" | "BREAKEVEN";
    thesisResult: "CORRECT" | "INCORRECT" | "PARTIAL";
    lesson: string;
    confidenceCalibration: "GOOD" | "OVER_CONFIDENT" | "UNDER_CONFIDENT" | "NEUTRAL";
    adaptation?: string;
    weightShift?: string;
  };
  className?: string;
}

export const MemorySection: React.FC<MemorySectionProps> = ({
  memory,
  className,
}) => {
  if (!memory) return null;

  const isWin = memory.outcome === "WIN";
  const isLoss = memory.outcome === "LOSS";

  const outcomeColor = isWin
    ? "text-[#45d483] border-[#45d483]/30 bg-[#45d483]/10"
    : isLoss
    ? "text-[#ff5c5c] border-[#ff5c5c]/30 bg-[#ff5c5c]/10"
    : "text-[#85858a] border-[#85858a]/30 bg-[#85858a]/10";

  const calibrationLabel =
    memory.confidenceCalibration === "GOOD"
      ? "WELL CALIBRATED"
      : memory.confidenceCalibration === "OVER_CONFIDENT"
      ? "OVERCONFIDENCE DETECTED"
      : memory.confidenceCalibration === "UNDER_CONFIDENT"
      ? "UNDERCONFIDENT"
      : "NEUTRAL";

  return (
    <section
      className={cn(
        "border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Persistent Memory & Historical Reflection"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="font-mono text-[10px] sm:text-xs text-[#55555a] tracking-widest uppercase block">
            PERSISTENT STATE // BRIEF §15
          </span>
          <h2 className="font-mono text-xs sm:text-sm text-[#85858a] tracking-widest uppercase font-medium">
            HISTORICAL MEMORY &amp; REFLECTION
          </h2>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className={cn(
              "px-2.5 py-1 border text-[11px] font-medium tracking-wider uppercase",
              outcomeColor
            )}
          >
            {memory.outcome} · {memory.thesisResult}
          </span>
          <span className="px-2.5 py-1 border border-[#222222] bg-[#0c0c0c] text-[#85858a] text-[11px] tracking-wider uppercase">
            {calibrationLabel}
          </span>
        </div>
      </div>

      <Separator className="bg-[#171717]" />

      {/* Lesson & Weight Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Lesson Statement (2 cols) */}
        <div className="md:col-span-2 space-y-3">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase block">
            LEARNED LESSON (PERMANENT STATE)
          </span>
          <blockquote className="text-sm sm:text-base text-[#d0d0d2] font-light leading-relaxed border-l-2 border-[#b8a77a] pl-4 italic">
            &ldquo;{memory.lesson}&rdquo;
          </blockquote>
          {memory.adaptation && (
            <p className="text-xs text-[#85858a] font-light pl-4 pt-1">
              <span className="font-mono text-[#55555a] uppercase tracking-wider font-normal">
                Adaptation:{" "}
              </span>
              {memory.adaptation}
            </p>
          )}
        </div>

        {/* Model Weight Shift (1 col) */}
        <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#171717] pt-4 md:pt-0 md:pl-6">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase block">
            WEIGHT SHIFT
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#f3f3f4] bg-[#0a0a0a] border border-[#1c1c1c] p-3 rounded-none">
            {memory.weightShift || "Neutral weight distribution"}
          </div>
          <span className="font-mono text-[10px] text-[#55555a] block">
            Applied to subsequent decision prompt cycles (§112).
          </span>
        </div>
      </div>
    </section>
  );
};
