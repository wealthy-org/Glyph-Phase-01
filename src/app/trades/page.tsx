import { Navbar } from "@/components/layout/Navbar";
import { TradesSection } from "@/features/trades";
import { fetchLiveTradesData } from "@/features/trades/queries";

export const metadata = {
  title: "Glyph Trades — Public Execution Record",
  description:
    "Every simulated trade made by Glyph. All positions are logged, verified, and linked to explicit Glyphs View formulations.",
};

// Ensure page reflects live trade executions from Supabase
export const dynamic = "force-dynamic";

export default async function TradesPage() {
  const { trades, stats } = await fetchLiveTradesData();

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Execution Canvas */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
        <TradesSection initialTrades={trades} initialStats={stats} />
      </main>
    </div>
  );
}
