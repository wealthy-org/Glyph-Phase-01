// ============================================================================
// GLYPH PHASE 01 — TRADE & DECISION SEED
// Seeds high-fidelity trade execution records, algorithmic decisions,
// research telemetry, memories, and economic events.
// ============================================================================

import {
  PrismaClient,
  DecisionAction,
  PolicyResult,
  PositionSide,
  TradeStatus,
  MemoryOutcome,
  ThesisResult,
  ConfidenceCalibration,
  EconomicEventType,
} from "../../src/generated/prisma/client";

interface TradeSeedDefinition {
  tradeNumber: string;
  asset: string;
  action: PositionSide;
  entryPrice: number;
  exitPrice: number | null;
  positionSize: number;
  leverage: number;
  conviction: number;
  fundamentalScore: number;
  technicalScore: number;
  riskScore: number;
  simulatedPnl: number | null;
  simulatedPnlPercent: number | null;
  fees: number;
  status: TradeStatus;
  decisionHash: string;
  transactionHash: string;
  createdAt: Date;
  closedAt: Date | null;
  thesis: {
    fundamental: string;
    technical: string;
    catalyst: string;
    risk: string;
    invalidation: string;
  };
  memory: {
    outcome: MemoryOutcome;
    thesisResult: ThesisResult;
    lesson: string;
    confidenceCalibration: ConfidenceCalibration;
    adaptation?: string;
    weightShift?: string;
  } | null;
  eventTitle: string;
  eventResult: string;
}

export async function seedTrades(prisma: PrismaClient, agentId: string) {
  console.log("  ↳ Seeding Trade & Decision Execution History...");

  // 1. Clear existing trades/decisions/positions to ensure clean deterministic state
  await prisma.position.deleteMany({ where: { agentId } });
  await prisma.memory.deleteMany({});
  await prisma.trade.deleteMany({ where: { agentId } });
  await prisma.decision.deleteMany({ where: { agentId } });
  await prisma.economicEvent.deleteMany({
    where: {
      agentId,
      eventType: {
        in: [
          EconomicEventType.DECISION_MADE,
          EconomicEventType.TRADE_OPENED,
          EconomicEventType.TRADE_CLOSED,
          EconomicEventType.PROFIT_RECORDED,
          EconomicEventType.LOSS_RECORDED,
          EconomicEventType.MEMORY_CREATED,
        ],
      },
    },
  });

  // Seed Trades definitions with whitelisted US Equities (AAPL, NVDA, MSFT)
  const tradesToSeed: TradeSeedDefinition[] = [
    {
      tradeNumber: "GLYPH-0001",
      asset: "AAPL",
      action: PositionSide.LONG,
      entryPrice: 224.5,
      exitPrice: 231.8,
      positionSize: 50.0,
      leverage: 1,
      conviction: 78,
      fundamentalScore: 76,
      technicalScore: 82,
      riskScore: 54,
      simulatedPnl: 1.63,
      simulatedPnlPercent: 3.25,
      fees: 0.05,
      status: TradeStatus.CLOSED,
      decisionHash: "0x3f7a18b9c45012a87d91e64b81023c90df1a5b82c19e48b17a02e64f8103c89b",
      transactionHash: "0x9d4a8e217c40b8a98150247f9b9326eb8f0365ee",
      createdAt: new Date("2026-09-15T14:30:00Z"),
      closedAt: new Date("2026-09-16T18:00:00Z"),
      thesis: {
        fundamental:
          "Apple demonstrates steady services revenue growth (+12% YoY) and strong enterprise buyback cash reserves. Operating margins expand on higher gross margin digital ecosystem subscriptions.",
        technical:
          "AAPL confirmed a bullish continuation breakout on the 4-hour chart, printing higher lows above the 20-day EMA with constructive RSI momentum around 58.",
        catalyst:
          "Institutional accumulation into product launch cycle and ecosystem AI developer suite expansion.",
        risk:
          "Broader market volatility and tech sector beta compression could temper near-term momentum.",
        invalidation:
          "Decisive close below the $218.00 horizontal support shelf invalidates structural trend thesis.",
      },
      memory: {
        outcome: MemoryOutcome.WIN,
        thesisResult: ThesisResult.CORRECT,
        lesson:
          "Disciplined breakout entry aligned with services monetization guidance produced low-stress profit target capture.",
        confidenceCalibration: ConfidenceCalibration.GOOD,
        adaptation: "Continue prioritizing high-conviction breakout setups on large-cap equity leaders.",
        weightShift: "Maintained momentum factor weight at 35%.",
      },
      eventTitle: "Closed LONG AAPL (+3.2%)",
      eventResult: "+$1.63",
    },
    {
      tradeNumber: "GLYPH-0002",
      asset: "NVDA",
      action: PositionSide.LONG,
      entryPrice: 172.4,
      exitPrice: 186.9,
      positionSize: 60.0,
      leverage: 2,
      conviction: 84,
      fundamentalScore: 88,
      technicalScore: 85,
      riskScore: 62,
      simulatedPnl: 10.09,
      simulatedPnlPercent: 8.41,
      fees: 0.12,
      status: TradeStatus.CLOSED,
      decisionHash: "0x8f3c7e492b10a8b98150247f9b9326eb8f0391acb471829e10283c74910283ea",
      transactionHash: "0x8f3c7e492b10a8b98150247f9b9326eb8f0391ac",
      createdAt: new Date("2026-09-16T15:00:00Z"),
      closedAt: new Date("2026-09-17T20:30:00Z"),
      thesis: {
        fundamental:
          "NVIDIA accelerates data center revenue trajectory with hyperscaler capex guidance upgrades across cloud providers. High net margins of 55%+ reinforce durable competitive moat.",
        technical:
          "Bull flag consolidation resolution with volume surging 1.45x above the 20-day moving average, creating a clean expansion channel.",
        catalyst:
          "Enterprise demand announcements and production shipment acceleration for next-gen compute architectures.",
        risk:
          "Supply chain bottleneck headlines and macro interest rate sensitivity could induce sharp pullbacks.",
        invalidation:
          "Breach below $164.00 key swing low invalidates immediate bullish expansion.",
      },
      memory: {
        outcome: MemoryOutcome.WIN,
        thesisResult: ThesisResult.CORRECT,
        lesson:
          "2x leverage captured hyperscaler demand wave cleanly while position size remained strictly inside conservative policy boundaries.",
        confidenceCalibration: ConfidenceCalibration.GOOD,
        adaptation: "Re-entry permissible on pullbacks towards 20-day moving average.",
        weightShift: "Elevated fundamental catalyst weighting by 5%.",
      },
      eventTitle: "Closed LONG NVDA (+8.4%)",
      eventResult: "+$10.09",
    },
    {
      tradeNumber: "GLYPH-0003",
      asset: "MSFT",
      action: PositionSide.LONG,
      entryPrice: 418.2,
      exitPrice: 425.8,
      positionSize: 50.0,
      leverage: 1,
      conviction: 72,
      fundamentalScore: 80,
      technicalScore: 74,
      riskScore: 50,
      simulatedPnl: 0.91,
      simulatedPnlPercent: 1.82,
      fees: 0.05,
      status: TradeStatus.CLOSED,
      decisionHash: "0x1f8c2b763e20a8b98150247f9b9326eb8f0388cc948192a019283719482910fa",
      transactionHash: "0x1f8c2b763e20a8b98150247f9b9326eb8f0388cc",
      createdAt: new Date("2026-09-17T14:00:00Z"),
      closedAt: new Date("2026-09-18T12:00:00Z"),
      thesis: {
        fundamental:
          "Microsoft Azure commercial cloud revenue demonstrates steady 29% YoY expansion. Enterprise AI copilot seat monetization adds predictable high-margin ARR.",
        technical:
          "Mean reversion rebound off the daily 50 EMA with bullish MACD histogram convergence and low volatility consolidation.",
        catalyst:
          "Quarterly enterprise software contract renewals and cloud infrastructure capacity milestone.",
        risk:
          "General enterprise IT spending moderation and multi-cloud competition.",
        invalidation:
          "Breakdown below the $410.00 critical horizontal support shelf.",
      },
      memory: {
        outcome: MemoryOutcome.WIN,
        thesisResult: ThesisResult.CORRECT,
        lesson:
          "Conservative 1x position on cloud resilience locked in steady positive equity accretion.",
        confidenceCalibration: ConfidenceCalibration.GOOD,
        adaptation: "Keep cloud fundamentals as foundational anchor in equity selection.",
        weightShift: "Balanced risk score calibration.",
      },
      eventTitle: "Closed LONG MSFT (+1.8%)",
      eventResult: "+$0.91",
    },
    {
      tradeNumber: "GLYPH-0004",
      asset: "AAPL",
      action: PositionSide.LONG,
      entryPrice: 228.5,
      exitPrice: null,
      positionSize: 60.18,
      leverage: 2,
      conviction: 76,
      fundamentalScore: 74,
      technicalScore: 80,
      riskScore: 61,
      simulatedPnl: null,
      simulatedPnlPercent: null,
      fees: 0.12,
      status: TradeStatus.OPEN,
      decisionHash: "0x1cfa2918b7b9697631c6337966733ebc15d5cdc16f711fc85114a30bdd34f9f4",
      transactionHash: "0x0cdc6f4b5e21b2bd353b80af2efc2ee56ca492f0f0ad9cab0132009d82eba2a3",
      createdAt: new Date("2026-09-18T15:05:00Z"),
      closedAt: null,
      thesis: {
        fundamental:
          "Apple demonstrates solid revenue growth of 6.1% YoY, a healthy profit margin of 26.4%, and an EPS of $6.57. Robust services monetization supports continued fundamental strength.",
        technical:
          "Bullish upward trend, trading above key moving averages with positive momentum. Support at $214.95 provides downside safety, while resistance at $238.88 is near-term target.",
        catalyst:
          "Upcoming earnings expectations and institutional accumulation signals driving AI services monetization.",
        risk:
          "Market volatility impacting tech stocks broadly and near-term resistance boundary.",
        invalidation:
          "Decisive break below $214.95 support level on elevated volume.",
      },
      memory: null,
      eventTitle: "Opened LONG AAPL (2x Simulated)",
      eventResult: "2x",
    },
  ];

  let realizedTotalPnl = 0;
  let activeOpenMargin = 0;

  for (const item of tradesToSeed) {
    // 1. Create Decision Record
    const decision = await prisma.decision.create({
      data: {
        agentId,
        asset: item.asset,
        action: item.action === PositionSide.LONG ? DecisionAction.LONG : DecisionAction.SHORT,
        conviction: item.conviction,
        fundamentalScore: item.fundamentalScore,
        technicalScore: item.technicalScore,
        riskScore: item.riskScore,
        positionSizePercent: 6,
        leverage: item.leverage,
        thesis: item.thesis,
        policyResult: PolicyResult.APPROVED,
        promptVersion: "GLYPH_DECISION_PROMPT_V1",
        decisionHash: item.decisionHash,
        transactionHash: item.transactionHash,
        createdAt: item.createdAt,
      },
    });

    // 2. Create Trade Record linked to Decision
    const trade = await prisma.trade.create({
      data: {
        tradeNumber: item.tradeNumber,
        agentId,
        asset: item.asset,
        action: item.action,
        entryPrice: item.entryPrice,
        exitPrice: item.exitPrice,
        positionSize: item.positionSize,
        leverage: item.leverage,
        conviction: item.conviction,
        fundamentalScore: item.fundamentalScore,
        technicalScore: item.technicalScore,
        riskScore: item.riskScore,
        thesis: item.thesis,
        simulatedPnl: item.simulatedPnl,
        simulatedPnlPercent: item.simulatedPnlPercent,
        fees: item.fees,
        status: item.status,
        decisionHash: item.decisionHash,
        transactionHash: item.transactionHash,
        createdAt: item.createdAt,
        closedAt: item.closedAt,
      },
    });

    // Link decision back to trade
    await prisma.decision.update({
      where: { id: decision.id },
      data: { tradeId: trade.id },
    });

    // 3. Create Memory if Trade was closed
    const mem = item.memory;
    if (mem && trade.status === TradeStatus.CLOSED) {
      const memoryDate = item.closedAt ?? item.createdAt;
      await prisma.memory.create({
        data: {
          agentId,
          tradeId: trade.id,
          outcome: mem.outcome,
          pnlPercent: item.simulatedPnlPercent,
          thesisResult: mem.thesisResult,
          lesson: mem.lesson,
          confidenceCalibration: mem.confidenceCalibration,
          adaptation: mem.adaptation,
          weightShift: mem.weightShift,
          createdAt: memoryDate,
        },
      });

      realizedTotalPnl += item.simulatedPnl || 0;
    }

    // 4. Create Active Position if Trade is OPEN
    if (item.status === TradeStatus.OPEN) {
      activeOpenMargin += item.positionSize;

      await prisma.position.create({
        data: {
          agentId,
          tradeId: trade.id,
          asset: trade.asset,
          side: trade.action,
          entryPrice: trade.entryPrice,
          currentPrice: trade.entryPrice,
          positionSize: trade.positionSize,
          leverage: trade.leverage,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          stopLoss: 214.95,
          targetPrice: 238.88,
          isOpen: true,
          openedAt: item.createdAt,
        },
      });
    }

    // 5. Create Economic Event for the Life Log
    await prisma.economicEvent.create({
      data: {
        agentId,
        eventType:
          item.status === TradeStatus.OPEN
            ? EconomicEventType.TRADE_OPENED
            : EconomicEventType.TRADE_CLOSED,
        title: item.eventTitle,
        description: item.thesis.fundamental,
        day: Math.max(1, Math.floor((item.createdAt.getTime() - new Date("2026-09-14").getTime()) / 86400000) + 1),
        result: item.eventResult,
        tradeId: trade.id,
        decisionId: decision.id,
        txHash: item.transactionHash,
        timestamp: item.closedAt || item.createdAt,
      },
    });

    console.log(`    ✅ Seeded ${trade.tradeNumber} [${trade.asset} ${trade.action}] — Status: ${trade.status}`);
  }

  // 6. Update Agent Treasury:
  // Initial capital = $1000.00
  // Cash balance = Initial ($1000) + Realized PnL ($12.63) - Open Margin ($60.18)
  const initialCapital = 1000;
  const cashBalance = initialCapital + realizedTotalPnl - activeOpenMargin;

  await prisma.agentTreasury.updateMany({
    where: { agentId },
    data: {
      initialCapital,
      currentBalance: Number(cashBalance.toFixed(4)),
    },
  });

  console.log(
    `    💰 Treasury updated: Cash $${cashBalance.toFixed(2)}, Margin: $${activeOpenMargin.toFixed(2)}, Total Realized PnL: +$${realizedTotalPnl.toFixed(2)}`
  );
  console.log("  ✅ Trade Seeding Completed Successfully.");
}
