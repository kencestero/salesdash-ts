"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  usersLast24h: number;
  totalVisits: number;
  visitsLast30Min: number;
  visitsPerHour: Array<{ hour: string; count: number }>;
}

export function DashboardUsersCard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics/dashboard");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-default-50 dark:bg-default-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-48">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usersLast24h = data?.usersLast24h ?? 0;
  const visitsLast30Min = data?.visitsLast30Min ?? 0;
  const visitsPerHour = data?.visitsPerHour ?? [];

  // Find max count for scaling the chart
  const maxCount = Math.max(...visitsPerHour.map((v) => v.count), 1);

  return (
    <Card className="bg-default-50 dark:bg-default-100">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-default-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-default-500">In Last 24 Hours</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold" style={{ color: "#E96114" }}>
                {usersLast24h}
              </span>
              <TrendingUp className="w-5 h-5" style={{ color: "#E96114" }} />
            </div>
            {visitsLast30Min > 0 && (
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                {visitsLast30Min} in last 30 min
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Bar Chart */}
        <div className="mb-4">
          <p className="text-xs font-medium text-default-600 mb-3">User Per Minutes</p>
          <div className="h-32 flex items-end gap-[2px]">
            {visitsPerHour.slice(-24).map((bucket, index) => {
              const heightPercent = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  <div
                    className="w-full rounded-t transition-all duration-200 hover:opacity-80"
                    style={{
                      backgroundColor: "#E96114",
                      height: `${Math.max(heightPercent, 2)}%`,
                      minHeight: bucket.count > 0 ? "4px" : "0",
                    }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-default-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {bucket.hour}: {bucket.count} visits
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Countries Table (placeholder - can be enhanced later) */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-default-700 mb-3">Active Users</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Unique Visitors</span>
              <span className="font-semibold text-default-900">{usersLast24h}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Total Visits</span>
              <span className="font-semibold text-default-900">{data?.totalVisits ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Last 30 Minutes</span>
              <span className="font-semibold" style={{ color: "#E96114" }}>
                {visitsLast30Min}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
