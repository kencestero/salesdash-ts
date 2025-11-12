"use client";

/**
 * Priority Distribution Chart
 * Shows breakdown of urgent/high/medium/low priority leads
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityChartProps {
  leadsByPriority: Record<string, number>;
}

const PRIORITY_CONFIG = [
  { id: "urgent", label: "Urgent", color: "bg-red-600", badge: "bg-red-600 text-white" },
  { id: "high", label: "High", color: "bg-orange-600", badge: "bg-orange-600 text-white" },
  { id: "medium", label: "Medium", color: "bg-blue-600", badge: "bg-blue-600 text-white" },
  { id: "low", label: "Low", color: "bg-gray-600", badge: "bg-gray-600 text-white" },
];

export function PriorityChart({ leadsByPriority }: PriorityChartProps) {
  const total = Object.values(leadsByPriority).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Priority Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Grid */}
        <div className="grid grid-cols-2 gap-3">
          {PRIORITY_CONFIG.map((priority) => {
            const count = leadsByPriority[priority.id] || 0;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : "0";

            return (
              <div
                key={priority.id}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <Badge className={cn("text-xs mb-2", priority.badge)}>
                  {priority.label}
                </Badge>
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {percentage}% of total
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Needs Immediate Action</span>
            <span className="font-bold text-red-600">
              {(leadsByPriority.urgent || 0) + (leadsByPriority.high || 0)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Urgent + High priority leads
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
