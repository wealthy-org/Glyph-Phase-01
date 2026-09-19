import { prisma } from "@/lib/prisma";

export interface TreasurySummary {
  agentId: string;
  currency: string;
  initialCapital: number;
  currentBalance: number; // Available unallocated cash
  allocatedMargin: number; // Cash currently committed to open positions
  unrealizedPnl: number; // Floating profit/loss across open positions
  totalEquity: number; // Net total capital = cash + margin + unrealized PnL
  pnlDollar: number; // Total gain/loss vs initial capital
  pnlPercent: number; // Total return percentage
}

export const DEFAULT_INITIAL_CAPITAL = 0.0;
export const DEFAULT_CURRENCY = "USD-SIM";

/**
 * Retrieves the current verifiable treasury state for Glyph.
 * Aggregates cash balance with active position values to derive true equity.
 */
export async function getTreasurySummary(
  agentId?: string
): Promise<TreasurySummary> {
  const targetAgentId = agentId || process.env.GLYPH_AGENT_ID || "1";

  try {
    let agent = await prisma.agent.findFirst({
      where: { agentId: targetAgentId },
      include: {
        treasury: true,
        positions: {
          where: { isOpen: true },
        },
      },
    });

    // Fallback to first agent if specific agentId not matched
    if (!agent) {
      agent = await prisma.agent.findFirst({
        include: {
          treasury: true,
          positions: {
            where: { isOpen: true },
          },
        },
      });
    }

    if (agent && !agent.treasury) {
      // Auto-initialize treasury record in database if missing
      const newTreasury = await prisma.agentTreasury.upsert({
        where: { agentId: agent.id },
        update: {},
        create: {
          agentId: agent.id,
          initialCapital: DEFAULT_INITIAL_CAPITAL,
          currentBalance: DEFAULT_INITIAL_CAPITAL,
          currency: DEFAULT_CURRENCY,
        },
      });
      agent.treasury = newTreasury;
    }

    if (!agent || !agent.treasury) {
      return {
        agentId: targetAgentId,
        currency: DEFAULT_CURRENCY,
        initialCapital: DEFAULT_INITIAL_CAPITAL,
        currentBalance: DEFAULT_INITIAL_CAPITAL,
        allocatedMargin: 0,
        unrealizedPnl: 0,
        totalEquity: DEFAULT_INITIAL_CAPITAL,
        pnlDollar: 0,
        pnlPercent: 0,
      };
    }

    const initialCapital = Number(agent.treasury.initialCapital);
    const currentBalance = Number(agent.treasury.currentBalance);

    // Sum open positions margin and unrealized PnL
    let allocatedMargin = 0;
    let unrealizedPnl = 0;

    for (const pos of agent.positions) {
      allocatedMargin += Number(pos.positionSize);
      unrealizedPnl += Number(pos.unrealizedPnl);
    }

    const totalEquity = currentBalance + allocatedMargin + unrealizedPnl;
    const pnlDollar = totalEquity - initialCapital;
    const pnlPercent = initialCapital > 0 ? (pnlDollar / initialCapital) * 100 : 0;

    return {
      agentId: agent.agentId,
      currency: agent.treasury.currency,
      initialCapital,
      currentBalance,
      allocatedMargin,
      unrealizedPnl,
      totalEquity,
      pnlDollar,
      pnlPercent,
    };
  } catch (error) {
    console.error("Failed to load treasury summary:", error);
    return {
      agentId: targetAgentId,
      currency: DEFAULT_CURRENCY,
      initialCapital: DEFAULT_INITIAL_CAPITAL,
      currentBalance: DEFAULT_INITIAL_CAPITAL,
      allocatedMargin: 0,
      unrealizedPnl: 0,
      totalEquity: DEFAULT_INITIAL_CAPITAL,
      pnlDollar: 0,
      pnlPercent: 0,
    };
  }
}
