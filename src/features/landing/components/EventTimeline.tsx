import { EventItem } from "@/features/landing/components/EventItem";
import { LandingEconomicEvent } from "../types";
import React from "react";

interface EventTimelineProps {
  events: LandingEconomicEvent[];
  className?: string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, className }) => {
  return (
    <div className={className} role="feed" aria-label="Chronological Economic Events">
      {events.map((event, index) => (
        <EventItem
          key={event.id}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
};
