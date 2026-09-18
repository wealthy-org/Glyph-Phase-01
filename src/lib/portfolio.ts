// ============================================================================
// GLYPH PHASE 01 — SIMULATED PORTFOLIO ENGINE
// Manages open positions, position sizing, leverage clamping, PnL, and lifecycle
// Derived from: BRIEF.md (§10, §11, §13, §3.0C, §3.10)
// ============================================================================

import { prisma } from "@/lib/prisma";
import {
  clampLeverage,
  calculatePositionMarginAndNotional,
  calculateLiquidationPrice,
  calculatePnL,
  calculateTransactionFee,
  isPositionLiquidated,
  PositionSide,
  DEFAULT_FEE_PERCENT,
} from "./simulation-math";
import { getTreasurySummary } from "./treasury";
import { createTradeMemory } from "./memory";

export interface OpenPositionInput {
  agentId?: string;
  asset: string;
  side: PositionSide;
  entryPrice: number;
  proposedPositionPercent?: number;
  proposedLeverage?: number;
  decisionId?: string;
  scores?: {
    conviction?: number;
    fundamentalScore?: number;
    technicalScore?: number;
    riskScore?: number;
    thesis?: Record<string, unknown>;
  };
  stopLoss?: number;
  targetPrice?: number;
  invalidationLevel?: number;
}

export interface ClosePositionResult {
  tradeId: string;
  positionId: string;
  asset: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  margin: number;
  notionalSize: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  fees: number;
  status: "CLOSED" | "LIQUIDATED";
  newBalance: number;
}

/**
 * Opens a new simulated position within the paper trading engine.
 * Validates available treasury cash, clamps leverage, creates Trade + Position,
 * deducts allocated margin & opening fee, and logs an EconomicEvent.
 */
export async function openSimulatedPosition(input: OpenPositionInput) {
  const agentIdentifier = input.agentId || "1";

  // 1. Fetch Agent with Treasury and Policy
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: {
      treasury: true,
      policy: true,
      positions: { where: { isOpen: true } },
    },
  });

  if (!agent) {
    throw new Error(`Agent with agentId ${agentIdentifier} not found.`);
  }

  if (!agent.treasury) {
    throw new Error(`Treasury for agent ${agentIdentifier} does not exist.`);
  }

  // 2. Determine limits from policy (or defaults)
  const maxLeverage = agent.policy?.maxLeverage ? Number(agent.policy.maxLeverage) : 2.0;
  const maxPositionPercent = agent.policy?.maxPositionPercent
    ? Number(agent.policy.maxPositionPercent)
    : 10.0;
  const feePercent = agent.policy?.simulatedFeePercent
    ? Number(agent.policy.simulatedFeePercent)
    : DEFAULT_FEE_PERCENT;

  // 3. Clamp leverage & position size %
  const effectiveLeverage = clampLeverage(input.proposedLeverage ?? 1.0, maxLeverage);
  const effectivePercent = Math.min(
    maxPositionPercent,
    Math.max(1.0, input.proposedPositionPercent ?? 5.0)
  );

  // 4. Calculate total equity & margin
  const treasurySummary = await getTreasurySummary(agentIdentifier);
  const { margin, notionalSize } = calculatePositionMarginAndNotional(
    treasurySummary.totalEquity,
    effectivePercent,
    effectiveLeverage
  );

  const openingFee = calculateTransactionFee(notionalSize, feePercent);
  const totalRequiredCash = margin + openingFee;
  const currentCash = Number(agent.treasury.currentBalance);

  if (currentCash < totalRequiredCash) {
    throw new Error(
      `Insufficient treasury cash balance: Required $${totalRequiredCash.toFixed(
        2
      )} ($${margin} margin + $${openingFee} fee), but available balance is only $${currentCash.toFixed(
        2
      )}.`
    );
  }

  // 5. Calculate liquidation threshold price
  const liquidationPrice = calculateLiquidationPrice(
    input.side,
    input.entryPrice,
    effectiveLeverage
  );

  // 6. Generate Trade Number e.g. GLYPH-0001
  const totalTradesCount = await prisma.trade.count({
    where: { agentId: agent.id },
  });
  const tradeNumber = `GLYPH-${String(totalTradesCount + 1).padStart(4, "0")}`;

  // 7. Atomic Prisma Transaction: update balance, create Trade, Position & EconomicEvent
  return await prisma.$transaction(async (tx) => {
    // Deduct cash from treasury
    const updatedTreasury = await tx.agentTreasury.update({
      where: { id: agent.treasury!.id },
      data: {
        currentBalance: {
          decrement: totalRequiredCash,
        },
      },
    });

    // Create Trade record
    const trade = await tx.trade.create({
      data: {
        tradeNumber,
        agentId: agent.id,
        asset: input.asset,
        action: input.side,
        entryPrice: input.entryPrice,
        positionSize: margin, // Allocated margin dollar value
        leverage: effectiveLeverage,
        conviction: input.scores?.conviction,
        fundamentalScore: input.scores?.fundamentalScore,
        technicalScore: input.scores?.technicalScore,
        riskScore: input.scores?.riskScore,
        thesis: (input.scores?.thesis ?? {}) as any,
        fees: openingFee,
        status: "OPEN",
      },
    });

    // If a decision was passed, link it to this trade
    if (input.decisionId) {
      await tx.decision.update({
        where: { id: input.decisionId },
        data: { tradeId: trade.id },
      });
    }

    // Create Position record
    const position = await tx.position.create({
      data: {
        agentId: agent.id,
        tradeId: trade.id,
        asset: input.asset,
        side: input.side,
        entryPrice: input.entryPrice,
        currentPrice: input.entryPrice,
        positionSize: margin,
        leverage: effectiveLeverage,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        stopLoss: input.stopLoss,
        liquidationPrice,
        invalidationLevel: input.invalidationLevel,
        targetPrice: input.targetPrice,
        isOpen: true,
      },
    });

    // Record Economic Event for Life Log (§19)
    await tx.economicEvent.create({
      data: {
        agentId: agent.id,
        eventType: "TRADE_OPENED",
        title: `Opened ${input.side} ${input.asset} (${effectiveLeverage}x Simulated)`,
        description: `Committed $${margin.toFixed(2)} margin at $${input.entryPrice.toFixed(
          2
        )} with $${notionalSize.toFixed(2)} notional market exposure.`,
        tradeId: trade.id,
        result: `${effectiveLeverage}x`,
      },
    });

    return {
      trade,
      position,
      margin,
      notionalSize,
      effectiveLeverage,
      openingFee,
      liquidationPrice,
      remainingCash: Number(updatedTreasury.currentBalance),
    };
  });
}

/**
 * Updates current market prices for all open positions.
 * Re-evaluates unrealized PnL and triggers automated simulated liquidation
 * if the market price breaches the liquidation threshold.
 */
export async function updatePositionsMarketPrices(
  quotes: Record<string, number>,
  agentIdentifier = process.env.GLYPH_AGENT_ID || "3"
) {
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: {
      positions: {
        where: { isOpen: true },
        include: { trade: true },
      },
    },
  });

  if (!agent || agent.positions.length === 0) {
    return { updatedCount: 0, liquidatedCount: 0, details: [] };
  }

  const results = [];
  let liquidatedCount = 0;

  for (const pos of agent.positions) {
    const currentPrice = quotes[pos.asset];
    if (currentPrice === undefined || currentPrice <= 0) {
      continue;
    }

    const margin = Number(pos.positionSize);
    const leverage = Number(pos.leverage);
    const notionalSize = margin * leverage;
    const entryPrice = Number(pos.entryPrice);
    const liquidationPrice = pos.liquidationPrice ? Number(pos.liquidationPrice) : 0;

    // Check liquidation condition (§3.10 point 2)
    const isBreached = isPositionLiquidated(pos.side, currentPrice, liquidationPrice);

    if (isBreached) {
      // Execute automatic simulated liquidation
      const liquidationResult = await closeSimulatedPosition(
        pos.id,
        liquidationPrice > 0 ? liquidationPrice : currentPrice,
        "LIQUIDATION"
      );
      liquidatedCount++;
      results.push({
        positionId: pos.id,
        asset: pos.asset,
        status: "LIQUIDATED",
        liquidationPrice,
        exitPrice: currentPrice,
        loss: liquidationResult.realizedPnl,
      });
    } else {
      // Standard floating PnL update
      const { pnlDollar, pnlPercent } = calculatePnL(
        pos.side,
        entryPrice,
        currentPrice,
        notionalSize,
        margin
      );

      await prisma.position.update({
        where: { id: pos.id },
        data: {
          currentPrice,
          unrealizedPnl: pnlDollar,
          unrealizedPnlPercent: pnlPercent,
        },
      });

      results.push({
        positionId: pos.id,
        asset: pos.asset,
        status: "OPEN",
        currentPrice,
        unrealizedPnl: pnlDollar,
        unrealizedPnlPercent: pnlPercent,
      });
    }
  }

  return {
    updatedCount: results.length,
    liquidatedCount,
    details: results,
  };
}

/**
 * Closes an open simulated position (either manually, profit take, stop loss, or liquidation).
 * Realizes PnL, deducts closing fee, credits margin + net PnL back to treasury cash,
 * updates Trade and Position status, and logs EconomicEvent(s).
 */
export async function closeSimulatedPosition(
  positionId: string,
  exitPrice: number,
  reason: "MANUAL" | "LIQUIDATION" | "STOP_LOSS" | "TAKE_PROFIT" = "MANUAL"
): Promise<ClosePositionResult> {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: {
      trade: true,
      agent: {
        include: {
          treasury: true,
          policy: true,
        },
      },
    },
  });

  if (!position || !position.isOpen) {
    throw new Error(`Position ${positionId} is not active or does not exist.`);
  }

  const agent = position.agent;
  if (!agent.treasury) {
    throw new Error(`Treasury for agent ${agent.id} not found.`);
  }

  const margin = Number(position.positionSize);
  const leverage = Number(position.leverage);
  const notionalSize = margin * leverage;
  const entryPrice = Number(position.entryPrice);

  const feePercent = agent.policy?.simulatedFeePercent
    ? Number(agent.policy.simulatedFeePercent)
    : DEFAULT_FEE_PERCENT;

  let realizedPnl = 0;
  let realizedPnlPercent = 0;
  let closingFee = 0;
  let returnedToTreasury = 0;

  if (reason === "LIQUIDATION") {
    // On liquidation, entire allocated margin is lost
    realizedPnl = -margin;
    realizedPnlPercent = -100.0;
    closingFee = 0;
    returnedToTreasury = 0; // Collateral is absorbed by simulated liquidation
  } else {
    const pnl = calculatePnL(position.side, entryPrice, exitPrice, notionalSize, margin);
    closingFee = calculateTransactionFee(notionalSize, feePercent);
    realizedPnl = pnl.pnlDollar;
    realizedPnlPercent = pnl.pnlPercent;

    // Margin + Realized Gain/Loss - Fee
    returnedToTreasury = Math.max(0, margin + realizedPnl - closingFee);
  }

  const tradeStatus: "CLOSED" | "LIQUIDATED" = reason === "LIQUIDATION" ? "LIQUIDATED" : "CLOSED";
  const totalFees = Number(position.trade.fees) + closingFee;

  const txResult = await prisma.$transaction(async (tx) => {
    // 1. Credit returned funds back into treasury cash
    const updatedTreasury = await tx.agentTreasury.update({
      where: { id: agent.treasury!.id },
      data: {
        currentBalance: {
          increment: returnedToTreasury,
        },
      },
    });

    // 2. Close Position record
    await tx.position.update({
      where: { id: position.id },
      data: {
        isOpen: false,
        closedAt: new Date(),
        currentPrice: exitPrice,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
      },
    });

    // 3. Update Trade record
    await tx.trade.update({
      where: { id: position.tradeId },
      data: {
        exitPrice,
        simulatedPnl: realizedPnl,
        simulatedPnlPercent: realizedPnlPercent,
        fees: totalFees,
        status: tradeStatus,
        closedAt: new Date(),
      },
    });

    // 4. Log Economic Event for trade closed / liquidation
    const pnlSign = realizedPnl >= 0 ? "+" : "";
    const formattedResult = `${pnlSign}${realizedPnlPercent.toFixed(2)}%`;

    await tx.economicEvent.create({
      data: {
        agentId: agent.id,
        eventType: "TRADE_CLOSED",
        title: `Closed ${position.side} ${position.asset} (${tradeStatus})`,
        description: `Exit at $${exitPrice.toFixed(2)} (${reason}). Result: ${pnlSign}$${realizedPnl.toFixed(
          2
        )} (${formattedResult}). Returned $${returnedToTreasury.toFixed(2)} to treasury.`,
        tradeId: position.tradeId,
        result: formattedResult,
      },
    });

    // 5. Log Profit/Loss Economic Event (§19)
    await tx.economicEvent.create({
      data: {
        agentId: agent.id,
        eventType: realizedPnl >= 0 ? "PROFIT_RECORDED" : "LOSS_RECORDED",
        title: realizedPnl >= 0 ? `Profit Recorded` : `Loss Recorded`,
        description: `${position.asset} ${position.side} closed with ${pnlSign}$${realizedPnl.toFixed(
          2
        )} net PnL.`,
        tradeId: position.tradeId,
        result: formattedResult,
      },
    });

    return {
      tradeId: position.tradeId,
      positionId: position.id,
      asset: position.asset,
      side: position.side,
      entryPrice,
      exitPrice,
      margin,
      notionalSize,
      realizedPnl,
      realizedPnlPercent,
      fees: totalFees,
      status: tradeStatus,
      newBalance: Number(updatedTreasury.currentBalance),
    };
  });

  // Automatically form persistent memory of this trade (§15)
  try {
    await createTradeMemory({
      tradeId: position.tradeId,
      agentId: agent.id,
      asset: position.asset,
      side: position.side,
      pnlPercent: realizedPnlPercent,
      conviction: position.trade.conviction,
      thesis: position.trade.thesis,
      reason,
    });
  } catch (err) {
    console.warn(`[Portfolio] Memory creation notice:`, err);
  }

  return txResult;
}

/**
 * Returns all active open positions for the agent with aggregated stats.
 */
export async function getActivePositions(
  agentIdentifier = process.env.GLYPH_AGENT_ID || "3"
) {
  const agent = await prisma.agent.findFirst({
    where: { agentId: agentIdentifier },
    include: {
      positions: {
        where: { isOpen: true },
        include: { trade: true },
        orderBy: { openedAt: "desc" },
      },
    },
  });

  if (!agent) {
    return { positions: [], totalMargin: 0, totalNotional: 0, totalUnrealizedPnl: 0 };
  }

  let totalMargin = 0;
  let totalNotional = 0;
  let totalUnrealizedPnl = 0;

  const positions = agent.positions.map((pos) => {
    const margin = Number(pos.positionSize);
    const leverage = Number(pos.leverage);
    const notional = margin * leverage;
    const unrealizedPnl = Number(pos.unrealizedPnl);

    totalMargin += margin;
    totalNotional += notional;
    totalUnrealizedPnl += unrealizedPnl;

    return {
      id: pos.id,
      tradeId: pos.tradeId,
      tradeNumber: pos.trade.tradeNumber,
      asset: pos.asset,
      side: pos.side,
      entryPrice: Number(pos.entryPrice),
      currentPrice: Number(pos.currentPrice),
      margin,
      leverage,
      notional,
      unrealizedPnl,
      unrealizedPnlPercent: Number(pos.unrealizedPnlPercent),
      liquidationPrice: pos.liquidationPrice ? Number(pos.liquidationPrice) : null,
      stopLoss: pos.stopLoss ? Number(pos.stopLoss) : null,
      targetPrice: pos.targetPrice ? Number(pos.targetPrice) : null,
      openedAt: pos.openedAt,
    };
  });

  return {
    positions,
    totalMargin,
    totalNotional,
    totalUnrealizedPnl,
  };
}
