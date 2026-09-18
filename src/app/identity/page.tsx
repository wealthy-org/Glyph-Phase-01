import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { IdentitySection } from "@/features/identity";
import { GLYPH_IDENTITY_DATA } from "@/features/identity/data";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Dynamic server render

export const metadata: Metadata = {
  title: "Glyph Identity — ERC-8004 Verified Agent #1",
  description:
    "The official public on-chain identity of Glyph (Agent #1). Verifiable ERC-8004 cryptographic identity on Robinhood Chain Testnet.",
};

export default async function IdentityPage() {
  let identityData = GLYPH_IDENTITY_DATA;

  try {
    const agent = await prisma.agent.findFirst({
      include: {
        wallet: true,
        reputationMetrics: true,
        economicEvents: {
          where: { eventType: "IDENTITY_REGISTERED" },
          take: 1,
        },
      },
    });

    if (agent) {
      const regEvent = agent.economicEvents[0];

      // Query real dynamic counts from database
      const [decisionsCount, verifiedEventsCount, tradesCount, closedTrades] = await Promise.all([
        prisma.decision.count({ where: { agentId: agent.id } }),
        prisma.economicEvent.count({ where: { agentId: agent.id } }),
        prisma.trade.count({ where: { agentId: agent.id } }),
        prisma.trade.findMany({
          where: { agentId: agent.id, status: "CLOSED" },
          select: { simulatedPnl: true },
        }),
      ]);

      const winningTrades = closedTrades.filter(
        (t) => t.simulatedPnl && Number(t.simulatedPnl) > 0
      ).length;

      const winRate =
        closedTrades.length > 0
          ? Math.round((winningTrades / closedTrades.length) * 100)
          : Number(agent.reputationMetrics?.winRate ?? 0);

      identityData = {
        ...GLYPH_IDENTITY_DATA,
        beingNumber: `VERIFIED AGENT · ID #${agent.agentId}`,
        name: agent.name,
        status: agent.status,
        primaryWallet:
          agent.wallet?.walletAddress ||
          process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
          GLYPH_IDENTITY_DATA.primaryWallet,
        registrationTx: regEvent?.txHash || GLYPH_IDENTITY_DATA.registrationTx,
        reputationMetrics: [
          {
            label: "DECISIONS",
            value: decisionsCount,
          },
          {
            label: "VERIFIED EVENTS",
            value: verifiedEventsCount,
            highlight: true,
          },
          {
            label: "WIN RATE",
            value: `${winRate}%`,
          },
          {
            label: "TRADES",
            value: tradesCount,
          },
        ],
      };
    }
  } catch (error) {
    console.error("Failed to load agent identity from DB:", error);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <IdentitySection data={identityData} />
      </main>
    </div>
  );
}
