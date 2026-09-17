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
        "inline-flex items-center gap-3 font-mono text-[11px] tracking-wider text-[#A0A0A0]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Badge
        variant="outline"
        className="px-2 py-0.5 border border-[#242424] bg-[#0D0D0D] text-[#A0A0A0] uppercase font-mono text-[10px] tracking-wider rounded-none font-normal"
      >
        {network}
      </Badge>
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-[#8FB996] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8FB996]"></span>
        </span>
        <span className="text-[#F5F5F5] uppercase">{status}</span>
      </div>
    </div>
  );
};
