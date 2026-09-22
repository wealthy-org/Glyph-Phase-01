"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IdentityData } from "../types";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityRecordCardProps {
  data: IdentityData;
  className?: string;
}

export const IdentityRecordCard: React.FC<IdentityRecordCardProps> = ({
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

  const formattedAgentId = data.agentIdFormatted || `#${String(data.agentId).padStart(3, "0")}`;

  return (
    <div
      className={cn(
        "border border-[#1b1b1b] bg-[#050505] shadow-2xl relative overflow-hidden",
        className
      )}
    >
      {/* 1. TOP STATUS STRIP */}
      <div className="p-3.5 sm:p-4 border-b border-[#1b1b1b] bg-[#070707] flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-[#85858a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse shrink-0" />
          <span className="text-[#f3f3f4] font-medium">VERIFIED AGENT</span>
          <span className="text-[#333333]">·</span>
          <span className="text-[#a1a1aa]">{formattedAgentId}</span>
          {data.onchainVerified && (
            <span className="ml-2 border border-[#6fe39a]/40 bg-[#6fe39a]/10 text-[#6fe39a] text-[10px] px-2 py-0.5 font-medium tracking-wider">
              ON-CHAIN VERIFIED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border border-[#222222] bg-[#0a0a0a] px-2.5 py-0.5 text-[11px] tracking-wider text-[#6fe39a] uppercase">
          <span className="w-1 h-1 rounded-full bg-[#6fe39a]" />
          <span>{data.status}</span>
        </div>
      </div>

      {/* 2. IDENTITY EMBLEM & NAME BLOCK */}
      <div className="p-5 sm:p-6 border-b border-[#1b1b1b] bg-[#050505] flex items-center gap-4 sm:gap-5">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-[2px] border border-[#222222] bg-[#0a0a0a] p-1.5 flex items-center justify-center overflow-hidden">
          <Image
            src="/glyph-logo.png"
            alt="Glyph Logo"
            width={52}
            height={52}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-[#f3f3f4] uppercase font-sans leading-none">
            {data.name}
          </h2>
          <div className="font-mono text-xs sm:text-sm text-[#85858a] tracking-wider uppercase">
            {data.beingNumber}
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED 6-CELL REGISTRY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b] bg-[#040404]">
        {/* Row 1 / Cell 1: IDENTITY STANDARD */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            IDENTITY STANDARD
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4]">
            {data.standard.standard}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            {data.standard.subtext}
          </p>
        </div>

        {/* Row 1 / Cell 2: NETWORK */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            NETWORK
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4]">
            {data.network.name}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            Public Execution Layer
          </p>
        </div>

        {/* Row 1 / Cell 3: REGISTRY STATUS */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            REGISTRY STATUS
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#6fe39a]">
            {data.status}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            Active Runtime State
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b] bg-[#040404]">
        {/* Row 2 / Cell 1: AGENT ID */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            AGENT ID
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4] tabular-nums">
            {formattedAgentId}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            ERC-8004 Registry Entry
          </p>
        </div>

        {/* Row 2 / Cell 2: GENESIS */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            GENESIS
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4]">
            {data.genesis.epoch}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            {data.genesis.block}
          </p>
        </div>

        {/* Row 2 / Cell 3: CHAIN ID */}
        <div className="p-4 sm:p-5 space-y-1">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            CHAIN ID
          </span>
          <div className="font-mono text-sm sm:text-base font-normal text-[#f3f3f4] tabular-nums">
            {data.network.chainId}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            EVM Network Specification
          </p>
        </div>
      </div>

      {/* 4. ON-CHAIN AGENT BINDING DETAILS (OWNER & WALLET) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b] bg-[#050505]">
        {/* OWNER */}
        <div className="p-4 sm:p-5 space-y-1.5">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            OWNER (IDENTITY HOLDER)
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#d4d4d8] break-all select-all">
            {data.owner || data.primaryWallet}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            MetaMask EOA controlling Agent Identity NFT
          </p>
        </div>

        {/* AGENT WALLET */}
        <div className="p-4 sm:p-5 space-y-1.5">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            AGENT WALLET (OPERATIONAL ADDRESS)
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#d4d4d8] break-all select-all">
            {data.agentWallet || data.primaryWallet}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            Bound via setAgentWallet() on Canonical Registry
          </p>
        </div>
      </div>

      {/* 5. REGISTRY CONTRACT & AGENT URI */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1b1b1b] border-b border-[#1b1b1b] bg-[#040404]">
        {/* REGISTRY CONTRACT */}
        <div className="p-4 sm:p-5 space-y-1.5">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            IDENTITY REGISTRY CONTRACT
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs sm:text-sm text-[#d4d4d8] break-all select-all">
              {data.registryAddress || (data.network.chainId === 4663 ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" : "0x66399E25D3FBb5De462d06dE835D07B2957060D2")}
            </span>
            <a
              href={`${data.explorerBaseUrl.replace(/\/tx\/$/, "/address/")}${data.registryAddress || (data.network.chainId === 4663 ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" : "0x66399E25D3FBb5De462d06dE835D07B2957060D2")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6fe39a] hover:text-[#88f5b0] shrink-0 p-1"
              title="View contract on explorer"
            >
              <ExternalLink size={12} />
            </a>
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            ERC-8004 Canonical Identity Registry
          </p>
        </div>

        {/* AGENT URI */}
        <div className="p-4 sm:p-5 space-y-1.5">
          <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
            AGENT URI
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#6fe39a] break-all">
            {data.agentURI || "/agents/glyph.json"}
          </div>
          <p className="font-mono text-[11px] text-[#55555a]">
            Decentralized Agent Registration Manifest
          </p>
        </div>
      </div>

      {/* 6. PRIMARY WALLET ROW */}
      <div className="p-4 sm:p-5 border-b border-[#1b1b1b] bg-[#050505] space-y-2">
        <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
          PRIMARY WALLET
        </span>
        <div className="flex items-center justify-between gap-3 bg-[#000000] border border-[#171717] px-3.5 py-2.5 group">
          <span className="font-mono text-xs sm:text-sm text-[#d4d4d8] break-all select-all font-mono">
            {data.primaryWallet}
          </span>

          <button
            type="button"
            onClick={handleCopyWallet}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#85858a] hover:text-[#f3f3f4] transition-colors shrink-0 cursor-pointer border border-[#222222] bg-[#080808] hover:bg-[#121212] px-2.5 py-1"
            title="Copy primary wallet address"
          >
            {copiedWallet ? (
              <>
                <Check size={12} className="text-[#6fe39a]" />
                <span className="text-[#6fe39a]">COPIED</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>COPY →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5. IDENTITY REGISTRATION TRANSACTION ROW */}
      <div className="p-4 sm:p-5 bg-[#070707] space-y-3">
        <span className="font-mono text-[10px] text-[#66666e] uppercase tracking-wider block">
          IDENTITY REGISTRATION TRANSACTION
        </span>

        <div className="bg-[#000000] border border-[#171717] px-3.5 py-2.5">
          <span className="font-mono text-xs sm:text-sm text-[#d4d4d8] break-all select-all block">
            {data.registrationTx}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#85858a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]/70" />
            <span>{data.registrationNetwork}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTx}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#85858a] hover:text-[#f3f3f4] transition-colors cursor-pointer border border-[#222222] bg-[#080808] hover:bg-[#121212] px-2.5 py-1"
              title="Copy transaction hash"
            >
              {copiedTx ? (
                <>
                  <Check size={12} className="text-[#6fe39a]" />
                  <span className="text-[#6fe39a]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>COPY</span>
                </>
              )}
            </button>

            <a
              href={`${data.explorerBaseUrl}${data.registrationTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6fe39a] hover:text-[#88f5b0] transition-colors border border-[#6fe39a]/30 bg-[#6fe39a]/10 hover:bg-[#6fe39a]/20 px-3 py-1 font-medium"
              title="Verify registration on Robinhood Chain explorer"
            >
              <span>VERIFY →</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
