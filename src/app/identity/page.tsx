import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
      identityData = {
        ...GLYPH_IDENTITY_DATA,
        beingNumber: `VERIFIED AGENT · ID #${agent.agentId}`,
        name: agent.name,
        status: agent.status,
        primaryWallet: agent.wallet?.walletAddress || GLYPH_IDENTITY_DATA.primaryWallet,
        registrationTx: regEvent?.txHash || GLYPH_IDENTITY_DATA.registrationTx,
        reputationMetrics: [
          {
            label: "DECISIONS",
            value: agent.reputationMetrics?.decisionsCount ?? 0,
          },
          {
            label: "VERIFIED EVENTS",
            value: 2,
            highlight: true,
          },
          {
            label: "WIN RATE",
            value: `${agent.reputationMetrics?.winRate ?? 0}%`,
          },
          {
            label: "TRADES",
            value: agent.reputationMetrics?.tradesCount ?? 0,
          },
        ],
      };
    }
  } catch (error) {
    console.error("Failed to load agent identity from DB:", error);
  }

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
        <IdentitySection data={identityData} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
