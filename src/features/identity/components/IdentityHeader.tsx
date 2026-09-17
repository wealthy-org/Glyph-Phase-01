import React from "react";
import { cn } from "@/lib/utils";

interface IdentityHeaderProps {
  className?: string;
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({ className }) => {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="font-mono text-xs text-[#8FB996] tracking-widest uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#8FB996]" />
        PUBLIC REGISTRY RECORD
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F5F5]">
        GLYPH IDENTITY
      </h1>
      <p className="text-base sm:text-lg text-[#A0A0A0] font-light max-w-2xl leading-relaxed">
        The public identity of Economic Being #001. A verifiable cryptographic entity anchored to decentralized state.
      </p>
    </header>
  );
};
