"use client";

/**
 * Temperature Distribution Chart
 * Shows breakdown of hot/warm/cold/dead leads
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemperatureChartProps {
  leadsByTemperature: Record<string, number>;
}

const TEMP_CONFIG = [
  { id: "hot", label: "Hot", color: "bg-red-500", icon: "🔥" },
  { id: "warm", label: "Warm", color: "bg-orange-500", icon: "🌡️" },
  { id: "cold", label: "Cold", color: "bg-blue-500", icon: "❄️" },
  { id: "dead", label: "Dead", color: "bg-gray-500", icon: "💀" },
];

export function TemperatureChart({ leadsByTemperature }: TemperatureChartProps) {
  const total = Object.values(leadsByTemperature).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Lead Temperature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Bars */}
        <div className="space-y-3">
          {TEMP_CONFIG.map((temp) => {
            const count = leadsByTemperature[temp.id] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={temp.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <span>{temp.icon}</span>
                    {temp.label}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-500", temp.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Actionable</p>
            <p className="text-2xl font-bold text-red-600">
              {(leadsByTemperature.hot || 0) + (leadsByTemperature.warm || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Hot + Warm</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Needs Attention</p>
            <p className="text-2xl font-bold text-blue-600">
              {leadsByTemperature.cold || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Cold leads</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
