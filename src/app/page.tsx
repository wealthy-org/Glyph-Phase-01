import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { LiveState } from "@/components/sections/LiveState";
import { CurrentThesis } from "@/components/sections/CurrentThesis";
import { EconomicActivity } from "@/components/sections/EconomicActivity";
import { Reputation } from "@/components/sections/Reputation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#F5F5F5]">
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

      {/* Persistent Quiet Minimal Footer */}
      <Footer />
    </div>
  );
}
