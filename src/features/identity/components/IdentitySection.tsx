import React from "react";
import { IdentityData } from "../types";
import { GLYPH_IDENTITY_DATA } from "../data";
import { IdentityHeader } from "./IdentityHeader";
import { IdentityRecordCard } from "./IdentityRecordCard";
import { IdentityVerification } from "./IdentityVerification";
import { RegistryArchitecture } from "./RegistryArchitecture";
import { cn } from "@/lib/utils";

interface IdentitySectionProps {
  data?: IdentityData;
  className?: string;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  data = GLYPH_IDENTITY_DATA,
  className,
}) => {
  return (
    <div className={cn("w-full space-y-6 sm:space-y-8", className)}>
      {/* 1. Header Identity */}
      <IdentityHeader
        agentIdFormatted={data.agentIdFormatted}
        status={data.status}
      />

      {/* 2. Main Identity Record Terminal */}
      <IdentityRecordCard data={data} />

      {/* 3. Public Verification Section */}
      <IdentityVerification data={data} />

      {/* 4. Registry Architecture 4-Column Terminal Table */}
      <RegistryArchitecture items={data.architectureItems} />

      {/* 5. Terminal Footer Information */}
      <footer className="pt-6 pb-8 border-t border-[#1b1b1b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-[#55555a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>REGISTRY SPECIFICATION: ERC-8004 // PHASE 01</span>
        </div>
        <div className="flex items-center gap-2">
          <span>ATTESTATION: TESTNET / PUBLIC RECORD</span>
          <span className="text-[#333333]">·</span>
          <span className="text-[#85858a]">CHAIN 46630</span>
        </div>
      </footer>
    </div>
  );
};
