import { LifeCategory, LifeEvent } from "./types";

export const LIFE_CATEGORIES: LifeCategory[] = [
  "ALL EVENTS",
  "GENESIS",
  "TREASURY",
  "THESIS",
  "DECISION",
  "TRADE",
  "MEMORY",
];

// All Life Log events are sourced dynamically from the database (prisma.economicEvent).
export const GLYPH_LIFE_EVENTS: LifeEvent[] = [];
