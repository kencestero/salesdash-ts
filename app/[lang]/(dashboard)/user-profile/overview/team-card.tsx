"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users2, Crown, Trophy } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  repCode: string;
  memberRole: string;
  joinedAt: string;
  stats: {
    totalUnitsSold: number;
    monthlyUnits: number;
  };
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  color: string;
  memberCount: number;
  manager: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  };
  members: TeamMember[];
}

interface TeamData {
  teams: Team[];
  userTeam: Team | null;
  isManager?: boolean;
}

export default function TeamCard() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const team = data?.userTeam;

  if (!team) {
    return (
      <Card>
        <CardHeader className="border-none mb-2">
          <CardTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#09213C]" />
            My Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-default-400">
            <Users2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Not assigned to a team</p>
            <p className="text-sm">Contact your manager to join a team</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort members by monthly units
  const sortedMembers = [...team.members].sort(
    (a, b) => b.stats.monthlyUnits - a.stats.monthlyUnits
  );

  // Calculate team totals
  const totalMonthlyUnits = team.members.reduce(
    (sum, m) => sum + m.stats.monthlyUnits, 0
  );

  return (
    <Card>
      <CardHeader className="border-none mb-2">
        <CardTitle className="flex items-center gap-2">
          <Users2 className="w-5 h-5" style={{ color: team.color }} />
          {team.name}
          {data?.isManager && (
            <Badge className="bg-amber-500/10 text-amber-600 ml-2">
              <Crown className="w-3 h-3 mr-1" />
              Manager
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Team Stats */}
        <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ backgroundColor: `${team.color}10` }}>
          <div>
            <p className="text-sm text-default-500">Team Monthly Total</p>
            <p className="text-2xl font-bold" style={{ color: team.color }}>
              {totalMonthlyUnits} units
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-default-500">Members</p>
            <p className="text-lg font-bold">{team.memberCount}/10</p>
          </div>
        </div>

        {/* Manager */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10 mb-4">
          <Avatar className="h-10 w-10 ring-2 ring-amber-500">
            <AvatarImage src={team.manager.image || undefined} />
            <AvatarFallback className="bg-amber-500 text-white">
              {team.manager.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-default-900">{team.manager.name}</p>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs text-default-500">Team Manager</p>
          </div>
        </div>

        {/* Members Leaderboard */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-default-600 mb-2">This Month's Leaderboard</p>
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                index === 0 ? "bg-[#E96114]/10" : "hover:bg-default-50"
              }`}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image || undefined} />
                  <AvatarFallback className="bg-[#09213C] text-white text-xs">
                    {member.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {index === 0 && (
                  <Trophy className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-default-400">{member.repCode}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${index === 0 ? "text-[#E96114]" : "text-default-700"}`}>
                  {member.stats.monthlyUnits}
                </p>
                <p className="text-xs text-default-400">units</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
