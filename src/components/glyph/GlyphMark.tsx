import React from "react";
import { cn } from "@/lib/utils";

export interface GlyphMarkProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  animated?: boolean;
  pulseVariant?: "subtle" | "modern";
  className?: string;
}

const sizeMap = {
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-9 h-9",
  lg: "w-12 h-12",
  xl: "w-18 h-18",
  "2xl": "w-24 h-24 lg:w-28 lg:h-28",
};

export const GlyphMark: React.FC<GlyphMarkProps> = ({
  size = "md",
  animated = true,
  pulseVariant = "subtle",
  className,
}) => {
  const pulseClass = animated
    ? pulseVariant === "modern"
      ? "animate-modern-pulse"
      : "animate-entity-pulse"
    : "";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none aspect-square shrink-0",
        sizeMap[size],
        pulseClass,
        className
      )}
      aria-label="Glyph Entity Mark"
      role="img"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#F5F5F5] overflow-visible"
      >
        {/* Outer geometric bounding square / diamond alignment */}
        <rect
          x="32"
          y="6"
          width="36.77"
          height="36.77"
          transform="rotate(45 32 6)"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.4"
        />

        {/* Inner concentric observation frame */}
        <rect
          x="19"
          y="19"
          width="26"
          height="26"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeOpacity="0.85"
        />

        {/* Central entity core nucleus */}
        <rect
          x="28"
          y="28"
          width="8"
          height="8"
          fill="currentColor"
        />

        {/* Orthogonal precision reticle ticks */}
        <line x1="32" y1="2" x2="32" y2="10" stroke="currentColor" strokeWidth="1.25" />
        <line x1="32" y1="54" x2="32" y2="62" stroke="currentColor" strokeWidth="1.25" />
        <line x1="2" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="1.25" />
        <line x1="54" y1="32" x2="62" y2="32" stroke="currentColor" strokeWidth="1.25" />

        {/* Micro coordinate anchor points */}
        <circle cx="19" cy="19" r="1" fill="currentColor" fillOpacity="0.7" />
        <circle cx="45" cy="19" r="1" fill="currentColor" fillOpacity="0.7" />
        <circle cx="19" cy="45" r="1" fill="currentColor" fillOpacity="0.7" />
        <circle cx="45" cy="45" r="1" fill="currentColor" fillOpacity="0.7" />
      </svg>
    </div>
  );
};
