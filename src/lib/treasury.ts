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

export interface FundTreasuryParams {
  agentId?: string;
  amount: number;
  description?: string;
  txHash?: string | null;
}

export interface FundTreasuryResult {
  success: boolean;
  message: string;
  treasury: TreasurySummary;
  event: {
    id: string;
    eventType: string;
    title: string;
    description: string | null;
    result: string | null;
    day: number | null;
    timestamp: Date;
    txHash: string | null;
  };
}

/**
 * Funds Glyph's autonomous treasury pool with additional simulated capital.
 * Increments current cash balance and initial capital baseline, and registers
 * a verifiable TREASURY_FUNDED economic event in the Life Log.
 */
export async function fundTreasury(
  params: FundTreasuryParams
): Promise<FundTreasuryResult> {
  const { amount, description, txHash } = params;

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error("Funding amount must be a positive number greater than 0");
  }

  const targetAgentId = params.agentId || process.env.GLYPH_AGENT_ID || "1";

  let agent = await prisma.agent.findFirst({
    where: { agentId: targetAgentId },
    include: { treasury: true },
  });

  if (!agent) {
    agent = await prisma.agent.findFirst({
      include: { treasury: true },
    });
  }

  if (!agent) {
    throw new Error(`Agent not found with identifier '${targetAgentId}'`);
  }

  // Ensure treasury record exists
  let treasury = agent.treasury;
  if (!treasury) {
    treasury = await prisma.agentTreasury.create({
      data: {
        agentId: agent.id,
        initialCapital: DEFAULT_INITIAL_CAPITAL,
        currentBalance: DEFAULT_INITIAL_CAPITAL,
        currency: DEFAULT_CURRENCY,
      },
    });
  }

  const prevBalance = Number(treasury.currentBalance);
  const prevInitialCapital = Number(treasury.initialCapital);
  const newBalance = prevBalance + amount;
  const newInitialCapital = prevInitialCapital + amount;

  // 1. Update AgentTreasury in DB
  const updatedTreasury = await prisma.agentTreasury.update({
    where: { id: treasury.id },
    data: {
      currentBalance: newBalance,
      initialCapital: newInitialCapital,
    },
  });

  // 2. Compute Day Number since Agent Birth
  const birthDate = agent.createdAt;
  const now = new Date();
  const eventUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const birthUtc = Date.UTC(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth(),
    birthDate.getUTCDate()
  );
  const day = Math.max(1, Math.floor((eventUtc - birthUtc) / (24 * 60 * 60 * 1000)) + 1);

  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const eventDescription =
    description && description.trim().length > 0
      ? description.trim()
      : `Additional capital of $${formattedAmount} ${updatedTreasury.currency} injected into autonomous treasury pool.`;

  // 3. Create EconomicEvent in Life Log
  const event = await prisma.economicEvent.create({
    data: {
      agentId: agent.id,
      eventType: "TREASURY_FUNDED",
      title: "Treasury Funded",
      description: eventDescription,
      day,
      result: `+$${formattedAmount}`,
      txHash: txHash ? txHash.trim() : null,
      timestamp: now,
    },
  });

  // 4. Retrieve fresh treasury summary
  const summary = await getTreasurySummary(agent.agentId);

  return {
    success: true,
    message: `Successfully funded treasury with $${formattedAmount} ${updatedTreasury.currency}`,
    treasury: summary,
    event: {
      id: event.id,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      result: event.result,
      day: event.day,
      timestamp: event.timestamp,
      txHash: event.txHash,
    },
  };
}
