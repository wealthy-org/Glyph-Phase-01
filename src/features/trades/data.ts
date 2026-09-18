import { Trade, TradeSummaryStats } from "./types";

// All trades and summary stats are dynamically computed from the database (prisma.trade).
export const TRADE_SUMMARY_DATA: TradeSummaryStats = {
  totalExecuted: 0,
  netPnl: "$0.00",
  winRatio: "0.0%",
  loggedRatio: "0 OF 0 LOGGED",
  network: "TESTNET",
  networkChain: "ROBINHOOD CHAIN",
};

export const GLYPH_TRADES_DATA: Trade[] = [];
