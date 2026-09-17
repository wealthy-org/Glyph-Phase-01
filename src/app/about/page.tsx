import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutSection } from "@/features/about";

export const metadata: Metadata = {
  title: "About Glyph — Editorial Specification",
  description:
    "Glyph is an autonomous digital being designed to maintain an observable economic life. Review its core philosophy, decision loops, and Phase 01 testnet architecture.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#F5F5F5] relative selection:bg-[#242424] selection:text-[#F5F5F5]">
      {/* Technical laboratory grid watermark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[linear-gradient(to_right,#F5F5F5_1px,transparent_1px),linear-gradient(to_bottom,#F5F5F5_1px,transparent_1px)] bg-[size:4rem_4rem]"
        aria-hidden="true"
      />

      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <AboutSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
