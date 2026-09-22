"use client";

import React, { useEffect, useState } from "react";
import { LifeEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { getExplorerTxUrl } from "@/lib/onchain/chains";
import { cn } from "@/lib/utils";

interface LifeLogItemProps {
  event: LifeEvent;
  isLast?: boolean;
}

export const LifeLogItem: React.FC<LifeLogItemProps> = ({ event, isLast = false }) => {
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

        // Retrieve local timezone abbreviation or code (e.g., WIB, GMT+7, PDT, EDT)
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
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Spine vertical line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-[#171717] group-hover:bg-[#252525] transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Geometric minimal marker on the spine */}
      <div className="relative z-10 flex items-center justify-center w-[15px] h-[15px] bg-[#000000] border border-[#1a1a1a] group-hover:border-[#55555a] shrink-0 mt-1 transition-colors">
        <div className="w-[3px] h-[3px] bg-[#f3f3f4] group-hover:bg-[#6fe39a] transition-colors" />
      </div>

      {/* Content block */}
      <div className="flex-1 pb-10 space-y-2">
        {/* Metadata row: Day, Date, Category Badge, and Result */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[#85858a] font-medium tracking-wider">
              {formattedDay}
            </span>
            <span className="text-[#333333]">·</span>
            <span className="text-[#55555a] tracking-tight">{event.date}</span>
            {displayTime && (
              <>
                <span className="text-[#333333]">·</span>
                <span
                  suppressHydrationWarning
                  className="text-[#65656b] tracking-tight tabular-nums font-mono text-[11px]"
                >
                  {displayTime}
                </span>
              </>
            )}
            <Badge
              variant="outline"
              className="border-[#1a1a1a] bg-[#050505] text-[#85858a] text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-none font-normal"
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
                  ? "text-[#6fe39a]"
                  : event.result.startsWith("-")
                  ? "text-[#c47a7a]"
                  : "text-[#f3f3f4]"
              )}
            >
              {event.result}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-normal text-[#f3f3f4] tracking-tight leading-snug">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#85858a] font-light leading-relaxed">
          {event.description}
        </p>

        {/* Transaction hash */}
        {event.tx && (
          <div className="pt-1">
            {event.txHash ? (
              <a
                href={getExplorerTxUrl(event.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#55555a] hover:text-[#6fe39a] transition-colors select-all"
                title="Verify transaction on Robinhood Chain Explorer"
              >
                <span>TX: {event.tx}</span>
                <span className="text-[9px] opacity-70">↗</span>
              </a>
            ) : (
              <span className="font-mono text-[11px] text-[#55555a] tracking-wider select-all">
                TX: {event.tx}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
