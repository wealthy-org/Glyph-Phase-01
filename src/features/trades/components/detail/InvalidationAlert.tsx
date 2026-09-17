import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvalidationAlertProps {
  invalidation: string;
  className?: string;
}

export const InvalidationAlert: React.FC<InvalidationAlertProps> = ({
  invalidation,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "border border-[#382E1E] bg-[#12100A] p-4 sm:p-5 flex items-start gap-3.5",
        className
      )}
    >
      <AlertTriangle
        size={16}
        className="text-[#B8A77A] shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <span className="font-mono text-xs text-[#B8A77A] uppercase tracking-wider block font-medium">
          INVALIDATION:
        </span>
        <p className="text-xs sm:text-sm text-[#D4D4D4] leading-relaxed">
          {invalidation}
        </p>
      </div>
    </div>
  );
};
