// ============================================================================
// GLYPH PHASE 01 — SIMULATION MATH ENGINE
// Deterministic financial and risk math for paper trading & leverage modeling.
// Pure functions with zero side-effects or external dependencies.
// ============================================================================

export type PositionSide = "LONG" | "SHORT";

export const DEFAULT_FEE_PERCENT = 0.1; // 0.1% per transaction (§3.10 point 1)
export const DEFAULT_MAINTENANCE_MARGIN_RATE = 0.05; // 5% MMR before simulated liquidation

/**
 * Clamps the proposed leverage from the LLM to policy limits (§3.0C).
 * LLM proposes, policy clamps deterministically.
 */
export function clampLeverage(proposedLeverage: number, maxLeverage: number = 2): number {
  if (isNaN(proposedLeverage) || proposedLeverage < 1) {
    return 1;
  }
  return Math.min(proposedLeverage, Math.max(1, maxLeverage));
}

/**
 * Calculates allocated margin (collateral held from treasury cash)
 * and total notional exposure in the market.
 */
export function calculatePositionMarginAndNotional(
  totalEquity: number,
  positionPercent: number,
  leverage: number
): { margin: number; notionalSize: number } {
  const safeEquity = Math.max(0, totalEquity);
  const safePercent = Math.min(100, Math.max(0, positionPercent));
  const safeLeverage = Math.max(1, leverage);

  const margin = Number(((safeEquity * safePercent) / 100).toFixed(4));
  const notionalSize = Number((margin * safeLeverage).toFixed(4));

  return { margin, notionalSize };
}

/**
 * Calculates simulated liquidation threshold price for a position.
 * Uses maintenance margin rate (MMR) standard.
 *
 * For LONG: Entry * (1 - 1/leverage + MMR)
 * For SHORT: Entry * (1 + 1/leverage - MMR)
 */
export function calculateLiquidationPrice(
  side: PositionSide,
  entryPrice: number,
  leverage: number,
  maintenanceMarginRate: number = DEFAULT_MAINTENANCE_MARGIN_RATE
): number {
  if (entryPrice <= 0 || leverage <= 0) return 0;

  if (side === "LONG") {
    const rawPrice = entryPrice * (1 - 1 / leverage + maintenanceMarginRate);
    return Math.max(0, Number(rawPrice.toFixed(4)));
  } else {
    const rawPrice = entryPrice * (1 + 1 / leverage - maintenanceMarginRate);
    return Math.max(0, Number(rawPrice.toFixed(4)));
  }
}

/**
 * Calculates profit & loss (dollar amount and ROE percentage).
 */
export function calculatePnL(
  side: PositionSide,
  entryPrice: number,
  currentPrice: number,
  notionalSize: number,
  margin: number
): { pnlDollar: number; pnlPercent: number } {
  if (entryPrice <= 0 || notionalSize <= 0 || margin <= 0) {
    return { pnlDollar: 0, pnlPercent: 0 };
  }

  const priceDelta =
    side === "LONG" ? currentPrice - entryPrice : entryPrice - currentPrice;

  const priceRatio = priceDelta / entryPrice;
  const pnlDollar = Number((notionalSize * priceRatio).toFixed(4));
  const pnlPercent = Number(((pnlDollar / margin) * 100).toFixed(4));

  return { pnlDollar, pnlPercent };
}

/**
 * Calculates transaction fee for opening or closing a trade.
 * @param notionalSize Total market position exposure in dollars
 * @param feePercent Percentage fee, e.g. 0.1 for 0.1%
 */
export function calculateTransactionFee(
  notionalSize: number,
  feePercent: number = DEFAULT_FEE_PERCENT
): number {
  return Number((Math.max(0, notionalSize) * (feePercent / 100)).toFixed(4));
}

/**
 * Checks if current market price breaches the liquidation threshold.
 */
export function isPositionLiquidated(
  side: PositionSide,
  currentPrice: number,
  liquidationPrice: number
): boolean {
  if (liquidationPrice <= 0) return false;

  if (side === "LONG") {
    return currentPrice <= liquidationPrice;
  } else {
    return currentPrice >= liquidationPrice;
  }
}
