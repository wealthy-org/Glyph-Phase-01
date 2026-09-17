import React from "react";
import { LifeEvent, LifeCategory } from "../types";
import { LifeLogItem } from "./LifeLogItem";

interface LifeLogTimelineProps {
  events: LifeEvent[];
  selectedCategory: LifeCategory;
  className?: string;
}

export const LifeLogTimeline: React.FC<LifeLogTimelineProps> = ({
  events,
  selectedCategory,
  className,
}) => {
  const filteredEvents =
    selectedCategory === "ALL EVENTS"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  if (filteredEvents.length === 0) {
    return (
      <div className="py-16 text-center border border-[#242424] bg-[#0D0D0D]/50 space-y-2">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          NO ENTRIES RECORDED
        </span>
        <p className="font-mono text-xs text-[#A0A0A0]">
          Category &quot;{selectedCategory}&quot; has no events logged in current epoch.
        </p>
      </div>
    );
  }

  return (
    <div
      className={className}
      role="feed"
      aria-label="Chronological Life Events Log"
    >
      {filteredEvents.map((event, index) => (
        <LifeLogItem
          key={event.id}
          event={event}
          isLast={index === filteredEvents.length - 1}
        />
      ))}
    </div>
  );
};
