"use client";

import React from "react";
import { TradeFilter } from "../types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface TradeFiltersProps {
  currentFilter: TradeFilter;
  onFilterChange: (filter: TradeFilter) => void;
  count: number;
}

const FILTERS: { id: TradeFilter; label: string }[] = [
  { id: "ALL", label: "All Executions" },
  { id: "VALIDATED", label: "Validated" },
  { id: "INVALIDATED", label: "Invalidated" },
];

export const TradeFilters: React.FC<TradeFiltersProps> = ({
  currentFilter,
  onFilterChange,
  count,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Modern Tabs Filter */}
        <Tabs
          value={currentFilter}
          onValueChange={(val) => onFilterChange(val as TradeFilter)}
          className="w-auto"
        >
          <TabsList className="bg-[#0a0a0e] p-1 rounded-lg border border-[#1e1e24] flex flex-wrap gap-1 !h-auto group-data-horizontal/tabs:!h-auto">
            {FILTERS.map((filter) => {
              const isActive = currentFilter === filter.id;
              return (
                <TabsTrigger
                  key={filter.id}
                  value={filter.id}
                  className={`rounded-md font-sans text-xs font-medium px-3.5 py-1.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#f4f4f5] text-[#09090b] font-semibold shadow-sm"
                      : "text-[#8e8e93] hover:text-[#f4f4f5] hover:bg-[#14141a]"
                  }`}
                >
                  {filter.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Counter metadata pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0a0a0e] border border-[#1e1e24] font-mono text-xs text-[#8e8e93]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6fe39a]" />
            <span>
              {count} {count === 1 ? "RECORD LOGGED" : "RECORDS LOGGED"}
            </span>
          </span>
        </div>
      </div>

      <Separator className="bg-[#18181f]" />
    </div>
  );
};
