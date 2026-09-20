"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink } from "lucide-react";
import React, { useState } from "react";

interface OnchainProofSectionProps {
  txHash: string | null;
  network: string;
  explorerUrl: string | null;
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
    if (!txHash) return;

    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className={cn(
        "border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Onchain Cryptographic Proof"
    >
      {/* Section Header */}
      <div>
        <h2 className="font-mono text-xs sm:text-sm text-[#85858a] tracking-widest uppercase font-medium">
          ONCHAIN PROOF
        </h2>
      </div>

      <Separator className="bg-[#171717]" />

      {/* Proof Content: Left side hash, Right side network & action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Transaction Hash */}
        <div className="space-y-2 min-w-0 flex-1">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase block">
            TRANSACTION HASH
          </span>
          <div className="font-mono text-xs sm:text-sm text-[#85858a] break-all select-all hover:text-[#f3f3f4] transition-colors leading-relaxed">
            {txHash ?? "N/A"}
          </div>
        </div>

        {/* Right side: Network Tag & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-end gap-3.5 shrink-0">
          <Badge
            variant="outline"
            className="border-[#6fe39a]/40 bg-[#6fe39a]/10 text-[#6fe39a] rounded-none px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase font-normal w-fit"
          >
            {network}
          </Badge>

          {txHash && explorerUrl && (
            <div className="flex items-center gap-2.5">
              {/* Copy Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 rounded-[3px] border-[#262626] bg-[#000000] hover:bg-[#0c0c0c] hover:text-[#f3f3f4] text-[#85858a] font-sans text-xs font-normal normal-case tracking-normal transition-colors cursor-pointer"
                title="Copy transaction hash"
                aria-label={copied ? "Transaction hash copied" : "Copy transaction hash"}
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-[#6fe39a] mr-1.5" />
                    <span className="text-[#6fe39a]">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="mr-1.5 text-[#55555a]" />
                    <span>COPY</span>
                  </>
                )}
              </Button>

              {/* Verify External Link Button */}
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 px-3 border border-[#202020] bg-[#000000] hover:bg-[#0c0c0c] text-[#85858a] hover:text-[#f3f3f4] font-mono text-xs tracking-wider uppercase transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6fe39a]"
                title="Verify transaction on block explorer"
              >
                <span>VERIFY</span>
                <ExternalLink
                  size={12}
                  className="ml-1.5 text-[#55555a] group-hover:text-[#f3f3f4] transition-colors"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
