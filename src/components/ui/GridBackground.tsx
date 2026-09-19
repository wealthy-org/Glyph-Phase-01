import React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  gridSize?: number;
  glowColor?: "emerald" | "neutral" | "none";
  intensity?: "subtle" | "medium" | "prominent";
  lineOpacity?: number;
}

const GridBackgroundComponent: React.FC<GridBackgroundProps> = ({
  className,
  gridSize = 36,
  glowColor = "neutral",
  intensity = "medium",
  lineOpacity: customOpacity,
}) => {
  // Line opacities calibrated to be soft, understated and faded ("tidak terlihat jelas tetapi masih ada")
  const defaultOpacity =
    intensity === "prominent" ? 0.09 : intensity === "medium" ? 0.065 : 0.045;

  const opacity = customOpacity !== undefined ? customOpacity : defaultOpacity;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden select-none transform-gpu",
        className
      )}
      style={{ contain: "strict" }}
      aria-hidden="true"
    >
      {/* Precision modern technical grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, ${opacity}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, ${opacity}) 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Atmospheric ambient focal glow */}
      {glowColor === "emerald" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(111, 227, 154, 0.04), transparent 75%)",
          }}
        />
      )}
      {glowColor === "neutral" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(255, 255, 255, 0.02), transparent 75%)",
          }}
        />
      )}

      {/* Smooth vignette fade to deep black (#000000) around section edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 40%, #000000 95%)",
        }}
      />
    </div>
  );
};

export const GridBackground = React.memo(GridBackgroundComponent);
