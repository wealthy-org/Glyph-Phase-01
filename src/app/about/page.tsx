import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { AboutSection } from "@/features/about";

export const metadata: Metadata = {
  title: "Glyph Specification — Protocol & System Architecture",
  description:
    "System specification and operational architecture for Glyph (Economic Being #001). Autonomous decision loops, deterministic risk bounds, and Phase 01 simulated capital.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Protocol Specification Content Area */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <AboutSection />
      </main>
    </div>
  );
}
