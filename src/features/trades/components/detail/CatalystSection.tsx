import React from "react";
import { cn } from "@/lib/utils";

interface CatalystSectionProps {
  catalyst: string;
  className?: string;
}

export const CatalystSection: React.FC<CatalystSectionProps> = ({
  catalyst,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <span className="font-mono text-xs text-[#666666] tracking-widest uppercase block">
        CATALYST
      </span>
      <p className="font-sans text-sm sm:text-base text-[#D4D4D4] font-normal leading-relaxed">
        {catalyst}
      </p>
    </div>
  );
};
