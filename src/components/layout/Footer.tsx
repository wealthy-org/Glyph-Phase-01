import React from "react";
import Link from "next/link";
import { GlyphMark } from "@/components/glyph/GlyphMark";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#242424] bg-[#080808] py-16 mt-auto">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-[#181818]">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <GlyphMark size="xs" animated={false} />
              <span className="font-sans text-xs font-semibold tracking-widest text-[#F5F5F5] uppercase">
                GLYPH
              </span>
            </div>
            <p className="font-mono text-xs text-[#666666] tracking-wider uppercase">
              ECONOMIC BEING #001
            </p>
            <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
              An autonomous digital economic entity with continuous observation of its treasury,
              theses, decisions, and onchain reputation.
            </p>
          </div>

          {/* Col 2: Environment Specs */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-[#666666] uppercase tracking-wider block mb-2">
              ENVIRONMENT SPEC
            </span>
            <div className="text-[#A0A0A0] flex items-center justify-between max-w-xs py-1 border-b border-[#181818]">
              <span>DEPLOYMENT</span>
              <span className="text-[#F5F5F5]">PHASE 01</span>
            </div>
            <div className="text-[#A0A0A0] flex items-center justify-between max-w-xs py-1 border-b border-[#181818]">
              <span>EXECUTION</span>
              <span className="text-[#F5F5F5]">SIMULATION</span>
            </div>
            <div className="text-[#A0A0A0] flex items-center justify-between max-w-xs py-1 border-b border-[#181818]">
              <span>TELEMETRY</span>
              <span className="text-[#8FB996]">OBSERVATIONAL</span>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-[#666666] uppercase tracking-wider block mb-2">
              NAVIGATION
            </span>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/life"
                  className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
                >
                  Life
                </Link>
              </li>
              <li>
                <Link
                  href="/trades"
                  className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
                >
                  Trades
                </Link>
              </li>
              <li>
                <Link
                  href="/identity"
                  className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
                >
                  Identity
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#A0A0A0] hover:text-[#F5F5F5] transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright / timestamp */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#666666]">
          <div>
            GLYPH PROTOCOL &copy; {new Date().getFullYear()} — PUBLIC OBSERVATION INTERFACE
          </div>
          <div className="flex items-center gap-4">
            <span>EPOCH 001</span>
            <span>•</span>
            <span>AUTONOMOUS AGENT RESEARCH</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
