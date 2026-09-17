import React from "react";
import { cn } from "@/lib/utils";

interface DecisionThesisProps {
  thesis: string;
  className?: string;
}

export const DecisionThesis: React.FC<DecisionThesisProps> = ({
  thesis,
  className,
}) => {
  return (
    <div
      className={cn(
        "border-l-2 border-[#8FB996]/60 pl-5 sm:pl-6 py-2 my-2 sm:my-4",
        className
      )}
    >
      <blockquote className="italic font-sans text-base sm:text-lg text-[#D4D4D4] font-light leading-relaxed tracking-normal">
        &ldquo;{thesis}&rdquo;
      </blockquote>
    </div>
  );
};
