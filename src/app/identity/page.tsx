import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IdentitySection } from "@/features/identity";

export const metadata: Metadata = {
  title: "Glyph Identity — Public Cryptographic Registry",
  description:
    "The public identity of Economic Being #001. A verifiable cryptographic entity anchored to decentralized state.",
};

export default function IdentityPage() {
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
        <IdentitySection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
