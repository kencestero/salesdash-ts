"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp } from "lucide-react";
import { DeliverySummary } from "@/lib/analytics/deliveries";

interface DeliverySummaryCardProps {
  summary: DeliverySummary;
}

export default function DeliverySummaryCard({ summary }: DeliverySummaryCardProps) {
  return (
    <Card>
      <CardHeader className="border-none p-6 pt-5 mb-0">
        <CardTitle className="text-lg font-semibold text-default-900 p-0 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Deliveries (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Deliveries</span>
            </div>
            <span className="text-2xl font-bold">{summary.totalDeliveries}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Commission</span>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${summary.totalCommission.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Profit</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${summary.totalProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
