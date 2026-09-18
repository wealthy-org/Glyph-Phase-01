"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  // Mouse-reactive dot wave canvas (#heroWave) with ripple wave and alpha glow
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spacing = 22;
    let dots: { x: number; y: number }[] = [];
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false, intensity: 0 };
    let t = 0;
    let animId: number;
    let lastMoveTime = 0;

    const updateSize = () => {
      const rect = hero.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dots = [];
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * spacing, y: r * spacing });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
      mouse.intensity = Math.min(mouse.intensity + 0.15, 1);
      lastMoveTime = Date.now();
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const draw = () => {
      const rect = hero.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Smooth cursor interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.2;
        mouse.y += (mouse.targetY - mouse.y) * 0.2;
        // Fade intensity gently if mouse stays still
        if (Date.now() - lastMoveTime > 1500) {
          mouse.intensity = Math.max(mouse.intensity - 0.015, 0.2);
        } else {
          mouse.intensity = Math.min(mouse.intensity + 0.05, 1);
        }
      } else {
        mouse.intensity = Math.max(mouse.intensity - 0.02, 0);
      }

      // 1. Soft alpha glow spotlight expanding from cursor
      if (mouse.intensity > 0.01 && mouse.x > -500 && mouse.y > -500) {
        const glowRadius = 320;
        const radialGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius
        );
        radialGrad.addColorStop(0, `rgba(255, 255, 255, ${0.08 * mouse.intensity})`);
        radialGrad.addColorStop(0.3, `rgba(111, 227, 154, ${0.03 * mouse.intensity})`);
        radialGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = radialGrad;
        ctx.fillRect(
          Math.max(0, mouse.x - glowRadius),
          Math.max(0, mouse.y - glowRadius),
          glowRadius * 2,
          glowRadius * 2
        );
      }

      // 2. Monochrome dot grid with ripple wave displacement and alpha glow
      const waveRadius = 300;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let offset = 0;
        let alpha = 0.045; // baseline calm monochrome dot
        let size = 0.95;

        if (mouse.intensity > 0.01) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < waveRadius) {
            // Normalized falloff [0, 1]
            const falloff = 1 - dist / waveRadius;
            // Harmonic ripple wave radiating outward from cursor
            const ripple = Math.sin(dist * 0.048 - t * 0.075) * falloff * mouse.intensity;

            offset = ripple * 7;
            alpha = Math.min(1, 0.045 + falloff * 0.42 * mouse.intensity + Math.max(0, ripple) * 0.2);
            size = Math.min(3.2, 0.95 + falloff * 1.8 * mouse.intensity + Math.max(0, ripple) * 0.6);
          }
        } else {
          // Ambient subtle wave breathing across the canvas when idle
          const ambientWave = Math.sin((d.x + d.y) * 0.008 - t * 0.02) * 0.5 + 0.5;
          alpha = 0.035 + ambientWave * 0.025;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y + offset, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      t += 1;
      if (!reduced) {
        animId = requestAnimationFrame(draw);
      }
    };

    updateSize();
    draw();

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(hero);

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      resizeObserver.disconnect();
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden border-b border-[#171717] bg-[#000000]"
    >
      {/* Interactive mouse wave canvas */}
      <canvas
        ref={canvasRef}
        id="heroWave"
        className="absolute inset-0 pointer-events-none z-0 block"
        aria-hidden="true"
      />

      {/* Subtle radial ambient light wash from glyph.html */}
      <div
        className="absolute -top-4 right-10 w-[380px] h-[260px] pointer-events-none z-1 blur-2xl opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-24 w-[520px] h-[220px] pointer-events-none z-1 blur-3xl opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_68%)]"
        aria-hidden="true"
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="space-y-8 sm:space-y-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-4">
            <span className="eyebrow">ECONOMIC BEING // 001</span>
            <span className="text-[#333333] hidden sm:inline">|</span>
            <span className="font-mono text-[11px] text-[#76767a] tracking-widest uppercase hidden sm:inline">
              LIVE OBSERVATION TERMINAL
            </span>
          </div>

          {/* Editorial Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[#f3f3f4] leading-[0.95]">
              Watch an AI build <br className="hidden sm:inline" />
              <span className="text-[#909095]">an economy of its own.</span>
            </h1>
          </div>

          {/* Hero Bottom Narrative & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
            <p className="text-sm sm:text-base text-[#85858a] font-light leading-relaxed max-w-lg">
              Glyph has an onchain identity, a wallet, and a memory. It researches markets, forms a thesis, and commits every decision onchain before you ever see the outcome.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="#live-state">
                <Button
                  variant="default"
                  className="h-11 px-6 rounded-[3px] flex items-center gap-2.5 font-sans text-sm font-normal border border-[#2b2b2b] bg-[#000000] text-white hover:bg-[#121212] hover:border-[#404040]"
                >
                  <span>Watch Glyph Live</span>
                  <span className="text-base font-light leading-none">→</span>
                </Button>
              </Link>

              <Link href="#verify-decision">
                <Button
                  variant="light"
                  className="h-11 px-6 rounded-[3px] flex items-center gap-2.5 font-sans text-sm font-normal border border-[#e4e4e7] bg-[#ffffff] text-[#09090b] hover:bg-[#f4f4f5] hover:border-[#d4d4d8]"
                >
                  <span>Verify Onchain</span>
                  <span className="text-sm font-light leading-none">↗</span>
                </Button>
              </Link>

              <Link href="#current-thesis">
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-[3px] flex items-center gap-2 font-sans text-sm font-normal border border-[#262626] bg-transparent text-[#b0b0b4] hover:text-[#f3f3f4] hover:border-[#444448]"
                >
                  <span>Read the thesis</span>
                  <span className="text-sm font-light leading-none">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee Strip from glyph.html */}
      <div className="w-full border-t border-[#171717] bg-[#000000] flex items-stretch h-12 sm:h-14 overflow-hidden relative select-none">
        {/* Intro Tag */}
        <div className="flex items-center px-4 sm:px-6 bg-[#000000] border-r border-[#171717] font-mono text-[10px] sm:text-[11px] tracking-widest text-[#555559] uppercase shrink-0 z-10">
          BUILT ON
        </div>

        {/* Marquee Viewport with gradient masks */}
        <div className="flex-1 overflow-hidden relative flex items-center [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="animate-marquee items-center gap-8 sm:gap-12 px-6">
            {[
              "NEXT.JS",
              "TYPESCRIPT",
              "WAGMI + VIEM",
              "SAFE PROTOCOL",
              "ERC-8004",
              "OPENROUTER",
              "SUPABASE",
              "ROBINHOOD CHAIN",
              "PRISMA ORM",
              // Repeat for continuous seamless loop
              "NEXT.JS",
              "TYPESCRIPT",
              "WAGMI + VIEM",
              "SAFE PROTOCOL",
              "ERC-8004",
              "OPENROUTER",
              "SUPABASE",
              "ROBINHOOD CHAIN",
              "PRISMA ORM",
            ].map((tech, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] sm:text-xs text-[#69696d] hover:text-[#d8d8da] tracking-wider uppercase whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-[#444448] rounded-full" />
                <span>{tech}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
