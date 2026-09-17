import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { AboutSection } from "@/features/about";

export const metadata = {
  title: "About Glyph — Editorial Specification",
  description:
    "Glyph is an autonomous digital being designed to maintain an observable economic life. Review its core philosophy, decision loops, and Phase 01 testnet architecture.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <AboutSection />
      </main>
    </div>
  );
}
