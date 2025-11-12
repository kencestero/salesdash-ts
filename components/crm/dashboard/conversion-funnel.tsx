"use client";

/**
 * Conversion Funnel Chart
 * Shows lead progression through pipeline stages
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionFunnelProps {
  leadsByStatus: Record<string, number>;
}

const FUNNEL_STAGES = [
  { id: "new", label: "New", color: "bg-gray-500" },
  { id: "contacted", label: "Contacted", color: "bg-blue-500" },
  { id: "qualified", label: "Qualified", color: "bg-purple-500" },
  { id: "applied", label: "Applied", color: "bg-orange-500" },
  { id: "approved", label: "Approved", color: "bg-green-500" },
  { id: "won", label: "Won", color: "bg-emerald-500" },
];

export function ConversionFunnel({ leadsByStatus }: ConversionFunnelProps) {
  const total = Object.values(leadsByStatus).reduce((a, b) => a + b, 0);

  // Calculate max width for scaling
  const maxCount = Math.max(...FUNNEL_STAGES.map((stage) => leadsByStatus[stage.id] || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {FUNNEL_STAGES.map((stage, index) => {
          const count = leadsByStatus[stage.id] || 0;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          const widthPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          // Calculate conversion rate from previous stage
          let conversionRate = null;
          if (index > 0) {
            const prevStage = FUNNEL_STAGES[index - 1];
            const prevCount = leadsByStatus[prevStage.id] || 0;
            if (prevCount > 0) {
              conversionRate = ((count / prevCount) * 100).toFixed(1);
            }
          }

          return (
            <div key={stage.id} className="space-y-2">
              {/* Stage Header */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {count} ({percentage}%)
                  </span>
                  {conversionRate && (
                    <span className="text-xs text-green-600">
                      {conversionRate}% conversion
                    </span>
                  )}
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="relative h-10 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 flex items-center justify-end pr-3",
                    stage.color
                  )}
                  style={{ width: `${widthPercentage}%` }}
                >
                  <span className="text-white font-semibold text-sm">{count}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Overall Conversion Rate */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Conversion</span>
            <span className="text-sm font-bold text-emerald-600">
              {total > 0
                ? (((leadsByStatus.won || 0) / total) * 100).toFixed(1)
                : "0"}
              %
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {leadsByStatus.won || 0} won out of {total} total leads
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
