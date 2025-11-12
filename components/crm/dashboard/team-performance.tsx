"use client";

/**
 * Team Performance Widget
 * Shows rep scorecards with key metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Trophy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepPerformance {
  repName: string;
  totalLeads: number;
  hotLeads: number;
  wonLeads: number;
  appliedLeads: number;
  avgScore: number;
  staleLeads: number;
  conversionRate: string;
  applyRate: string;
}

interface TeamPerformanceProps {
  team: RepPerformance[];
}

export function TeamPerformance({ team }: TeamPerformanceProps) {
  const topPerformer = team[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {team.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No team data available
          </p>
        ) : (
          team.map((rep, index) => {
            const initials = rep.repName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const isTopPerformer = index === 0;

            return (
              <div
                key={rep.repName}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border",
                  isTopPerformer && "bg-amber-50 border-amber-200"
                )}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {isTopPerformer ? (
                    <Trophy className="w-5 h-5 text-amber-500 mx-auto" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Rep Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{rep.repName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {rep.totalLeads} leads
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      Avg Score: {rep.avgScore}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Hot Leads */}
                  {rep.hotLeads > 0 && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      🔥 {rep.hotLeads}
                    </Badge>
                  )}

                  {/* Conversion Rate */}
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {rep.conversionRate}%
                  </Badge>

                  {/* Stale Leads Warning */}
                  {rep.staleLeads > 0 && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {rep.staleLeads}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
