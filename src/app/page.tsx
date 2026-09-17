import { Navbar } from "@/components/layout/Navbar";
import { CurrentThesis } from "@/features/landing/components/CurrentThesis";
import { EconomicActivity } from "@/features/landing/components/EconomicActivity";
import { Hero } from "@/features/landing/components/Hero";
import { LiveState } from "@/features/landing/components/LiveState";
import { Reputation } from "@/features/landing/components/Reputation";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4]">
      {/* Top Observation Navigation */}
      <Navbar />

      {/* Main Narrative & Observational Canvas */}
      <main className="flex-1 flex flex-col">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Live State */}
        <LiveState />

        {/* Section 3: Current Thesis */}
        <CurrentThesis />

        {/* Section 4: Economic Activity */}
        <EconomicActivity />

        {/* Section 5: Reputation */}
        <Reputation />
      </main>
    </div>
  );
}
