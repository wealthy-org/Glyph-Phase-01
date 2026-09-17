"use client";

import React, { useState } from "react";
import { IdentityData } from "../types";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  return (
    <div
      className={cn(
        "border border-[#242424] bg-[#0D0D0D] p-6 sm:p-8 md:p-10 space-y-8",
        className
      )}
    >
      {/* 1. Identity Header: Mark, Being #001, GLYPH, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <GlyphMark size="lg" animated={true} />
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#8FB996] tracking-widest uppercase font-medium block">
              {data.beingNumber}
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5F5F5]">
              {data.name}
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:items-end space-y-1.5">
          <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-widest uppercase">
            REGISTRY STATUS
          </span>
          <Badge
            variant="outline"
            className="border-[#8FB996]/40 bg-[#8FB996]/5 text-[#8FB996] rounded-none px-2.5 py-1 font-mono text-xs tracking-wider uppercase font-normal inline-flex items-center gap-1.5 w-fit"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FB996] animate-beacon-pulse" />
            {data.status}
          </Badge>
        </div>
      </div>

      <Separator className="bg-[#242424]" />

      {/* 2. Structured Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Standard */}
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
            IDENTITY STANDARD
          </span>
          <div className="font-mono text-base sm:text-lg font-medium text-[#F5F5F5]">
            {data.standard.standard}
          </div>
          <p className="font-mono text-xs text-[#666666]">
            {data.standard.subtext}
          </p>
        </div>

        {/* Network */}
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
            NETWORK
          </span>
          <div className="font-mono text-base sm:text-lg font-medium text-[#F5F5F5]">
            {data.network.name}
          </div>
          <p className="font-mono text-xs text-[#666666]">
            Chain ID: {data.network.chainId}
          </p>
        </div>

        {/* Genesis */}
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
            GENESIS EPOCH
          </span>
          <div className="font-mono text-base sm:text-lg font-medium text-[#F5F5F5]">
            {data.genesis.epoch}
          </div>
          <p className="font-mono text-xs text-[#666666]">
            {data.genesis.block}
          </p>
        </div>
      </div>

      {/* 3. Primary Wallet Block */}
      <div className="space-y-2 pt-2">
        <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
          PRIMARY WALLET ADDRESS
        </span>
        <div className="border border-[#181818] bg-[#080808] p-3 sm:p-4 flex items-center justify-between gap-3 group">
          <span className="font-mono text-xs sm:text-sm text-[#A0A0A0] break-all select-all group-hover:text-[#F5F5F5] transition-colors">
            {data.primaryWallet}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyWallet}
            className="h-7 px-2 text-[#666666] hover:text-[#F5F5F5] hover:bg-[#141414] rounded-none shrink-0 font-mono text-xs cursor-pointer"
            title="Copy wallet address"
            aria-label={copiedWallet ? "Wallet address copied" : "Copy wallet address"}
          >
            {copiedWallet ? (
              <span className="inline-flex items-center gap-1 text-[#8FB996]">
                <Check size={13} />
                <span className="text-[10px] hidden sm:inline">COPIED</span>
              </span>
            ) : (
              <Copy size={13} />
            )}
          </Button>
        </div>
      </div>

      {/* 4. Registration Transaction Block */}
      <div className="border border-[#181818] bg-[#080808] p-4 sm:p-5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="font-mono text-[10px] sm:text-xs text-[#666666] tracking-widest uppercase block">
            IDENTITY REGISTRATION TRANSACTION
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#A0A0A0] break-all select-all hover:text-[#F5F5F5] transition-colors">
            {data.registrationTx}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 sm:pt-0">
          <Badge
            variant="outline"
            className="border-[#8FB996]/40 bg-[#8FB996]/5 text-[#8FB996] rounded-none px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase font-normal"
          >
            {data.registrationNetwork}
          </Badge>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyTx}
            className="h-8 px-2.5 text-[#666666] hover:text-[#F5F5F5] hover:bg-[#141414] rounded-none font-mono text-xs cursor-pointer"
            title="Copy registration transaction hash"
            aria-label={copiedTx ? "Transaction hash copied" : "Copy transaction hash"}
          >
            {copiedTx ? (
              <span className="inline-flex items-center gap-1 text-[#8FB996]">
                <Check size={13} />
                <span className="text-[10px]">COPIED</span>
              </span>
            ) : (
              <Copy size={13} />
            )}
          </Button>

          <a
            href={`${data.explorerBaseUrl}${data.registrationTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-8 px-3 border border-[#242424] bg-[#0D0D0D] hover:bg-[#141414] text-[#A0A0A0] hover:text-[#F5F5F5] font-mono text-xs tracking-wider uppercase transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8FB996]"
            title="Verify registration transaction on explorer"
          >
            <span>VERIFY</span>
            <ExternalLink
              size={12}
              className="ml-1.5 text-[#666666] group-hover:text-[#F5F5F5] transition-colors"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
