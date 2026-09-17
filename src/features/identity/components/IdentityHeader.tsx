import React from "react";
import { cn } from "@/lib/utils";

interface IdentityHeaderProps {
  className?: string;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({ className }) => {
  return (
    <header className={cn("space-y-4 pb-4 border-b border-[#171717]", className)}>
      <div className="eyebrow">
        <span>PUBLIC REGISTRY RECORD</span>
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.04em] text-[#f3f3f4]">
        GLYPH IDENTITY
      </h1>
      <p className="text-sm sm:text-base text-[#85858a] font-light max-w-2xl leading-relaxed">
        The public identity of Economic Being #001. A verifiable cryptographic entity anchored to decentralized state.
      </p>
    </header>
  );
};
