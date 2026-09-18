"use client";

import React, { useEffect, useState } from "react";
import { LandingEconomicEvent } from "../types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EventItemProps {
  event: LandingEconomicEvent;
  isLast?: boolean;
}

export const EventItem: React.FC<EventItemProps> = ({ event, isLast = false }) => {
  const formattedDay = `DAY ${event.day.toString().padStart(2, "0")}`;
  const [localTime, setLocalTime] = useState<string | null>(null);

  useEffect(() => {
    if (event.timestamp) {
      try {
        const d = new Date(event.timestamp);
        const timeStr = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        let tzName = "";
        try {
          const parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(d);
          const tzPart = parts.find((p) => p.type === "timeZoneName");
          if (tzPart?.value) {
            tzName = tzPart.value;
          }
        } catch {
          // ignore
        }

        setLocalTime(tzName ? `${timeStr} ${tzName}` : timeStr);
      } catch {
        // ignore
      }
    }
  }, [event.timestamp]);

  const displayTime = localTime ?? event.time;

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
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <span className="text-[#85858a] font-medium tracking-wider">
            {formattedDay}
          </span>
          <span className="text-[#333333]">·</span>
          <span className="text-[#55555a]">{event.date}</span>
          {displayTime && (
            <>
              <span className="text-[#333333]">·</span>
              <span
                suppressHydrationWarning
                className="text-[#65656b] tabular-nums font-mono text-[11px]"
              >
                {displayTime}
              </span>
            </>
          )}
          {event.result && (
            <Badge
              variant="outline"
              className={cn(
                "px-1.5 py-0.5 border text-[10px] font-mono rounded-none font-normal uppercase",
                event.result.startsWith("+")
                  ? "border-[#6fe39a]/30 bg-[#6fe39a]/10 text-[#6fe39a]"
                  : event.result.startsWith("-")
                  ? "border-[#c47a7a]/30 bg-[#c47a7a]/10 text-[#c47a7a]"
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
