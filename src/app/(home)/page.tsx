import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/features/landing/components/Hero";
import { LiveState } from "@/features/landing/components/LiveState";
import { CurrentThesis } from "@/features/landing/components/CurrentThesis";
import { EconomicActivity } from "@/features/landing/components/EconomicActivity";
import { Reputation } from "@/features/landing/components/Reputation";
import { getLandingPageData } from "@/features/landing/server";

export const revalidate = 0; // Dynamic server render for live observation terminal

export default async function Home() {
  const data = await getLandingPageData("1");

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4]">
      {/* Top Observation Navigation */}
      <Navbar />

      {/* Main Narrative & Observational Canvas */}
      <main className="flex-1 flex flex-col">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Live State */}
        <LiveState
          treasury={data.treasury}
          openPositions={data.openPositions}
          latestDecision={data.latestDecision}
          agent={data.agent}
          cognitiveCycleCount={data.cognitiveCycleCount}
        />

        {/* Section 3: Current Thesis */}
        <CurrentThesis latestDecision={data.latestDecision} />

        {/* Section 4: Economic Activity */}
        <EconomicActivity
          recentEvents={data.recentEvents}
          latestMemory={data.latestMemory}
          adaptiveLearnings={data.adaptiveLearnings}
          agent={data.agent}
        />

        {/* Section 5: Reputation */}
        <Reputation reputation={data.reputation} />
      </main>
    </div>
  );
}
