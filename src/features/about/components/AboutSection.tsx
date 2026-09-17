import React from "react";
import { GLYPH_ABOUT_DATA } from "../data";
import { AboutHeader } from "./AboutHeader";
import { ConceptualBlocks } from "./ConceptualBlocks";
import { DecisionLoopSection } from "./DecisionLoopSection";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const data = GLYPH_ABOUT_DATA;

  return (
    <div className={cn("w-full space-y-16 sm:space-y-20", className)}>
      {/* 1. Editorial Header & Highlighted Quote */}
      <AboutHeader
        eyebrow={data.eyebrow}
        heading={data.heading}
        statement={data.statement}
        quote={data.quote}
      />

      <Separator className="bg-[#171717]" />

      {/* 2. Conceptual Philosophy & Reasoning Blocks */}
      <ConceptualBlocks blocks={data.conceptualBlocks} />

      <Separator className="bg-[#171717]" />

      {/* 3. The Phase 01 Decision Loop Process Flow */}
      <DecisionLoopSection
        eyebrow={data.decisionLoopEyebrow}
        heading={data.decisionLoopHeading}
        description={data.decisionLoopDescription}
        steps={data.decisionLoopSteps}
      />

      {/* Observational Technical Footnote */}
      <footer className="pt-8 pb-12 border-t border-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#55555a]">
        <span>SPECIFICATION REVISION: 2026.09 // PHASE 01 TESTNET</span>
        <span>ARCHITECTURE: AUTONOMOUS ECONOMIC PERSISTENCE</span>
      </footer>
    </div>
  );
};
