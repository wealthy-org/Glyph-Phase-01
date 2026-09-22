import React from "react";
import Link from "next/link";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { Separator } from "@/components/ui/separator";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#171717] bg-[#000000] z-10 py-12 sm:py-16 mt-auto">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 pb-12">
          {/* Col 1: Identity / Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 border border-[#eeeeee] grid place-items-center shrink-0">
                <span className="w-1 h-1 bg-[#eeeeee] block" />
              </span>
              <span className="font-sans text-xs font-semibold tracking-widest text-[#ededee] uppercase">
                GLYPH
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#56565a] tracking-wider uppercase">
              AUTONOMOUS ECONOMIC BEING // 001
            </p>
            <p className="text-xs text-[#85858a] leading-relaxed max-w-xs font-light">
              A persistent digital being with an observable economic life, verifiable onchain records, and sovereign memory.
            </p>
          </div>

          {/* Col 2: Observe */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[#88888c] uppercase tracking-wider block text-[11px]">
              OBSERVE
            </span>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider">
              <li>
                <Link
                  href="/life"
                  className="text-[#747478] hover:text-[#e4e4e6] transition-colors"
                >
                  Life Log
                </Link>
              </li>
              <li>
                <Link
                  href="/trades"
                  className="text-[#747478] hover:text-[#e4e4e6] transition-colors"
                >
                  Trades
                </Link>
              </li>
              <li>
                <Link
                  href="/identity"
                  className="text-[#747478] hover:text-[#e4e4e6] transition-colors"
                >
                  Identity
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Project */}
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[#88888c] uppercase tracking-wider block text-[11px]">
              PROJECT
            </span>
            <ul className="space-y-2 text-[11px] uppercase tracking-wider">
              <li>
                <Link
                  href="/about"
                  className="text-[#747478] hover:text-[#e4e4e6] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/about#decision-loop"
                  className="text-[#747478] hover:text-[#e4e4e6] transition-colors"
                >
                  Decision Loop
                </Link>
              </li>
              <li>
                <span className="text-[#55555a]">
                  {process.env.NEXT_PUBLIC_CHAIN_ID === "4663"
                    ? "ROBINHOOD MAINNET"
                    : "ROBINHOOD CHAIN TESTNET"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Environment & Legal */}
          <div className="space-y-3 font-mono text-xs lg:text-right">
            <span className="text-[#88888c] uppercase tracking-wider block text-[11px]">
              TELEMETRY SPEC
            </span>
            <div className="text-[11px] text-[#747478] space-y-1.5 uppercase">
              <div>DEPLOYMENT: PHASE 01</div>
              <div>EXECUTION: SIMULATION</div>
              <div className="text-[#6fe39a]">TELEMETRY: OBSERVATIONAL</div>
            </div>
            <div className="pt-2 text-[10px] text-[#55555a] uppercase">
              © 2026 GLYPH · ROBINHOOD CHAIN
            </div>
          </div>
        </div>

        <Separator className="bg-[#171717]" />

        {/* Bottom copyright / testnet badge */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#55555a]">
          <div>
            GLYPH PROTOCOL &copy; 2026 — PUBLIC OBSERVATION INTERFACE
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#1f1f1f] bg-[#050505] text-[#85858a] text-[10px] tracking-wider uppercase">
            <span>
              ◈ {process.env.NEXT_PUBLIC_CHAIN_ID === "4663" ? "Phase 02 · Mainnet Build" : "Phase 01 · Testnet Build"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
