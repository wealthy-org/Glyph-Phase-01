import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusIndicatorProps {
  network?: string;
  status?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  network = "TESTNET",
  status = "ONLINE",
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] tracking-wider text-[#85858a]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="px-2 py-0.5 border border-[#1a1a1a] bg-[#050505] text-[#85858a] uppercase font-mono text-[10px] tracking-wider rounded-none font-normal">
        {network}
      </span>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse" />
        <span className="text-[#f3f3f4] uppercase tracking-wider text-[11px]">{status}</span>
      </div>
    </div>
  );
};
