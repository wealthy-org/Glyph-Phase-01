"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlyphMark } from "@/components/glyph/GlyphMark";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "LIFE", href: "/life" },
  { label: "TRADES", href: "/trades" },
  { label: "IDENTITY", href: "/identity" },
  { label: "ABOUT", href: "/about" },
];

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/trades") {
      return pathname.startsWith("/trades");
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080808]/90 backdrop-blur-md border-b border-[#242424]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#F5F5F5]"
        >
          <GlyphMark size="sm" animated={true} />
          <div className="flex flex-col">
            <span className="font-sans text-sm font-semibold tracking-widest text-[#F5F5F5] group-hover:text-white transition-colors">
              GLYPH
            </span>
            <span className="font-mono text-[9px] text-[#666666] tracking-wider hidden sm:block">
              BEING #001
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest"
          aria-label="Primary Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "py-1 relative transition-colors",
                  active
                    ? "text-[#F5F5F5] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5]"
                    : "text-[#A0A0A0] hover:text-[#F5F5F5] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#F5F5F5] hover:after:w-full after:transition-all after:duration-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Operational Status & Verified Agent Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/identity"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8FB996]/10 border border-[#8FB996]/30 text-[#8FB996] text-[11px] font-mono tracking-wider hover:bg-[#8FB996]/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FB996]" />
            Verified Agent · ID #1
          </Link>
          <StatusIndicator network="TESTNET" status="ONLINE" />
        </div>

        {/* Mobile Hamburger Button using shadcn Button */}
        <div className="flex items-center gap-3 sm:hidden">
          <StatusIndicator network="SIM" status="ON" className="gap-1.5 text-[10px]" />
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#A0A0A0] hover:text-[#F5F5F5] border-[#242424] hover:border-[#666666] bg-transparent rounded-none cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#242424] bg-[#0D0D0D] px-5 py-6 space-y-4">
          <nav className="flex flex-col space-y-4 font-mono text-xs tracking-widest text-[#A0A0A0]">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "transition-colors py-1.5 flex items-center justify-between",
                    active ? "text-[#F5F5F5] font-medium" : "hover:text-[#F5F5F5]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {active && <span className="w-1.5 h-1.5 bg-[#8FB996] rounded-full" />}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "text-[#8FB996]" : "text-[#666666]"
                    )}
                  >
                    {active ? "ACTIVE" : "→"}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 space-y-4">
            <Separator className="bg-[#181818]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#666666]">SYSTEM STATE</span>
              <StatusIndicator network="TESTNET" status="ONLINE" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
