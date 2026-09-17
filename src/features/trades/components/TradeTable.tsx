import React from "react";
import Link from "next/link";
import { Trade } from "../types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { TradeRow } from "./TradeRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="py-16 text-center border border-[#242424] bg-[#0D0D0D]/50 space-y-2">
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase block">
          NO TRADES FOUND
        </span>
        <p className="font-mono text-xs text-[#A0A0A0]">
          No recorded execution tranches match the active filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block border border-[#242424] bg-[#080808]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#242424] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                DATE
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                ASSET
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                ACTION
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                ENTRY
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                EXIT
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                LEVERAGE
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                P&amp;L
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3">
                THESIS
              </TableHead>
              <TableHead className="font-mono text-[11px] text-[#666666] tracking-widest uppercase py-3 text-right">
                PROOF
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

      {/* Mobile Stacked Record View */}
      <div className="md:hidden divide-y divide-[#242424] border border-[#242424] bg-[#080808]">
        {trades.map((trade) => (
          <div key={trade.id} className="p-4 space-y-3">
            {/* Header: Date, Asset, Action, and P&L */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#666666]">
                  {trade.date}
                </span>
                <span className="text-[#242424]">·</span>
                <Link
                  href={`/trades/${trade.id}`}
                  className="font-mono text-sm font-medium text-[#F5F5F5]"
                >
                  {trade.asset}
                </Link>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-none font-normal",
                    trade.action === "LONG"
                      ? "border-[#8FB996]/30 bg-[#8FB996]/10 text-[#8FB996]"
                      : "border-[#C47A7A]/30 bg-[#C47A7A]/10 text-[#C47A7A]"
                  )}
                >
                  {trade.action}
                </Badge>
              </div>

              <span
                className={cn(
                  "font-mono text-xs font-medium",
                  trade.isPositive ? "text-[#8FB996]" : "text-[#C47A7A]"
                )}
              >
                {trade.pnl}
              </span>
            </div>

            {/* Pricing details */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs py-1 border-t border-b border-[#181818] text-[#A0A0A0]">
              <div>
                <span className="text-[10px] text-[#666666] block">ENTRY</span>
                {trade.entry}
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">EXIT</span>
                {trade.exit}
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">LEVERAGE</span>
                {trade.leverage}
              </div>
            </div>

            {/* Thesis & Proof actions */}
            <div className="flex items-center justify-between font-mono text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#666666]">THESIS:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-none font-normal",
                    trade.thesis === "VALIDATED"
                      ? "border-[#8FB996]/20 bg-[#080808] text-[#8FB996]"
                      : "border-[#C47A7A]/20 bg-[#080808] text-[#C47A7A]"
                  )}
                >
                  {trade.thesis}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/trades/${trade.id}`}
                  className="text-xs text-[#A0A0A0] hover:text-[#F5F5F5] underline underline-offset-4"
                >
                  DETAILS
                </Link>
                <a
                  href={trade.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-auto p-0 text-[#A0A0A0] hover:text-[#F5F5F5] font-mono text-xs tracking-wider rounded-none bg-transparent hover:bg-transparent"
                  >
                    VERIFY ↗
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
