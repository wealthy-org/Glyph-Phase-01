import React from "react";
import { LifeEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LifeLogItemProps {
  event: LifeEvent;
  isLast?: boolean;
}

export const LifeLogItem: React.FC<LifeLogItemProps> = ({ event, isLast = false }) => {
  const formattedDay = `DAY ${event.day.toString().padStart(2, "0")}`;

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Spine vertical line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-[#242424]"
          aria-hidden="true"
        />
      )}

      {/* Geometric minimal marker on the spine */}
      <div className="relative z-10 flex items-center justify-center w-[15px] h-[15px] bg-[#080808] border border-[#242424] group-hover:border-[#666666] shrink-0 mt-1 transition-colors">
        <div className="w-[3px] h-[3px] bg-[#F5F5F5] group-hover:bg-[#8FB996] transition-colors" />
      </div>

      {/* Content block */}
      <div className="flex-1 pb-10 space-y-2">
        {/* Metadata row: Day, Date, Category Badge, and Result */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[#A0A0A0] font-medium tracking-wider">
              {formattedDay}
            </span>
            <span className="text-[#666666]">·</span>
            <span className="text-[#666666] tracking-tight">{event.date}</span>
            <Badge
              variant="outline"
              className="border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-none font-normal"
            >
              {event.category}
            </Badge>
          </div>

          {/* Result value (e.g. +8.4%) right-aligned */}
          {event.result && (
            <span
              className={cn(
                "font-mono text-xs font-medium tracking-tight",
                event.result.startsWith("+")
                  ? "text-[#8FB996]"
                  : event.result.startsWith("-")
                  ? "text-[#C47A7A]"
                  : "text-[#F5F5F5]"
              )}
            >
              {event.result}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-normal text-[#F5F5F5] tracking-tight leading-snug">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#A0A0A0] font-light leading-relaxed">
          {event.description}
        </p>

        {/* Transaction hash */}
        <div className="pt-1">
          <span className="font-mono text-[11px] text-[#666666] tracking-wider select-all">
            TX: {event.tx}
          </span>
        </div>
      </div>
    </div>
  );
};
