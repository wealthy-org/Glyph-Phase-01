import { Navbar } from "@/components/layout/Navbar";
import { EconomicActivity } from "@/features/landing/components/EconomicActivity";
import { Hero } from "@/features/landing/components/Hero";
import { Reputation } from "@/features/landing/components/Reputation";
import { getLandingPageData } from "@/features/landing/server";

export const revalidate = 0; // Dynamic server render for live observation terminal

export default async function Home() {
  const data = await getLandingPageData();

  const primaryPos = data.openPositions[0];
  const positionDisplay = primaryPos
    ? data.openPositions.length > 1
      ? `${primaryPos.asset} ${primaryPos.leverage}× (+${data.openPositions.length - 1})`
      : `${primaryPos.asset} · ${primaryPos.side} ${primaryPos.leverage}×`
    : "NONE";

  const initialMetrics = {
    pnlDollar: data.treasury.pnlDollar,
    pnlPercent: data.treasury.pnlPercent,
    treasuryCash: data.treasury.cashBalance,
    treasuryAllocatedMargin: data.treasury.allocatedMargin,
    treasuryEquity: data.treasury.totalEquity,
    currency: data.treasury.currency,
    positionDisplay,
    openPositionCount: data.openPositions.length,
    winRatePercent: data.reputation.winRate,
    winningTradesCount: data.reputation.winningTradesCount,
    losingTradesCount: Math.max(0, data.reputation.closedTradesCount - data.reputation.winningTradesCount),
    closedTradeCount: data.reputation.closedTradesCount,
    agentStatus: data.agent.status,
    agentId: data.agent.agentId,
    network: "ROBINHOOD TESTNET",
    cycleCount: data.cognitiveCycleCount,
  };

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4]">
      {/* Top Observation Navigation */}
      <Navbar initialMetrics={initialMetrics} />

      {/* Main Narrative & Observational Canvas */}
      <main className="flex-1 flex flex-col">
        {/* Section 1: Hero */}
        <Hero
          openPosition={data.openPositions[0] || null}
          latestDecision={data.latestDecision}
          latestAnalysis={data.latestAnalysis}
          latestActivity={data.latestActivity}
          cycleCount={data.cognitiveCycleCount}
          recentEvents={data.recentEvents}
        />

        {/* Section 2: Economic Activity */}
        <EconomicActivity
          recentEvents={data.recentEvents}
          latestMemory={data.latestMemory}
          adaptiveLearnings={data.adaptiveLearnings}
          agent={data.agent}
        />

        {/* Section 3: Reputation */}
        <Reputation reputation={data.reputation} />
      </main>
    </div>
  );
}
