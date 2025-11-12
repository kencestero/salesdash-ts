"use client";

/**
 * Date Range Filter
 * Quick filters for dashboard time periods
 */

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7days", label: "Last 7 Days" },
  { id: "30days", label: "Last 30 Days" },
  { id: "90days", label: "Last 90 Days" },
  { id: "all", label: "All Time" },
];

export function DateRangeFilter({ selectedRange, onRangeChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      {RANGES.map((range) => (
        <Button
          key={range.id}
          variant={selectedRange === range.id ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(range.id)}
          className={cn(
            "text-xs",
            selectedRange === range.id && "bg-primary text-primary-foreground"
          )}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
