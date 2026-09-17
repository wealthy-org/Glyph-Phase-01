import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { TradeDecisionDetailView } from "@/features/trades";
import { fetchLiveTradeDetail } from "@/features/trades/queries";

interface TradeDetailPageProps {
  params: Promise<{ path: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TradeDetailPageProps): Promise<Metadata> {
  const { path } = await params;
  const trade = await fetchLiveTradeDetail(path);

  return {
    title: `${trade.tradeNumber} — ${trade.asset} [${trade.action}] | Glyph Decision Record`,
    description: trade.decisionThesis,
  };
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { path } = await params;
  const trade = await fetchLiveTradeDetail(path);

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 relative z-10">
        <TradeDecisionDetailView trade={trade} />
      </main>
    </div>
  );
}
