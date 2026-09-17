import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
    <div className={cn("mb-8 sm:mb-12", className)}>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4">
        <div className="flex items-center gap-3">
          {index && (
            <span className="eyebrow">
              {index}
            </span>
          )}
          <h2 className="text-sm sm:text-base font-normal tracking-widest text-[#f3f3f4] uppercase font-mono">
            {title}
          </h2>
        </div>
        {description && (
          <p className="font-mono text-[11px] text-[#76767a] tracking-wider uppercase">
            {description}
          </p>
        )}
      </div>
      <Separator className="bg-[#171717]" />
    </div>
  );
};
