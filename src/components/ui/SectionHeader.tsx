import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  index?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  index,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("border-b border-[#242424] pb-4 mb-8 sm:mb-12", className)}>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-3">
          {index && (
            <span className="font-mono text-xs text-[#666666] tracking-wider">
              {index}
            </span>
          )}
          <h2 className="text-sm sm:text-base font-medium tracking-widest text-[#F5F5F5] uppercase">
            {title}
          </h2>
        </div>
        {description && (
          <p className="font-mono text-xs text-[#666666] tracking-tight">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
