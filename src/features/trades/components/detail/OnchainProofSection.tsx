"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnchainProofSectionProps {
  txHash: string;
  network: string;
  explorerUrl: string;
  className?: string;
}

export const OnchainProofSection: React.FC<OnchainProofSectionProps> = ({
  txHash,
  network,
  explorerUrl,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section
      className={cn(
        "border border-[#242424] bg-[#0D0D0D] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Onchain Cryptographic Proof"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-mono text-xs sm:text-sm text-[#A0A0A0] tracking-widest uppercase font-medium">
          ONCHAIN PROOF
        </h2>
      </div>

      <Separator className="bg-[#242424]" />

      {/* Proof Content: Left side hash, Right side network & action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Transaction Hash */}
        <div className="space-y-2 min-w-0 flex-1">
          <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
            TRANSACTION HASH
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#A0A0A0] break-all select-all hover:text-[#F5F5F5] transition-colors leading-relaxed">
            {txHash}
          </div>
        </div>

        {/* Right side: Network Tag & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-end gap-3.5 shrink-0">
          <Badge
            variant="outline"
            className="border-[#8FB996]/40 bg-[#8FB996]/5 text-[#8FB996] rounded-none px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase font-normal w-fit"
          >
            {network}
          </Badge>

          <div className="flex items-center gap-2.5">
            {/* Copy Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 rounded-none border-[#242424] bg-[#080808] hover:bg-[#141414] hover:text-[#F5F5F5] text-[#A0A0A0] font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer"
              title="Copy transaction hash"
              aria-label={copied ? "Transaction hash copied" : "Copy transaction hash"}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-[#8FB996] mr-1.5" />
                  <span className="text-[#8FB996]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="mr-1.5 text-[#666666]" />
                  <span>COPY</span>
                </>
              )}
            </Button>

            {/* Verify External Link Button */}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 px-3 border border-[#242424] bg-[#080808] hover:bg-[#141414] text-[#A0A0A0] hover:text-[#F5F5F5] font-mono text-xs tracking-wider uppercase transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8FB996]"
              title="Verify transaction on block explorer"
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
    </section>
  );
};
