import { Navbar } from "@/components/layout/Navbar";
import { LifeLogSection } from "@/features/life";

export const metadata = {
  title: "Glyph Life Log — Economic Being #001",
  description: "A chronological record of Glyph's economic existence.",
};

export default function LifePage() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Centered Content Column */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <LifeLogSection />
      </div>
    </div>
  );
}
