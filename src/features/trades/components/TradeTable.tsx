"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Trade } from "../types";
import { TradeRow } from "./TradeRow";

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="py-16 px-6 text-center border border-[#1f1f26] rounded-xl bg-gradient-to-b from-[#08080a] to-[#040405] space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#121217] border border-[#22222b] flex items-center justify-center text-[#71717a]">
          <FileSpreadsheet size={18} />
        </div>
        <div className="space-y-1">
          <span className="font-sans text-sm font-medium text-[#f4f4f5] block">
            No executions found
          </span>
          <p className="font-sans text-xs text-[#8e8e93] max-w-sm mx-auto">
            No recorded trade tranches currently match the active filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop / Tablet Modern Table View */}
      <div className="hidden md:block border border-[#1e1e24] rounded-xl bg-gradient-to-b from-[#09090c] to-[#040405] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Table Chrome Bar */}
        <div className="h-10 px-5 flex items-center justify-between border-b border-[#1c1c22] bg-[#0c0c10]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-[#2a2a32]" />
              <span className="w-2 h-2 rounded-full bg-[#2a2a32]" />
              <span className="w-2 h-2 rounded-full bg-[#2a2a32]" />
            </div>
            <span className="text-[#33333e]">|</span>
            <span className="font-mono text-[11px] text-[#8e8e93] uppercase tracking-wider">
              EXECUTION ARCHIVE // ONCHAIN ATTESTED TRADES
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-[#6fe39a] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a] shadow-[0_0_0_2px_rgba(111,227,154,0.2)] animate-livepulse" />
            <span>REAL-TIME ATTESTATION</span>
          </div>
        </div>

        {/* Scrollable Data Table Container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1c1c22] bg-[#0a0a0e] hover:bg-[#0a0a0e]">
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5">
                  Date
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5">
                  Asset / Instrument
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5">
                  Direction
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-right">
                  Entry Price
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-right">
                  Capital Allocated
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-right">
                  Exit Price
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-center">
                  Leverage
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-right">
                  Net Return
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5">
                  Glyph&apos;s View
                </TableHead>
                <TableHead className="font-sans text-xs font-semibold text-[#8e8e96] py-3.5 px-5 text-right">
                  Verification
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Stacked Record View */}
      <div className="md:hidden space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="p-4 rounded-xl border border-[#1e1e24] bg-gradient-to-b from-[#09090c] to-[#040405] space-y-3.5 shadow-md hover:border-[#2a2a34] transition-all"
          >
            {/* Header: Asset avatar, Ticker, Direction, Date & Net Return */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold border border-[#272730] bg-[#141418] text-[#e4e4e7] shrink-0">
                  {trade.asset.slice(0, 4)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/trades/${trade.id}`}
                      className="font-mono text-sm font-semibold text-[#f4f4f5] hover:text-white"
                    >
                      {trade.asset}
                    </Link>
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans border",
                        trade.action === "LONG"
                          ? "border-[#6fe39a]/30 bg-[#6fe39a]/10 text-[#6fe39a]"
                          : "border-[#c47a7a]/30 bg-[#c47a7a]/10 text-[#c47a7a]"
                      )}
                    >
                      {trade.action === "LONG" ? (
                        <ArrowUpRight size={10} className="stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight size={10} className="stroke-[2.5]" />
                      )}
                      <span>{trade.action}</span>
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#71717a] font-mono">
                    {trade.date}
                  </span>
                </div>
              </div>

              {/* Net Return Pill */}
              <div
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-semibold border",
                  trade.isPositive
                    ? "bg-[#6fe39a]/10 text-[#6fe39a] border-[#6fe39a]/25 shadow-[0_0_10px_rgba(111,227,154,0.12)]"
                    : "bg-[#c47a7a]/10 text-[#c47a7a] border-[#c47a7a]/25 shadow-[0_0_10px_rgba(196,122,122,0.12)]"
                )}
              >
                {trade.pnl}
              </div>
            </div>

            {/* Pricing details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-[#07070a] border border-[#16161c] font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#71717a] uppercase block">
                  Entry Price
                </span>
                <span className="font-medium text-[#d4d4d8]">{trade.entry}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717a] uppercase block">
                  Capital (Margin)
                </span>
                <span className="font-medium text-[#f4f4f5] block">{trade.positionSize || "-"}</span>
                {trade.notional && trade.notional !== "-" && (
                  <span className="text-[9px] text-[#71717a] block">{trade.notional} exp.</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-[#71717a] uppercase block">
                  Exit
                </span>
                <span className={cn("font-medium", trade.exit === "ACTIVE" ? "text-[#6fe39a]" : "text-[#d4d4d8]")}>
                  {trade.exit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717a] uppercase block">
                  Leverage
                </span>
                <span className="inline-block px-1.5 py-0.5 rounded bg-[#121217] border border-[#22222b] text-[11px] text-[#a1a1aa]">
                  {trade.leverage}
                </span>
              </div>
            </div>

            {/* Thesis & Proof actions */}
            <div className="flex items-center justify-between pt-1 border-t border-[#16161c]">
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-sans border",
                  trade.thesis === "VALIDATED"
                    ? "border-[#6fe39a]/30 bg-[#0d1a12] text-[#6fe39a]"
                    : "border-[#c47a7a]/30 bg-[#1a0f0f] text-[#c47a7a]"
                )}
              >
                {trade.thesis === "VALIDATED" ? (
                  <CheckCircle2 size={11} className="stroke-[2.5]" />
                ) : (
                  <XCircle size={11} className="stroke-[2.5]" />
                )}
                <span>{trade.thesis === "VALIDATED" ? "Validated" : "Invalidated"}</span>
              </Badge>

              <div className="flex items-center gap-2">
                {trade.proofUrl && (
                  <a
                    href={trade.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-7 px-2 bg-[#121217] hover:bg-[#1a1a23] text-[#a1a1aa] hover:text-[#6fe39a] border border-[#22222b] hover:border-[#6fe39a]/40 font-sans text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Verify</span>
                      <ExternalLink size={10} />
                    </Button>
                  </a>
                )}
                <Link href={`/trades/${trade.id}`}>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 px-2 bg-transparent hover:bg-[#16161e] text-[#71717a] hover:text-[#f4f4f5] border border-transparent hover:border-[#282834] rounded-md transition-all flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <span>Details</span>
                    <ChevronRight size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
