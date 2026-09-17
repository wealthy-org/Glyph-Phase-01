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
        <div className="font-mono text-xs text-[#8FB996] tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#8FB996]" />
          {eyebrow}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F5F5]">
          {heading}
        </h1>
        <p className="text-base sm:text-lg text-[#A0A0A0] font-light max-w-2xl leading-relaxed">
          {statement}
        </p>
      </div>

      {/* Editorial Documentation Quote */}
      <div className="border-l-2 border-[#8FB996]/60 pl-5 sm:pl-6 py-2.5 max-w-3xl">
        <blockquote className="italic font-sans text-base sm:text-lg text-[#D4D4D4] font-light leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
    </header>
  );
};
