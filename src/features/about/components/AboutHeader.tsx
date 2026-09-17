import React from "react";
import { cn } from "@/lib/utils";

interface AboutHeaderProps {
  eyebrow: string;
  heading: string;
  statement: string;
  quote: string;
  className?: string;
}

export const AboutHeader: React.FC<AboutHeaderProps> = ({
  eyebrow,
  heading,
  statement,
  quote,
  className,
}) => {
  return (
    <header className={cn("space-y-6 sm:space-y-8", className)}>
      <div className="space-y-3">
        <div className="eyebrow">
          <span>{eyebrow}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.04em] text-[#f3f3f4]">
          {heading}
        </h1>
        <p className="text-sm sm:text-base text-[#85858a] font-light max-w-2xl leading-relaxed">
          {statement}
        </p>
      </div>

      {/* Editorial Documentation Quote */}
      <div className="border-l-2 border-[#6fe39a]/60 pl-5 sm:pl-6 py-2.5 max-w-3xl">
        <blockquote className="italic font-sans text-base sm:text-lg text-[#f3f3f4] font-light leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
    </header>
  );
};
