"use client";

/**
 * CRM Dashboard View (Client Component)
 * Real-time manager command center
 */

import { useState, useEffect, useCallback } from "react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Flame, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/crm/dashboard/stat-card";
import { TeamPerformance } from "@/components/crm/dashboard/team-performance";
import { HotLeads } from "@/components/crm/dashboard/hot-leads";
import { ActivityFeed } from "@/components/crm/dashboard/activity-feed";
import { toast } from "@/components/ui/use-toast";

interface DashboardViewProps {
  session: Session;
}

interface DashboardData {
  overview: {
    totalLeads: number;
    newLeadsToday: number;
    appliedToday: number;
    avgResponseTime: number | null;
  };
  leadsByStatus: Record<string, number>;
  leadsByTemperature: Record<string, number>;
  leadsByPriority: Record<string, number>;
  hotLeads: any[];
  staleLeads: any[];
  teamPerformance: any[];
  recentActivities: any[];
}

export default function DashboardView({ session }: DashboardViewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/crm/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);

      toast({
        title: "Error",
        description: "Failed to load dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle lead click
  const handleLeadClick = (leadId: string) => {
    // TODO: Navigate to customer detail page
    console.log("Navigate to customer:", leadId);
    // window.location.href = `/en/crm/customers/${leadId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Failed to load dashboard</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Your team's performance at a glance
          </p>
        </div>

        <Button onClick={fetchData} disabled={isLoading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={data.overview.totalLeads}
          icon={Users}
        />
        <StatCard
          title="Hot Leads"
          value={data.leadsByTemperature.hot || 0}
          icon={Flame}
          className="border-red-200"
        />
        <StatCard
          title="New Today"
          value={data.overview.newLeadsToday}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Response"
          value={
            data.overview.avgResponseTime
              ? `${data.overview.avgResponseTime}m`
              : "N/A"
          }
          icon={Clock}
        />
      </div>

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Team Performance (2/3 width) */}
        <div className="lg:col-span-2">
          <TeamPerformance team={data.teamPerformance} />
        </div>

        {/* Right Column - Hot Leads (1/3 width) */}
        <div className="lg:col-span-1">
          <HotLeads leads={data.hotLeads} onLeadClick={handleLeadClick} />
        </div>
      </div>

      {/* Bottom Section - Activity Feed */}
      <div className="grid grid-cols-1">
        <ActivityFeed activities={data.recentActivities} />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Applied</p>
          <p className="text-2xl font-bold mt-1">
            {data.leadsByStatus.applied || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {data.leadsByStatus.approved || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Won</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {data.leadsByStatus.won || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Dead</p>
          <p className="text-2xl font-bold mt-1 text-gray-600">
            {data.leadsByStatus.dead || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
