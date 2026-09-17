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
    <div className="relative flex items-start gap-5 sm:gap-8 group">
      {/* Subtle vertical connecting line */}
      {!isLast && (
        <div className="absolute left-[11px] sm:left-[13px] top-6 bottom-0 w-[1px] bg-[#171717] group-hover:bg-[#252525] transition-colors" />
      )}

      {/* Timeline Node Symbol */}
      <div className="relative z-10 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-[#050505] border border-[#1a1a1a] group-hover:border-[#55555a] shrink-0 transition-colors">
        <div className="w-1.5 h-1.5 bg-[#f3f3f4] group-hover:bg-[#6fe39a] transition-colors" />
      </div>

      {/* Event Details */}
      <div className="pb-8 space-y-1.5 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-[#55555a] font-medium tracking-wider">
            {formattedDay}
          </span>
          {event.result && (
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 border text-[10px] font-mono rounded-none font-normal uppercase",
                event.result.startsWith("+")
                  ? "border-[#6fe39a]/30 bg-[#6fe39a]/10 text-[#6fe39a]"
                  : "border-[#1a1a1a] bg-[#050505] text-[#85858a]"
              )}
            >
              {event.result}
            </Badge>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-medium text-[#f3f3f4] tracking-tight">
          {event.title}
        </h4>

        {event.description && (
          <p className="text-xs sm:text-sm text-[#85858a] font-light max-w-2xl leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
};
