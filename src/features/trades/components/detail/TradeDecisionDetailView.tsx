"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { TradeDecisionDetail } from "../../types";
import { BackNavigation } from "./BackNavigation";
import { MemorySection } from "./MemorySection";
import { OnchainProofSection } from "./OnchainProofSection";
import { RiskSection } from "./RiskSection";
import { TradeHeader } from "./TradeHeader";
import { WhyITradedSection } from "./WhyITradedSection";

interface TradeDecisionDetailViewProps {
  trade: TradeDecisionDetail;
  className?: string;
}

export const TradeDecisionDetailView: React.FC<TradeDecisionDetailViewProps> = ({
  trade,
  className,
}) => {
  return (
    <article
      className={cn("w-full max-w-[1000px] mx-auto space-y-8 sm:space-y-10", className)}
      aria-label={`Trade Decision Record ${trade.tradeNumber}`}
    >
      {/* 1. Back Navigation */}
      <BackNavigation href="/trades" label="BACK TO ALL TRADES" />

      {/* 2, 3, 4. Header: Decision Record, Metrics, Decision Thesis */}
      <TradeHeader trade={trade} />

      {/* 5, 6. Rationale: Why I Traded (Fundamental, Technical, Catalyst) */}
      <WhyITradedSection
        fundamental={trade.fundamentalAnalysis}
        technical={trade.technicalAnalysis}
        catalyst={trade.catalyst}
      />

      {/* 7. Risk Analysis & Invalidation */}
      <RiskSection
        riskScore={trade.riskScore}
        invalidation={trade.invalidationLevel}
      />

      {/* 8. Persistent Memory & Historical Reflection (§15) */}
      {trade.memory && <MemorySection memory={trade.memory} />}

      {/* 9. Onchain Proof */}
      <OnchainProofSection
        txHash={trade.onchainProof.txHash}
        network={trade.onchainProof.network}
        explorerUrl={trade.onchainProof.explorerUrl}
      />

      {/* Observational Footnote */}
      <footer className="pt-6 pb-12 border-t border-[#181818] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#666666]">
        <span>DECISION AUDIT: VERIFIABLE AGENT MEMORY</span>
        <span>ATTESTATION STANDARD: GLYPH-DECISION-V1</span>
      </footer>
    </article>
  );
};
