import React from "react";
import { TradeFilter } from "../types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface TradeFiltersProps {
  currentFilter: TradeFilter;
  onFilterChange: (filter: TradeFilter) => void;
  count: number;
}

const FILTERS: TradeFilter[] = ["ALL", "VALIDATED", "INVALIDATED"];

export const TradeFilters: React.FC<TradeFiltersProps> = ({
  currentFilter,
  onFilterChange,
  count,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs Filter */}
        <Tabs
          value={currentFilter}
          onValueChange={(val) => onFilterChange(val as TradeFilter)}
          className="w-auto"
        >
          <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 !h-auto group-data-horizontal/tabs:!h-auto border-0">
            {FILTERS.map((filter) => {
              const isActive = currentFilter === filter;
              return (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className={`rounded-none border font-mono text-xs tracking-wider uppercase px-3 py-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#F5F5F5] text-[#080808] border-[#F5F5F5] font-medium"
                      : "bg-[#0D0D0D] text-[#A0A0A0] border-[#242424] hover:text-[#F5F5F5] hover:border-[#666666]"
                  }`}
                >
                  {filter}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Counter metadata */}
        <span className="font-mono text-xs text-[#666666] tracking-wider uppercase">
          SHOWING {count} {count === 1 ? "RECORD" : "RECORDS"}
        </span>
      </div>

      <Separator className="bg-[#242424]" />
    </div>
  );
};
