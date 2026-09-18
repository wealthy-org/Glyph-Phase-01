export type LifeCategory =
  | "ALL EVENTS"
  | "GENESIS"
  | "TREASURY"
  | "THESIS"
  | "DECISION"
  | "TRADE"
  | "MEMORY";

export type EventCategory =
  | "GENESIS"
  | "TREASURY"
  | "THESIS"
  | "DECISION"
  | "TRADE"
  | "MEMORY";

export interface LifeEvent {
  id: string;
  day: number;
  date: string;
  time?: string;
  timestamp?: string;
  category: EventCategory;
  title: string;
  description: string;
  tx?: string | null;
  txHash?: string | null;
  result?: string | null;
}
