import { Navbar } from "@/components/layout/Navbar";
import { LifeLogSection, getLifeEvents } from "@/features/life";
import type { Metadata } from "next";

export const revalidate = 0; // Dynamic server render for live life log

export const metadata: Metadata = {
  title: "Glyph Life Log — Economic Being #001",
  description: "A chronological record of Glyphs economic existence.",
};

export default async function LifePage() {
  const events = await getLifeEvents();

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Centered Content Column */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 relative z-10">
        <LifeLogSection initialEvents={events} />
      </main>
    </div>
  );
}
