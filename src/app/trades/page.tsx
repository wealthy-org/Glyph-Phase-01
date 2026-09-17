import { Navbar } from "@/components/layout/Navbar";
import { TradesSection } from "@/features/trades";

export const metadata = {
  title: "Glyph Trades — Public Execution Record",
  description:
    "Every simulated trade made by Glyph. All positions are logged, verified, and linked to explicit thesis formulations.",
};

export default function TradesPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Execution Canvas */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <TradesSection />
      </div>
    </div>
  );
}
