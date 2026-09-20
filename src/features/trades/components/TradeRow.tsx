"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Trade } from "../types";

interface TradeRowProps {
  trade: Trade;
}

export const TradeRow: React.FC<TradeRowProps> = ({ trade }) => {
  return (
    <TableRow className="border-b border-[#18181f] hover:bg-[#0f0f15]/80 transition-colors group">
      {/* 1. DATE */}
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <Link href={`/trades/${trade.id}`} className="block">
          <span className="font-mono text-xs font-medium text-[#d4d4d8] group-hover:text-white transition-colors">
            {trade.date}
          </span>
          <span className="block font-mono text-[10px] text-[#71717a]">
            2026
          </span>
        </Link>
      </TableCell>

      {/* 2. ASSET */}
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <Link
          href={`/trades/${trade.id}`}
          className="flex items-center gap-3 group/asset"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold border border-[#272730] bg-[#141418] text-[#e4e4e7] shrink-0 transition-transform group-hover/asset:scale-105">
            {trade.asset.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-[#f4f4f5] group-hover:text-white transition-colors">
                {trade.asset}
              </span>
            </div>
            <span className="text-[10px] text-[#71717a] block font-mono uppercase tracking-wider leading-none mt-0.5">
              Instrument
            </span>
          </div>
        </Link>
      </TableCell>

      {/* 3. ACTION (DIRECTION) */}
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide border font-sans",
            trade.action === "LONG"
              ? "border-[#6fe39a]/30 bg-[#6fe39a]/10 text-[#6fe39a]"
              : "border-[#c47a7a]/30 bg-[#c47a7a]/10 text-[#c47a7a]"
          )}
        >
          {trade.action === "LONG" ? (
            <ArrowUpRight size={13} className="stroke-[2.5]" />
          ) : (
            <ArrowDownRight size={13} className="stroke-[2.5]" />
          )}
          <span>{trade.action}</span>
        </Badge>
      </TableCell>

      {/* 4. ENTRY */}
      <TableCell className="px-5 py-4 whitespace-nowrap text-right font-mono text-xs font-medium text-[#d4d4d8]">
        <Link href={`/trades/${trade.id}`} className="block group-hover:text-white">
          <span>{trade.entry}</span>
          <span className="block font-sans text-[10px] text-[#71717a] font-normal">
            per share
          </span>
        </Link>
      </TableCell>

      {/* 5. CAPITAL ALLOCATED */}
      <TableCell className="px-5 py-4 whitespace-nowrap text-right font-mono text-xs">
        <Link href={`/trades/${trade.id}`} className="block">
          <span className="font-medium text-[#f4f4f5] group-hover:text-[#6fe39a] transition-colors block">
            {trade.positionSize || "-"}
          </span>
          {trade.notional && trade.notional !== "-" && (
            <span className="block font-sans text-[10px] text-[#71717a]">
              {trade.notional} exp.
            </span>
          )}
        </Link>
      </TableCell>

      {/* 6. EXIT */}
      <TableCell className="px-5 py-4 whitespace-nowrap text-right font-mono text-xs font-medium text-[#d4d4d8]">
        <Link href={`/trades/${trade.id}`} className="block group-hover:text-white">
          <span className={cn(trade.exit === "ACTIVE" ? "text-[#6fe39a] font-semibold" : "")}>
            {trade.exit}
          </span>
          {trade.exit === "ACTIVE" && (
            <span className="block font-sans text-[10px] text-[#71717a] font-normal">
              in progress
            </span>
          )}
        </Link>
      </TableCell>

      {/* 6. LEVERAGE */}
      <TableCell className="px-5 py-4 whitespace-nowrap text-center">
        <Link href={`/trades/${trade.id}`} className="inline-block">
          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#121217] border border-[#22222b] text-xs font-mono font-medium text-[#a1a1aa] group-hover:border-[#333340] group-hover:text-[#f4f4f5] transition-all">
            {trade.leverage}
          </span>
        </Link>
      </TableCell>

      {/* 7. P&L */}
      <TableCell className="px-5 py-4 whitespace-nowrap text-right">
        <Link href={`/trades/${trade.id}`} className="inline-block">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-xs font-semibold border transition-all",
              trade.isPositive
                ? "bg-[#6fe39a]/10 text-[#6fe39a] border-[#6fe39a]/25 shadow-[0_0_12px_rgba(111,227,154,0.12)]"
                : "bg-[#c47a7a]/10 text-[#c47a7a] border-[#c47a7a]/25 shadow-[0_0_12px_rgba(196,122,122,0.12)]"
            )}
          >
            <span>{trade.pnl}</span>
          </div>
        </Link>
      </TableCell>

      {/* 8. THESIS */}
      <TableCell className="px-5 py-4 whitespace-nowrap">
        <Link href={`/trades/${trade.id}`} className="inline-block">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-normal font-sans border",
              trade.thesis === "VALIDATED"
                ? "border-[#6fe39a]/30 bg-[#0d1a12] text-[#6fe39a]"
                : "border-[#c47a7a]/30 bg-[#1a0f0f] text-[#c47a7a]"
            )}
          >
            {trade.thesis === "VALIDATED" ? (
              <CheckCircle2 size={12} className="stroke-[2.5]" />
            ) : (
              <XCircle size={12} className="stroke-[2.5]" />
            )}
            <span>{trade.thesis === "VALIDATED" ? "Validated" : "Invalidated"}</span>
          </Badge>
        </Link>
      </TableCell>

      {/* 9. ACTIONS / PROOF */}
      <TableCell
        className="px-5 py-4 whitespace-nowrap text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-2">
          {trade.proofUrl && (
            <a
              href={trade.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              title="Verify Onchain Transaction Proof"
            >
              <Button
                variant="ghost"
                size="xs"
                className="h-7 px-2.5 bg-[#121217] hover:bg-[#1a1a23] text-[#a1a1aa] hover:text-[#6fe39a] border border-[#22222b] hover:border-[#6fe39a]/40 font-sans text-xs font-normal rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Verify</span>
                <ExternalLink size={11} />
              </Button>
            </a>
          )}

          <Link href={`/trades/${trade.id}`} className="inline-block">
            <Button
              variant="ghost"
              size="xs"
              className="h-7 px-2 bg-transparent hover:bg-[#16161e] text-[#71717a] hover:text-[#f4f4f5] border border-transparent hover:border-[#282834] rounded-md transition-all cursor-pointer"
              title="Glyphs View Details"
            >
              <ChevronRight size={14} />
            </Button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
};
