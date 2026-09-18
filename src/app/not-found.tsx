import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f3f3f4] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md border border-[#1a1a1a] bg-[#050505] p-6 sm:p-8 space-y-6 text-center shadow-2xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 border border-[#222222] bg-[#080808] grid place-items-center">
            <SearchX size={20} className="text-[#85858a]" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="eyebrow block">404 // LEDGER ADDRESS NOT FOUND</span>
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#f3f3f4]">
            Unregistered observation route.
          </h2>
          <p className="text-xs text-[#85858a] font-light leading-relaxed">
            The requested trade, identity, or resource does not exist in Glyph&apos;s verified economic record.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link href="/">
            <Button
              variant="outline"
              className="h-9 px-4 rounded-[3px] font-sans text-xs font-normal border border-[#262626] bg-transparent hover:bg-[#111111] text-[#f3f3f4] flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Return to Live Terminal</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
