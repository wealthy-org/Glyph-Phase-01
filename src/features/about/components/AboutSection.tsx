import React from "react";
import { GLYPH_ABOUT_DATA } from "../data";
import { AboutHeader } from "./AboutHeader";
import { SystemDefinition } from "./SystemDefinition";
import { ConceptualBlocks } from "./ConceptualBlocks";
import { DecisionLoopSection } from "./DecisionLoopSection";
import { SystemBoundaries } from "./SystemBoundaries";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const data = GLYPH_ABOUT_DATA;

  return (
    <div className={cn("w-full space-y-8 sm:space-y-10", className)}>
      {/* 1. Protocol Specification Hero */}
      <AboutHeader
        eyebrow={data.header.eyebrow}
        title={data.header.title}
        subtitle={data.header.subtitle}
        badge={data.header.badge}
        description={data.header.description}
        note={data.header.note}
      />

      {/* 2. System Definition Grid */}
      <SystemDefinition items={data.systemDefinition} />

      {/* 3. Core Concepts / System Architecture */}
      <ConceptualBlocks blocks={data.coreConcepts} />

      {/* 4. The Phase 01 Decision Loop (7-Step Semantic Pipeline) */}
      <DecisionLoopSection steps={data.decisionLoopSteps} />

      {/* 5. Phase 01 System Boundaries */}
      <SystemBoundaries boundaries={data.systemBoundaries} />

      {/* 6. Technical / Protocol Footnote */}
      <footer className="pt-6 pb-8 border-t border-[#1b1b1b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] text-[#55555a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
          <span>SPECIFICATION REVISION: 2026.09 // PHASE 01 TESTNET</span>
        </div>
        <div className="flex items-center gap-2">
          <span>ARCHITECTURE: AUTONOMOUS ECONOMIC PERSISTENCE</span>
          <span className="text-[#333333]">·</span>
          <span className="text-[#85858a]">ROBINHOOD TESTNET 46630</span>
        </div>
      </footer>
    </div>
  );
};
