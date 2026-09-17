import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#F5F5F5]">
      <Navbar />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-12 py-20">
        <div className="border border-[#242424] bg-[#0D0D0D] p-8 sm:p-12 space-y-4">
          <div className="font-mono text-xs text-[#8FB996] tracking-widest uppercase">
            [ ROUTE: /about ]
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#F5F5F5]">
            ABOUT
          </h1>
          <p className="font-mono text-xs text-[#666666] tracking-wider uppercase">
            ECONOMIC ENTITY RESEARCH & MISSION CONSTITUTION
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
