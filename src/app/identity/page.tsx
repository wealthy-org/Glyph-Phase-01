import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { IdentitySection } from "@/features/identity";
import { getIdentityDataForNetwork } from "@/features/identity/data";
import { IdentityData } from "@/features/identity/types";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Dynamic server render for live registry

export const metadata: Metadata = {
  title: "Glyph Identity — ERC-8004 Public Registry",
  description:
    "Official public on-chain identity registry record for Glyph (Economic Being #001). Machine-verifiable ERC-8004 cryptographic identity on Robinhood Chain.",
};

export default async function IdentityPage(props: {
  searchParams?: Promise<{ network?: string; chain?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const requestedChain = searchParams?.chain
    ? parseInt(searchParams.chain, 10)
    : searchParams?.network?.toLowerCase() === "mainnet"
    ? 4663
    : searchParams?.network?.toLowerCase() === "testnet"
    ? 46630
    : undefined;

  const baseData = getIdentityDataForNetwork(requestedChain);
  let identityData: IdentityData = baseData;

  try {
    const isMainnet = baseData.network.chainId === 4663;
    const resolvedAgentId = baseData.agentId;
    const paddedId = String(resolvedAgentId).padStart(3, "0");

    const agent = await prisma.agent.findFirst({
      where: isMainnet ? undefined : { agentId: "5" },
      include: {
        wallet: true,
        economicEvents: {
          where: { eventType: "IDENTITY_REGISTERED" },
          take: 1,
        },
      },
    });

    const regEvent = agent?.economicEvents?.[0];
    const epochDisplay = agent?.createdAt
      ? agent.createdAt.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : baseData.genesis.epoch;

    identityData = {
      ...baseData,
      beingNumber: "ECONOMIC BEING #001",
      agentId: resolvedAgentId,
      agentIdFormatted: `ID #${paddedId}`,
      name: agent?.name || "GLYPH",
      status: agent?.status || "ACTIVE",
      standard: baseData.standard,
      network: baseData.network,
      genesis: {
        epoch: epochDisplay,
        block: baseData.genesis.block,
      },
      primaryWallet:
        process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
        (isMainnet ? baseData.primaryWallet : (agent?.wallet?.walletAddress || baseData.primaryWallet)),
      owner: baseData.owner,
      agentWallet: baseData.agentWallet,
      agentURI: baseData.agentURI,
      registryAddress: baseData.registryAddress,
      onchainVerified: true,
      registrationTx: isMainnet
        ? (process.env.NEXT_PUBLIC_REGISTRATION_TX ||
           process.env.NEXT_PUBLIC_IDENTITY_REGISTRATION_TX ||
           baseData.registrationTx)
        : (regEvent?.txHash || baseData.registrationTx),
    };
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
