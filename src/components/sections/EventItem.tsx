import React from "react";
import { EconomicEvent } from "@/types/glyph";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EventItemProps {
  event: EconomicEvent;
  isLast?: boolean;
}

export const EventItem: React.FC<EventItemProps> = ({ event, isLast = false }) => {
  const formattedDay = `DAY ${event.day.toString().padStart(2, "0")}`;

  return (
    <div className="relative flex items-start gap-6 sm:gap-10 group">
      {/* Subtle vertical connecting line */}
      {!isLast && (
        <div className="absolute left-[13px] sm:left-[17px] top-6 bottom-0 w-[1px] bg-[#242424] group-hover:bg-[#333333] transition-colors" />
      )}

      {/* Timeline Node Symbol */}
      <div className="relative z-10 flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 bg-[#080808] border border-[#242424] group-hover:border-[#666666] shrink-0 transition-colors">
        <div className="w-1.5 h-1.5 bg-[#F5F5F5] group-hover:bg-[#8FB996] transition-colors" />
      </div>

      {/* Event Details */}
      <div className="pb-10 space-y-1.5 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-[#666666] font-medium tracking-wider">
            {formattedDay}
          </span>
          {event.result && (
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 border text-[11px] font-mono rounded-none font-normal",
                event.result.startsWith("+")
                  ? "border-[#8FB996]/30 bg-[#8FB996]/10 text-[#8FB996]"
                  : "border-[#242424] bg-[#0D0D0D] text-[#A0A0A0]"
              )}
            >
              {event.result}
            </Badge>
          )}
        </div>

        <h4 className="text-base sm:text-lg font-normal text-[#F5F5F5] tracking-tight">
          {event.title}
        </h4>

        {event.description && (
          <p className="text-xs sm:text-sm text-[#A0A0A0] font-light max-w-2xl leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
};
