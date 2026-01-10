"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Award, Trophy, Lock, ChevronRight } from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirement: number | null;
  trailerType: string | null;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  progressText: string;
}

interface BadgesResponse {
  badges: BadgeData[];
  grouped: Record<string, BadgeData[]>;
  summary: {
    total: number;
    earned: number;
    progress: number;
  };
}

const categoryLabels: Record<string, string> = {
  sales_milestone: "Sales Milestones",
  trailer_type: "Trailer Types",
  trailer_size: "Trailer Sizes",
  certification: "Certifications",
  experience: "Experience"
};

export default function BadgesCard() {
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/badges");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch badges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const earnedBadges = data.badges.filter(b => b.earned);
  const nextBadges = data.badges.filter(b => !b.earned && b.progress > 0).slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-none mb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#E96114]" />
          Badges
          <Badge className="bg-[#E96114]/10 text-[#E96114] ml-2">
            {data.summary.earned}/{data.summary.total}
          </Badge>
        </CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#E96114]" />
                All Badges ({data.summary.earned}/{data.summary.total} earned)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {Object.entries(data.grouped).map(([category, badges]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-default-600 mb-3">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {badges.map(badge => (
                      <div
                        key={badge.id}
                        className={`p-3 rounded-lg border ${
                          badge.earned
                            ? "border-[#E96114]/50 bg-[#E96114]/5"
                            : "border-default-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{badge.name}</p>
                            {badge.earned && (
                              <p className="text-xs text-green-600">Earned!</p>
                            )}
                          </div>
                          {!badge.earned && <Lock className="w-4 h-4 text-default-400" />}
                        </div>
                        <p className="text-xs text-default-500 mb-2">{badge.description}</p>
                        {!badge.earned && badge.progress > 0 && (
                          <div className="space-y-1">
                            <Progress value={badge.progress} className="h-1.5" />
                            <p className="text-xs text-default-400">{badge.progressText}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-default-500">Overall Progress</span>
            <span className="font-medium">{data.summary.progress}%</span>
          </div>
          <Progress value={data.summary.progress} className="h-2" />
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-default-500 mb-2">Earned</p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.slice(0, 8).map(badge => (
                <div
                  key={badge.id}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${badge.color}20` }}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
              {earnedBadges.length > 8 && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-default-100 text-sm font-medium text-default-600">
                  +{earnedBadges.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next to Earn */}
        {nextBadges.length > 0 && (
          <div>
            <p className="text-sm text-default-500 mb-2">Next to Earn</p>
            <div className="space-y-2">
              {nextBadges.map(badge => (
                <div key={badge.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm opacity-60"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{badge.name}</p>
                    <Progress value={badge.progress} className="h-1 mt-1" />
                  </div>
                  <span className="text-xs text-default-400">{Math.round(badge.progress)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {earnedBadges.length === 0 && nextBadges.length === 0 && (
          <div className="text-center py-6 text-default-400">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start selling to earn badges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
