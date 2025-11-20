"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ActivityData {
  summary: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
  byType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  taskStatuses: Array<{
    status: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
  }>;
  recent: Array<{
    id: string;
    type: string;
    subject: string;
    description: string | null;
    status: string | null;
    createdAt: string;
    customer: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    } | null;
  }>;
}

const activityIcons: Record<string, string> = {
  call: "heroicons:phone",
  email: "heroicons:envelope",
  meeting: "heroicons:calendar",
  note: "heroicons:document-text",
  task: "heroicons:check-circle",
};

const activityColors: Record<string, string> = {
  call: "bg-blue-500",
  email: "bg-purple-500",
  meeting: "bg-green-500",
  note: "bg-yellow-500",
  task: "bg-orange-500",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function ActivityDashboard() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      const response = await fetch("/api/analytics/activities");
      if (response.ok) {
        const activityData = await response.json();
        setData(activityData);
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E96114] border-r-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Icon icon="heroicons:exclamation-triangle" className="h-12 w-12 text-default-400 mb-2" />
          <p className="text-default-600">Failed to load activity data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#E96114]/10 to-transparent border-[#E96114]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Activities</p>
                <h3 className="text-3xl font-bold text-[#E96114] mt-1">
                  {data.summary.total.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#E96114]/20 flex items-center justify-center">
                <Icon icon="heroicons:chart-bar" className="h-6 w-6 text-[#E96114]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Last 7 Days</p>
                <h3 className="text-3xl font-bold text-default-900 mt-1">
                  {data.summary.last7Days.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Icon icon="heroicons:clock" className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-default-600">Last 30 Days</p>
              <h3 className="text-3xl font-bold text-default-900 mt-1">
                {data.summary.last30Days.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity by Type */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons:squares-2x2" className="h-5 w-5 text-[#E96114]" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.byType.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No activities yet</p>
              ) : (
                data.byType.map((item) => (
                  <div key={item.type} className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      activityColors[item.type] || "bg-default-500"
                    )}>
                      <Icon
                        icon={activityIcons[item.type] || "heroicons:document"}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                        <span className="text-sm text-default-600">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-default-200 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full", activityColors[item.type] || "bg-default-500")}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons:clipboard-document-check" className="h-5 w-5 text-[#E96114]" />
              Task Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.taskStatuses.length === 0 ? (
                <p className="text-sm text-default-500 text-center py-8">No tasks yet</p>
              ) : (
                data.taskStatuses.map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-4 bg-default-50 dark:bg-default-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        statusColors[item.status] || "bg-default-500"
                      )} />
                      <span className="text-sm font-medium capitalize">{item.status}</span>
                    </div>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:chart-bar-square" className="h-5 w-5 text-[#E96114]" />
            Activity Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-2 h-48">
            {data.dailyTrend.map((day, index) => {
              const maxCount = Math.max(...data.dailyTrend.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className="w-full bg-[#E96114] rounded-t-md transition-all hover:bg-[#d5550f] relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold">{day.count}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-default-600">{day.date}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons:clock" className="h-5 w-5 text-[#E96114]" />
              Recent Activities
            </CardTitle>
            <Link
              href="/en/crm/customers"
              className="text-sm text-[#E96114] hover:underline"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {data.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Icon icon="heroicons:inbox" className="h-12 w-12 text-default-300 mb-2" />
                <p className="text-sm text-default-500">No recent activities</p>
              </div>
            ) : (
              <div className="divide-y">
                {data.recent.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-default-50 dark:hover:bg-default-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        activityColors[activity.type] || "bg-default-500"
                      )}>
                        <Icon
                          icon={activityIcons[activity.type] || "heroicons:document"}
                          className="h-5 w-5 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-default-900 truncate">
                            {activity.subject}
                          </h4>
                          <Badge variant="outline" className="capitalize text-xs">
                            {activity.type}
                          </Badge>
                          {activity.status && (
                            <Badge
                              variant="outline"
                              className={cn("text-xs capitalize", {
                                "border-yellow-500 text-yellow-700": activity.status === "pending",
                                "border-green-500 text-green-700": activity.status === "completed",
                                "border-red-500 text-red-700": activity.status === "cancelled",
                              })}
                            >
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-default-600 line-clamp-2 mb-2">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-default-500">
                          {activity.customer && (
                            <span className="flex items-center gap-1">
                              <Icon icon="heroicons:user" className="h-3 w-3" />
                              {activity.customer.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Icon icon="heroicons:clock" className="h-3 w-3" />
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
