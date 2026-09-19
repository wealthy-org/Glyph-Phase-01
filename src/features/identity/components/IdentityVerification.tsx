"use client";

import React, { useState } from "react";
import { IdentityData } from "../types";
import { ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityVerificationProps {
  data: IdentityData;
  className?: string;
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  data,
  className,
}) => {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(data.primaryWallet);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyTx = async () => {
    try {
      await navigator.clipboard.writeText(data.registrationTx);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } catch {
      // Fallback
    }
  };

  const verifyUrl = `${data.explorerBaseUrl}${data.registrationTx}`;

  return (
    <section className={cn("space-y-3", className)} aria-label="Public Verification">
      {/* Eyebrow & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#85858a] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>VERIFICATION // PUBLIC</span>
        </div>
        <span className="font-mono text-[10px] text-[#55555a] uppercase">
          TESTNET ANCHORS
        </span>
      </div>

      {/* Terminal Bordered Grid */}
      <div className="border border-[#1b1b1b] bg-[#050505] divide-y divide-[#1b1b1b]">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b]">
          {/* Identity Field */}
          <div className="p-4 space-y-1 bg-[#050505]">
            <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
              IDENTITY
            </span>
            <div className="font-mono text-sm text-[#f3f3f4]">
              {data.standard.standard}
            </div>
            <p className="font-mono text-[11px] text-[#55555a]">
              Trustless autonomous being interface
            </p>
          </div>

          {/* Network Field */}
          <div className="p-4 space-y-1 bg-[#050505]">
            <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
              NETWORK
            </span>
            <div className="font-mono text-sm text-[#f3f3f4]">
              {data.registrationNetwork}
            </div>
            <p className="font-mono text-[11px] text-[#55555a]">
              Chain ID: {data.network.chainId}
            </p>
          </div>
        </div>

        {/* Cryptographic Coordinates: Wallet & Tx */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b]">
          {/* Wallet */}
          <div className="p-4 space-y-2 bg-[#040404]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                WALLET
              </span>
              <button
                type="button"
                onClick={handleCopyWallet}
                className="font-mono text-[10px] text-[#85858a] hover:text-[#f3f3f4] inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedWallet ? (
                  <span className="text-[#6fe39a]">COPIED</span>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-[#d4d4d8] break-all select-all">
              {data.primaryWallet}
            </div>
          </div>

          {/* Registration TX */}
          <div className="p-4 space-y-2 bg-[#040404]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
                REGISTRATION TX
              </span>
              <button
                type="button"
                onClick={handleCopyTx}
                className="font-mono text-[10px] text-[#85858a] hover:text-[#f3f3f4] inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedTx ? (
                  <span className="text-[#6fe39a]">COPIED</span>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-[#d4d4d8] break-all select-all">
              {data.registrationTx}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="p-3.5 sm:p-4 bg-[#070707] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[#85858a]">
            Auditable on-chain record for Autonomous Agent Registry
          </span>

          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#6fe39a]/40 bg-[#6fe39a]/10 hover:bg-[#6fe39a]/20 text-[#6fe39a] font-mono text-xs tracking-wider uppercase transition-colors shrink-0 font-medium"
          >
            <span>VERIFY REGISTRATION →</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </section>
  );
};
