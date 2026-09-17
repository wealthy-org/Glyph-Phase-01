import React from "react";
import { GLYPH_IDENTITY_DATA } from "../data";
import { IdentityHeader } from "./IdentityHeader";
import { IdentityRecordCard } from "./IdentityRecordCard";
import { IdentityReputation } from "./IdentityReputation";
import { RegistryArchitecture } from "./RegistryArchitecture";
import { cn } from "@/lib/utils";

interface IdentitySectionProps {
  className?: string;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ className }) => {
  const data = GLYPH_IDENTITY_DATA;

  return (
    <div className={cn("w-full space-y-12 sm:space-y-16", className)}>
      {/* 1. Page Header */}
      <IdentityHeader />

      {/* 2, 3, 4. Identity Record Card with Standards, Wallet, and Registration Tx */}
      <IdentityRecordCard data={data} />

      {/* 5. Reputation Section */}
      <IdentityReputation metrics={data.reputationMetrics} />

      {/* 6. Registry Architecture Section */}
      <RegistryArchitecture cards={data.architectureCards} />

      {/* Observational Technical Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#181818] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#666666]">
        <span>REGISTRY SPECIFICATION: ERC-8004 // PHASE 01</span>
        <span>ATTESTATION PROOF: CRYPTOGRAPHICALLY PINNED</span>
      </footer>
    </div>
  );
};
