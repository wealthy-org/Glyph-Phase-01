import React from "react";
import Link from "next/link";
import { Trade } from "../types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TradeRowProps {
  trade: Trade;
}

export const TradeRow: React.FC<TradeRowProps> = ({ trade }) => {
  return (
    <TableRow className="border-b border-[#242424] hover:bg-[#0D0D0D] transition-colors group cursor-pointer">
      {/* 1. DATE */}
      <TableCell className="font-mono text-xs text-[#666666] tracking-wider py-4">
        <Link href={`/trades/${trade.id}`} className="block">
          {trade.date}
        </Link>
      </TableCell>

      {/* 2. ASSET */}
      <TableCell className="py-4">
        <Link
          href={`/trades/${trade.id}`}
          className="font-mono text-sm font-medium text-[#F5F5F5] group-hover:text-white transition-colors"
        >
          {trade.asset}
        </Link>
      </TableCell>

      {/* 3. ACTION */}
      <TableCell className="py-4">
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
      </TableCell>

      {/* 4. ENTRY */}
      <TableCell className="font-mono text-xs text-[#A0A0A0] py-4">
        <Link href={`/trades/${trade.id}`} className="block">
          {trade.entry}
        </Link>
      </TableCell>

      {/* 5. EXIT */}
      <TableCell className="font-mono text-xs text-[#A0A0A0] py-4">
        <Link href={`/trades/${trade.id}`} className="block">
          {trade.exit}
        </Link>
      </TableCell>

      {/* 6. LEVERAGE */}
      <TableCell className="font-mono text-xs text-[#666666] py-4">
        <Link href={`/trades/${trade.id}`} className="block">
          {trade.leverage}
        </Link>
      </TableCell>

      {/* 7. P&L */}
      <TableCell className="py-4">
        <Link
          href={`/trades/${trade.id}`}
          className={cn(
            "font-mono text-xs font-medium",
            trade.isPositive ? "text-[#8FB996]" : "text-[#C47A7A]"
          )}
        >
          {trade.pnl}
        </Link>
      </TableCell>

      {/* 8. THESIS */}
      <TableCell className="py-4">
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
      </TableCell>

      {/* 9. PROOF */}
      <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
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
      </TableCell>
    </TableRow>
  );
};
