"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Activity,
  Briefcase,
  Calendar,
  Award,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface ProgressionViewProps {
  session: Session;
  role: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  repCode: string;
  stats: {
    totalUnitsSold: number;
    monthlyUnits: number;
    yearlyUnits: number;
    totalRevenue: number;
    totalProfit: number;
    avgDealSize: number;
    lastSaleAt: string | null;
  };
  goal: {
    targetUnits: number;
    actualUnits: number;
    progress: number;
    isOnTrack: boolean;
  } | null;
  activity: {
    last30Days: number;
  };
  pipeline: {
    deals: number;
    value: number;
  };
}

interface ProgressionData {
  teamMembers: TeamMember[];
  summary: {
    totalUnits: number;
    totalRevenue: number;
    totalProfit: number;
    totalGoals: number;
    goalsOnTrack: number;
    avgGoalProgress: number;
    totalPipelineDeals: number;
    totalPipelineValue: number;
  };
  period: {
    month: number;
    year: number;
    monthName: string;
  };
}

export default function ProgressionView({ session, role }: ProgressionViewProps) {
  const [data, setData] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/progression");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load progression data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRoleColor = (memberRole: string) => {
    switch (memberRole) {
      case "owner":
        return "bg-amber-500/10 text-amber-600";
      case "director":
        return "bg-purple-500/10 text-purple-600";
      case "manager":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-[#E96114]/10 text-[#E96114]";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || "No data available"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Team Progression</h1>
          <p className="text-default-500">
            {data.period.monthName} {data.period.year} Performance
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Progression Dashboard Help</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-default-600 space-y-4">
              <p>
                The Progression Dashboard gives you full visibility into your team's
                performance. Here's what each section shows:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Monthly Units:</strong> Total units sold this month across all team members</li>
                <li><strong>Revenue:</strong> Total revenue generated (visible to managers+ only)</li>
                <li><strong>Goal Progress:</strong> Average progress toward monthly goals</li>
                <li><strong>Pipeline:</strong> Active deals in progress</li>
              </ul>
              <p>
                <strong>Note:</strong> Financial data is only visible to managers and above.
                Regular reps only see unit counts.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#E96114]/10">
                <Target className="w-6 h-6 text-[#E96114]" />
              </div>
              <div>
                <p className="text-sm text-default-500">Monthly Units</p>
                <p className="text-2xl font-bold">{data.summary.totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Avg Goal Progress</p>
                <p className="text-2xl font-bold">{data.summary.avgGoalProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-default-500">Pipeline</p>
                <p className="text-2xl font-bold">
                  {data.summary.totalPipelineDeals} deals
                </p>
                <p className="text-xs text-default-400">
                  {formatCurrency(data.summary.totalPipelineValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E96114]" />
            Goals Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-default-500">Goals Set</p>
              <p className="text-xl font-bold">
                {data.summary.totalGoals} / {data.teamMembers.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">On Track</p>
              <p className="text-xl font-bold text-green-600">
                {data.summary.goalsOnTrack}
              </p>
            </div>
            <div>
              <p className="text-sm text-default-500">Behind</p>
              <p className="text-xl font-bold text-red-600">
                {data.summary.totalGoals - data.summary.goalsOnTrack}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#09213C]" />
            Team Members ({data.teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-default-600">Rep</th>
                  <th className="text-center py-3 px-4 font-medium text-default-600">Monthly Units</th>
                  <th className="text-center py-3 px-4 font-medium text-default-600">Goal Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-default-600">Revenue</th>
                  <th className="text-center py-3 px-4 font-medium text-default-600">Activity</th>
                  <th className="text-center py-3 px-4 font-medium text-default-600">Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {data.teamMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className={`border-b last:border-0 ${index < 3 ? "bg-[#E96114]/5" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.image || undefined} />
                            <AvatarFallback className="bg-[#09213C] text-white">
                              {member.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E96114] text-white text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-default-900">{member.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                              {member.role}
                            </Badge>
                            <span className="text-xs text-default-400">{member.repCode}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-lg font-bold text-[#E96114]">
                        {member.stats.monthlyUnits}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {member.goal ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{member.goal.actualUnits}/{member.goal.targetUnits}</span>
                            <span className={member.goal.isOnTrack ? "text-green-600" : "text-red-600"}>
                              {member.goal.progress}%
                            </span>
                          </div>
                          <Progress
                            value={member.goal.progress}
                            className={`h-2 ${member.goal.isOnTrack ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
                          />
                        </div>
                      ) : (
                        <span className="text-default-400 text-sm">No goal set</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium">{formatCurrency(member.stats.totalRevenue)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="w-4 h-4 text-default-400" />
                        <span>{member.activity.last30Days}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div>
                        <span className="font-medium">{member.pipeline.deals}</span>
                        <span className="text-default-400 text-sm ml-1">deals</span>
                      </div>
                      <div className="text-xs text-default-400">
                        {formatCurrency(member.pipeline.value)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
