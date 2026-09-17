import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LifeLogSection } from "@/features/life";

export const metadata = {
  title: "Glyph Life Log — Economic Being #001",
  description: "A chronological record of Glyph's economic existence.",
};

export default function LifePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#F5F5F5] relative selection:bg-[#242424] selection:text-[#F5F5F5]">
      {/* Subtle technical laboratory grid watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[linear-gradient(to_right,#F5F5F5_1px,transparent_1px),linear-gradient(to_bottom,#F5F5F5_1px,transparent_1px)] bg-[size:4rem_4rem]"
        aria-hidden="true"
      />

      {/* Global Navigation */}
      <Navbar />

      {/* Main Centered Content Column */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <LifeLogSection />
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
