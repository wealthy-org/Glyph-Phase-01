"use client";

import React, { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isItemActive = (href: string) => {
    if (href === "/trades") {
      return pathname.startsWith("/trades");
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        scrolled
          ? "bg-black/65 backdrop-blur-xl supports-[backdrop-filter]:bg-black/55 border-[#171717] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          : "bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/30 border-[#171717]/60"
      )}
    >
      <div className="max-w-[1920px] mx-auto px-5 sm:px-8 lg:px-12 h-12 sm:h-14 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="Glyph Home"
        >
          <span className="w-3 h-3 border border-[#e6e6e6] grid place-items-center shrink-0">
            <span className="w-1 h-1 bg-[#e6e6e6] block" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs sm:text-sm font-medium tracking-tight text-[#f0f0f0] group-hover:text-white transition-colors">
              GLYPH
            </span>
            <span className="font-mono text-[9px] text-[#55555a] tracking-widest hidden sm:inline-block">
              // 001
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-wider"
          aria-label="Primary Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "py-1 relative transition-colors uppercase tracking-[0.08em]",
                  active
                    ? "text-[#f3f3f4] font-medium"
                    : "text-[#77777b] hover:text-[#eeeeee]"
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
            className="inline-flex items-center gap-2 px-3 py-1 bg-transparent border border-[#1a1a1a] hover:border-[#2b2b2b] text-[#85858a] hover:text-[#f3f3f4] text-[10px] font-mono tracking-wider transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_3px_rgba(111,227,154,0.18)] animate-livepulse" />
            <span>VERIFIED AGENT · ID #1</span>
          </Link>
          <StatusIndicator network="TESTNET" status="LIVE" />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 sm:hidden">
          <StatusIndicator network="SIM" status="LIVE" className="gap-1 text-[10px]" />
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[#85858a] hover:text-[#f3f3f4] border-[#1a1a1a] bg-transparent rounded-none cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#171717] bg-black/85 backdrop-blur-xl px-5 py-6 space-y-4">
          <nav className="flex flex-col space-y-4 font-mono text-xs tracking-widest text-[#85858a]">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "transition-colors py-1.5 flex items-center justify-between uppercase",
                    active ? "text-[#f3f3f4] font-medium" : "hover:text-[#f3f3f4]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {active && <span className="w-1.5 h-1.5 bg-[#6fe39a] rounded-full" />}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "text-[#6fe39a]" : "text-[#55555a]"
                    )}
                  >
                    {active ? "ACTIVE" : "→"}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 space-y-4">
            <Separator className="bg-[#171717]" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#55555a]">SYSTEM STATE</span>
              <StatusIndicator network="TESTNET" status="LIVE" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
