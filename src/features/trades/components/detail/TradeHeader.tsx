import React from "react";
import { TradeDecisionDetail } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TradeMetric } from "./TradeMetric";
import { DecisionThesis } from "./DecisionThesis";
import { cn } from "@/lib/utils";

interface TradeHeaderProps {
  trade: TradeDecisionDetail;
  className?: string;
}

export const TradeHeader: React.FC<TradeHeaderProps> = ({ trade, className }) => {
  return (
    <section
      className={cn(
        "border border-[#171717] bg-[#050505] p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8",
        className
      )}
      aria-label="Trade Decision Record"
    >
      {/* Top Header Block: Trade ID, Asset, Status, Result */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        {/* Top-left: Record Tag, Trade #, Asset Line */}
        <div className="space-y-2.5">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase block">
            {trade.recordLabel || "DECISION RECORD"}
          </span>

          <h1 className="font-mono text-3xl sm:text-4xl font-light tracking-tight text-[#f3f3f4]">
            {trade.tradeNumber}
          </h1>

          <div className="flex items-center flex-wrap gap-2.5 pt-1 font-mono text-xs sm:text-sm text-[#85858a]">
            <span className="font-medium text-[#f3f3f4] tracking-wider">
              {trade.asset}
            </span>
            <span className="text-[#333333]">·</span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-none px-2 py-0.5 font-mono text-[11px] tracking-wider uppercase font-normal",
                trade.action === "LONG"
                  ? "border-[#6fe39a]/40 bg-[#6fe39a]/10 text-[#6fe39a]"
                  : "border-[#c47a7a]/40 bg-[#c47a7a]/10 text-[#c47a7a]"
              )}
            >
              {trade.action}
            </Badge>
            <span className="text-[#333333]">·</span>
            <span className="text-[#85858a] tracking-wider">
              {trade.leverageLabel}
            </span>
            {trade.positionSize && trade.positionSize !== "-" && (
              <>
                <span className="text-[#333333]">·</span>
                <span className="text-[#85858a] font-mono tracking-wider">
                  {trade.positionSize} MARGIN ALLOCATED
                </span>
              </>
            )}
          </div>
        </div>

        {/* Top-right: Result & Closed Status */}
        <div className="flex flex-col sm:items-end space-y-1 sm:text-right">
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase">
            RESULT
          </span>
          <div
            className={cn(
              "font-mono text-3xl sm:text-4xl font-light tracking-tight",
              trade.isPositive ? "text-[#6fe39a]" : "text-[#c47a7a]"
            )}
          >
            {trade.resultPercent}
          </div>
          <span className="font-mono text-xs text-[#55555a] tracking-widest uppercase pt-1">
            {trade.status}
          </span>
        </div>
      </div>

      {/* Divider 1 */}
      <Separator className="bg-[#171717]" />

      {/* Trade Metrics Grid: 6-col desktop, 3-col tablet, 2-col mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 sm:gap-6">
        <TradeMetric label="ENTRY PRICE" value={trade.entryPrice} />
        <TradeMetric label="CAPITAL (MARGIN)" value={trade.positionSize || "-"} />
        <TradeMetric label="NOTIONAL EXP." value={trade.notional || "-"} />
        <TradeMetric label="EXIT" value={trade.exitPrice} />
        <TradeMetric label="LEVERAGE" value={trade.leverage} />
        <TradeMetric
          label="PNL"
          value={trade.pnlValue}
          isPositive={trade.isPositive}
          isNegative={!trade.isPositive}
        />
      </div>

      {/* Divider 2 */}
      <Separator className="bg-[#171717]" />

      {/* Decision Summary Thesis Quote */}
      <DecisionThesis thesis={trade.decisionThesis} />
    </section>
  );
};
