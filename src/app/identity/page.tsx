import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { IdentitySection } from "@/features/identity";
import { GLYPH_IDENTITY_DATA } from "@/features/identity/data";
import { IdentityData } from "@/features/identity/types";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Dynamic server render for live registry

export const metadata: Metadata = {
  title: "Glyph Identity — ERC-8004 Public Registry",
  description:
    "Official public on-chain identity registry record for Glyph (Economic Being #001). Machine-verifiable ERC-8004 cryptographic identity on Robinhood Chain Testnet.",
};

export default async function IdentityPage() {
  let identityData: IdentityData = GLYPH_IDENTITY_DATA;

  try {
    const agent = await prisma.agent.findFirst({
      include: {
        wallet: true,
        economicEvents: {
          where: { eventType: "IDENTITY_REGISTERED" },
          take: 1,
        },
      },
    });

    if (agent) {
      const regEvent = agent.economicEvents[0];
      const paddedId = String(agent.agentId || "3").padStart(3, "0");
      const epochDisplay = agent.createdAt
        ? agent.createdAt.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : GLYPH_IDENTITY_DATA.genesis.epoch;

      identityData = {
        ...GLYPH_IDENTITY_DATA,
        beingNumber: "ECONOMIC BEING #001",
        agentId: agent.agentId,
        agentIdFormatted: `ID #${paddedId}`,
        name: agent.name || "GLYPH",
        status: agent.status || "ACTIVE",
        standard: {
          standard: "ERC-8004",
          subtext: "Trustless Agents Specification",
        },
        network: {
          name: agent.wallet?.network || GLYPH_IDENTITY_DATA.network.name,
          chainId: agent.wallet?.chainId || GLYPH_IDENTITY_DATA.network.chainId,
        },
        genesis: {
          epoch: epochDisplay,
          block: GLYPH_IDENTITY_DATA.genesis.block,
        },
        primaryWallet:
          agent.wallet?.walletAddress ||
          process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
          GLYPH_IDENTITY_DATA.primaryWallet,
        registrationTx:
          regEvent?.txHash ||
          process.env.NEXT_PUBLIC_IDENTITY_REGISTRATION_TX ||
          GLYPH_IDENTITY_DATA.registrationTx,
      };
    }
  } catch (error) {
    console.error("Failed to load agent identity from DB:", error);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Identity Registry Content Area */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <IdentitySection data={identityData} />
      </main>
    </div>
  );
}
