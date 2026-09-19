// ============================================================================
// GLYPH PHASE 01 — TRADE & DECISION SEED
// Seeds high-fidelity trade execution records, algorithmic decisions,
// research telemetry, memories, and economic events.
// ============================================================================

import {
  ConfidenceCalibration,
  DecisionAction,
  EconomicEventType,
  MemoryOutcome,
  PolicyResult,
  PositionSide,
  PrismaClient,
  ThesisResult,
  TradeStatus,
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
  decisionHash: string | null;
  transactionHash: string | null;
  createdAt: Date;
  closedAt: Date | null;
  day: number;
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
          EconomicEventType.RESEARCH_STARTED,
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
  await prisma.researchSnapshot.deleteMany({});

  // Ensure genesis events have authoritative Day 1 timestamps
  await prisma.economicEvent.updateMany({
    where: { agentId, eventType: EconomicEventType.AGENT_BORN },
    data: { day: 1, timestamp: new Date("2026-09-14T06:00:00Z") },
  });
  await prisma.economicEvent.updateMany({
    where: { agentId, eventType: EconomicEventType.IDENTITY_REGISTERED },
    data: { day: 1, timestamp: new Date("2026-09-14T06:15:00Z") },
  });
  await prisma.economicEvent.updateMany({
    where: { agentId, eventType: EconomicEventType.WALLET_CREATED },
    data: { day: 1, timestamp: new Date("2026-09-14T06:30:00Z") },
  });
  await prisma.economicEvent.updateMany({
    where: { agentId, eventType: EconomicEventType.TREASURY_FUNDED },
    data: { day: 1, timestamp: new Date("2026-09-14T07:00:00Z") },
  });

  // Ensure agent birth date is Day 1
  await prisma.agent.updateMany({
    where: { id: agentId },
    data: { createdAt: new Date("2026-09-14T06:00:00Z") },
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
      decisionHash: null,
      transactionHash: null,
      createdAt: new Date("2026-09-15T10:00:00Z"),
      closedAt: new Date("2026-09-15T18:00:00Z"),
      day: 2,
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
      decisionHash: null,
      transactionHash: null,
      createdAt: new Date("2026-09-16T10:00:00Z"),
      closedAt: new Date("2026-09-16T20:30:00Z"),
      day: 3,
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
      exitPrice: 411.5,
      positionSize: 50.0,
      leverage: 1,
      conviction: 72,
      fundamentalScore: 80,
      technicalScore: 74,
      riskScore: 50,
      simulatedPnl: -0.8011,
      simulatedPnlPercent: -1.6021,
      fees: 0.05,
      status: TradeStatus.CLOSED,
      decisionHash: null,
      transactionHash: null,
      createdAt: new Date("2026-09-17T10:00:00Z"),
      closedAt: new Date("2026-09-17T18:00:00Z"),
      day: 4,
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
        outcome: MemoryOutcome.LOSS,
        thesisResult: ThesisResult.INCORRECT,
        lesson:
          "Cloud resilience remained intact, but the technical reclaim failed before the thesis could mature.",
        confidenceCalibration: ConfidenceCalibration.OVER_CONFIDENT,
        adaptation: "Require a confirmed reclaim before sizing mean-reversion entries.",
        weightShift: "Reduced short-horizon technical confidence by 3%.",
      },
      eventTitle: "Closed LONG MSFT (-1.6%)",
      eventResult: "-$0.80",
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
      decisionHash: null,
      transactionHash: null,
      createdAt: new Date("2026-09-18T15:05:00Z"),
      closedAt: null,
      day: 5,
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
  let realizedFees = 0;
  let activeOpenMargin = 0;
  let activeOpenFees = 0;

  for (const item of tradesToSeed) {
    await prisma.marketAsset.upsert({
      where: { symbol: item.asset },
      update: { name: item.asset, assetType: "EQUITY", isActive: true },
      create: { symbol: item.asset, name: item.asset, assetType: "EQUITY", isActive: true },
    });

    const researchSnapshot = await prisma.researchSnapshot.create({
      data: {
        asset: item.asset,
        marketData: {
          price: item.exitPrice ?? 234.1,
          currency: "USD-SIM",
          capturedAt: item.createdAt.toISOString(),
        },
        fundamentalData: { score: item.fundamentalScore, source: "GLYPH DEMO SNAPSHOT" },
        technicalData: { score: item.technicalScore, riskScore: item.riskScore },
        newsData: { sentiment: item.memory?.outcome === MemoryOutcome.LOSS ? "NEGATIVE" : "POSITIVE" },
        sourceMetadata: { provider: "GLYPH DEMO", simulated: true },
        createdAt: new Date(item.createdAt.getTime() - 45 * 60 * 1000),
      },
    });

    // 1. Create Decision Record
    const decision = await prisma.decision.create({
      data: {
        agentId,
        asset: item.asset,
        action: item.action === PositionSide.LONG ? DecisionAction.OPEN_LONG : DecisionAction.OPEN_SHORT,
        conviction: item.conviction,
        fundamentalScore: item.fundamentalScore,
        technicalScore: item.technicalScore,
        riskScore: item.riskScore,
        positionSizePercent: 6,
        leverage: item.leverage,
        thesis: item.thesis,
        policyResult: PolicyResult.APPROVED,
        researchSnapshotId: researchSnapshot.id,
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
        researchSnapshotId: researchSnapshot.id,
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

    const holdAt = new Date(item.createdAt.getTime() + 2 * 60 * 60 * 1000);
    await prisma.decision.create({
      data: {
        agentId,
        asset: item.asset,
        action: DecisionAction.HOLD,
        conviction: item.conviction,
        fundamentalScore: item.fundamentalScore,
        technicalScore: item.technicalScore,
        riskScore: item.riskScore,
        positionSizePercent: 0,
        leverage: item.leverage,
        thesis: {
          ...item.thesis,
          catalyst: `Holding ${item.asset} while the original thesis is monitored.`,
        },
        policyResult: PolicyResult.APPROVED,
        researchSnapshotId: researchSnapshot.id,
        promptVersion: "GLYPH_DECISION_PROMPT_V2_LIFECYCLE",
        createdAt: holdAt,
      },
    });

    if (item.status === TradeStatus.CLOSED) {
      await prisma.decision.create({
        data: {
          agentId,
          asset: item.asset,
          action: DecisionAction.CLOSE,
          conviction: item.conviction,
          fundamentalScore: item.fundamentalScore,
          technicalScore: item.technicalScore,
          riskScore: item.riskScore,
          positionSizePercent: 0,
          leverage: item.leverage,
          thesis: {
            ...item.thesis,
            catalyst: `Closed ${item.asset} after evaluating the current risk and reward.`,
          },
          policyResult: PolicyResult.APPROVED,
          researchSnapshotId: researchSnapshot.id,
          promptVersion: "GLYPH_DECISION_PROMPT_V2_LIFECYCLE",
          createdAt: item.closedAt ?? holdAt,
        },
      });
    }

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
      realizedFees += item.fees;
    }

    // 4. Create Active Position if Trade is OPEN
    if (item.status === TradeStatus.OPEN) {
      const currentPrice = 234.1;
      const notionalSize = item.positionSize * item.leverage;
      const unrealizedPnl = Number(
        (notionalSize * ((currentPrice - item.entryPrice) / item.entryPrice)).toFixed(4)
      );
      const unrealizedPnlPercent = Number(
        ((unrealizedPnl / item.positionSize) * 100).toFixed(4)
      );
      activeOpenMargin += item.positionSize;
      activeOpenFees += item.fees;

      await prisma.position.create({
        data: {
          agentId,
          tradeId: trade.id,
          asset: trade.asset,
          side: trade.action,
          entryPrice: trade.entryPrice,
          currentPrice,
          positionSize: trade.positionSize,
          leverage: trade.leverage,
          unrealizedPnl,
          unrealizedPnlPercent,
          stopLoss: 214.95,
          targetPrice: 238.88,
          isOpen: true,
          openedAt: item.createdAt,
        },
      });
    }

    // 5. Create Synchronized Economic Events for Life Log
    // 5a. Thesis Formulation Event (Life Log: THESIS category)
    const thesisTimestamp = new Date(item.createdAt.getTime() - 30 * 60 * 1000);
    await prisma.economicEvent.create({
      data: {
        agentId,
        eventType: EconomicEventType.RESEARCH_STARTED,
        title: `Thesis: Long ${item.asset}`,
        description: `${item.thesis.fundamental} Catalyst: ${item.thesis.catalyst}`,
        day: item.day,
        result: `SCORE ${item.fundamentalScore}`,
        decisionId: decision.id,
        timestamp: thesisTimestamp,
      },
    });

    // 5b. Decision Committed Event (Life Log: DECISION category)
    const decisionTimestamp = new Date(item.createdAt.getTime() - 10 * 60 * 1000);
    await prisma.economicEvent.create({
      data: {
        agentId,
        eventType: EconomicEventType.DECISION_MADE,
        title: `Decision Committed: Long ${item.asset} (${item.leverage}×)`,
        description: `Autonomous decision engine committed ${item.leverage}× simulated leverage long on ${item.asset} following algorithmic risk check. Conviction: ${item.conviction}%. Invalidation: ${item.thesis.invalidation}`,
        day: item.day,
        result: "APPROVED",
        decisionId: decision.id,
        txHash: null,
        timestamp: decisionTimestamp,
      },
    });

    // 5c. Trade Execution Events (Life Log: TRADE category)
    if (item.status === TradeStatus.OPEN) {
      await prisma.economicEvent.create({
        data: {
          agentId,
          eventType: EconomicEventType.TRADE_OPENED,
          title: `Opened LONG ${item.asset} (${item.leverage}× Simulated)`,
          description: `Active position entered with $${item.positionSize.toFixed(2)} simulated margin at entry price $${item.entryPrice.toFixed(2)}. Target: $238.88, Stop Loss: $214.95.`,
          day: item.day,
          result: `ACTIVE ${item.leverage}×`,
          tradeId: trade.id,
          decisionId: decision.id,
          txHash: null,
          timestamp: item.createdAt,
        },
      });
    } else {
      // For closed trades, record both the trade opening and trade closing events
      await prisma.economicEvent.create({
        data: {
          agentId,
          eventType: EconomicEventType.TRADE_OPENED,
          title: `Opened LONG ${item.asset} (${item.leverage}× Simulated)`,
          description: `Position initiated with $${item.positionSize.toFixed(2)} simulated margin at entry price $${item.entryPrice.toFixed(2)}.`,
          day: item.day,
          result: `${item.leverage}×`,
          tradeId: trade.id,
          decisionId: decision.id,
          txHash: null,
          timestamp: item.createdAt,
        },
      });

      await prisma.economicEvent.create({
        data: {
          agentId,
          eventType: EconomicEventType.TRADE_CLOSED,
          title: item.eventTitle,
          description: `Closed simulated ${item.asset} long position at target exit price ($${item.exitPrice?.toFixed(2)}). Realized return ${item.simulatedPnlPercent !== null ? (item.simulatedPnlPercent >= 0 ? "+" : "") + item.simulatedPnlPercent.toFixed(1) + "%" : ""}.`,
          day: item.day,
          result: item.eventResult,
          tradeId: trade.id,
          decisionId: decision.id,
          txHash: null,
          timestamp: item.closedAt!,
        },
      });

      await prisma.economicEvent.create({
        data: {
          agentId,
          eventType:
            (item.simulatedPnl ?? 0) >= 0
              ? EconomicEventType.PROFIT_RECORDED
              : EconomicEventType.LOSS_RECORDED,
          title: (item.simulatedPnl ?? 0) >= 0 ? "Profit Recorded" : "Loss Recorded",
          description: `Paper trade settlement recorded ${(item.simulatedPnl ?? 0) >= 0 ? "a gain" : "a loss"} of $${Math.abs(item.simulatedPnl ?? 0).toFixed(2)} before simulated fees.`,
          day: item.day,
          result: `${(item.simulatedPnl ?? 0) >= 0 ? "+" : "-"}$${Math.abs(item.simulatedPnl ?? 0).toFixed(2)}`,
          tradeId: trade.id,
          decisionId: decision.id,
          timestamp: new Date(item.closedAt!.getTime() + 60 * 1000),
        },
      });

      // 5d. Memory Recorded Event (Life Log: MEMORY category)
      if (item.memory) {
        const memoryTimestamp = new Date(item.closedAt!.getTime() + 5 * 60 * 1000);
        await prisma.economicEvent.create({
          data: {
            agentId,
            eventType: EconomicEventType.MEMORY_CREATED,
            title: `Memory Recorded: ${item.asset} Post-Trade Calibration`,
            description: `${item.memory.lesson}${item.memory.adaptation ? ` Adaptation: ${item.memory.adaptation}` : ""}`,
            day: item.day,
            result: `${item.memory.outcome} // ${item.memory.thesisResult}`,
            tradeId: trade.id,
            decisionId: decision.id,
            txHash: null,
            timestamp: memoryTimestamp,
          },
        });
      }
    }

    console.log(`    ✅ Seeded ${trade.tradeNumber} [${trade.asset} ${trade.action}] — Status: ${trade.status}`);
  }

  // 6. Update Agent Treasury:
  // Initial capital = $1000.00
  // Cash balance = Initial ($1000) + Realized PnL ($12.63) - Open Margin ($60.18)
  const initialCapital = 1000;
  const cashBalance =
    initialCapital + realizedTotalPnl - realizedFees - activeOpenMargin - activeOpenFees;

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
