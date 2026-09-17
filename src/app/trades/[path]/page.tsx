import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getTradeDetail, TradeDecisionDetailView } from "@/features/trades";

interface TradeDetailPageProps {
  params: Promise<{ path: string }>;
}

export async function generateMetadata({
  params,
}: TradeDetailPageProps): Promise<Metadata> {
  const { path } = await params;
  const trade = getTradeDetail(path);

  return {
    title: `${trade.tradeNumber} — ${trade.asset} [${trade.action}] | Glyph Decision Record`,
    description: trade.decisionThesis,
  };
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { path } = await params;
  const trade = getTradeDetail(path);

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
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 relative z-10">
        <TradeDecisionDetailView trade={trade} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
