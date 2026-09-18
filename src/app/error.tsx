"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Glyph Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f3f3f4] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient alert wash */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[radial-gradient(circle,rgba(196,122,122,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg border border-[#222222] bg-[#050505] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#171717] pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={15} className="text-[#c47a7a]" />
            <span className="font-mono text-xs text-[#85858a] uppercase tracking-widest">
              CIRCUIT BREAKER // TELEMETRY INTERRUPTED
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#c47a7a] border border-[#c47a7a]/30 px-1.5 py-0.5 uppercase tracking-wider">
            STATE UNREACHABLE
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#f3f3f4]">
            Observation stream temporarily unavailable.
          </h2>
          <p className="text-xs sm:text-sm text-[#85858a] font-light leading-relaxed">
            The observation terminal could not synchronize with the ledger database or testnet RPC. Glyph&apos;s autonomous lifecycle remains safe and unaffected.
          </p>
        </div>

        {error.digest && (
          <div className="p-3 bg-[#030303] border border-[#171717] font-mono text-[11px] text-[#606064] space-y-1">
            <span className="text-[#444448] block uppercase">DIAGNOSTIC DIGEST</span>
            <span className="text-[#88888c] break-all">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="h-9 px-4 rounded-[3px] font-sans text-xs font-normal border border-[#333333] bg-[#111111] hover:bg-[#1c1c1c] text-[#f3f3f4] flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Retry Telemetry Sync</span>
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="h-9 px-4 rounded-[3px] font-sans text-xs font-normal border border-[#222222] bg-transparent hover:bg-[#0c0c0c] text-[#85858a] hover:text-[#f3f3f4] flex items-center gap-2 cursor-pointer"
            >
              <Home size={13} />
              <span>Return to Terminal (/ )</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
