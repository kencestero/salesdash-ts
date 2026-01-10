import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/progression - Get team progression data for managers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: { select: { role: true } },
        managedTeam: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = currentUser.profile?.role || "salesperson";

    // Only managers and above can access progression
    if (!["owner", "director", "manager"].includes(role)) {
      return NextResponse.json(
        { error: "Only managers and above can access progression data" },
        { status: 403 }
      );
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Determine which users to include
    let userIds: string[] = [];

    if (["owner", "director"].includes(role)) {
      // Get all active users
      const allUsers = await prisma.userProfile.findMany({
        where: { isActive: true },
        select: { userId: true }
      });
      userIds = allUsers.map(u => u.userId);
    } else if (currentUser.managedTeam) {
      // Get team members
      userIds = currentUser.managedTeam.members.map(m => m.user.id);
    }

    if (userIds.length === 0) {
      return NextResponse.json({
        teamMembers: [],
        summary: {
          totalUnits: 0,
          totalRevenue: 0,
          totalProfit: 0,
          avgGoalProgress: 0,
          totalGoals: 0,
          goalsOnTrack: 0
        }
      });
    }

    // Get user details with stats
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            repCode: true,
            avatarUrl: true
          }
        },
        salesStats: true,
        monthlyGoals: {
          where: {
            month: currentMonth,
            year: currentYear
          }
        }
      }
    });

    // Get activity counts for each user (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await prisma.activity.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    const activityMap = new Map(activities.map(a => [a.userId, a._count.id]));

    // Get deals in pipeline (status not won/lost)
    const pipelines = await prisma.deal.groupBy({
      by: ["assignedToId"],
      where: {
        assignedToId: { in: userIds },
        status: { notIn: ["won", "lost", "closed"] }
      },
      _count: { id: true },
      _sum: { finalPrice: true }
    });

    const pipelineMap = new Map(
      pipelines.map(p => [p.assignedToId, { count: p._count.id, value: p._sum.finalPrice || 0 }])
    );

    // Format team member data
    const teamMembers = users.map(user => {
      const goal = user.monthlyGoals[0];
      const stats = user.salesStats;
      const pipeline = pipelineMap.get(user.id) || { count: 0, value: 0 };
      const activityCount = activityMap.get(user.id) || 0;

      return {
        id: user.id,
        name: user.name || `${user.profile?.firstName} ${user.profile?.lastName}`.trim(),
        email: user.email,
        image: user.profile?.avatarUrl || user.image,
        role: user.profile?.role,
        repCode: user.profile?.repCode,
        stats: {
          totalUnitsSold: stats?.totalUnitsSold || 0,
          monthlyUnits: stats?.monthlyUnits || 0,
          yearlyUnits: stats?.yearlyUnits || 0,
          totalRevenue: stats?.totalRevenue || 0,
          totalProfit: stats?.totalProfit || 0,
          avgDealSize: stats?.avgDealSize || 0,
          lastSaleAt: stats?.lastSaleAt
        },
        goal: goal ? {
          targetUnits: goal.targetUnits,
          actualUnits: goal.actualUnits,
          progress: goal.targetUnits > 0 ? Math.round((goal.actualUnits / goal.targetUnits) * 100) : 0,
          isOnTrack: goal.actualUnits >= (goal.targetUnits * (now.getDate() / 30)) // Simple on-track check
        } : null,
        activity: {
          last30Days: activityCount
        },
        pipeline: {
          deals: pipeline.count,
          value: pipeline.value
        }
      };
    });

    // Calculate summary
    const summary = {
      totalUnits: teamMembers.reduce((sum, m) => sum + m.stats.monthlyUnits, 0),
      totalRevenue: teamMembers.reduce((sum, m) => sum + m.stats.totalRevenue, 0),
      totalProfit: teamMembers.reduce((sum, m) => sum + m.stats.totalProfit, 0),
      totalGoals: teamMembers.filter(m => m.goal).length,
      goalsOnTrack: teamMembers.filter(m => m.goal?.isOnTrack).length,
      avgGoalProgress: teamMembers.filter(m => m.goal).length > 0
        ? Math.round(
            teamMembers
              .filter(m => m.goal)
              .reduce((sum, m) => sum + (m.goal?.progress || 0), 0) /
            teamMembers.filter(m => m.goal).length
          )
        : 0,
      totalPipelineDeals: teamMembers.reduce((sum, m) => sum + m.pipeline.deals, 0),
      totalPipelineValue: teamMembers.reduce((sum, m) => sum + m.pipeline.value, 0)
    };

    // Sort by monthly units (top performers first)
    teamMembers.sort((a, b) => b.stats.monthlyUnits - a.stats.monthlyUnits);

    return NextResponse.json({
      teamMembers,
      summary,
      period: {
        month: currentMonth,
        year: currentYear,
        monthName: new Date(currentYear, currentMonth - 1).toLocaleString("default", { month: "long" })
      }
    });
  } catch (error) {
    console.error("Error fetching progression:", error);
    return NextResponse.json(
      { error: "Failed to fetch progression data" },
      { status: 500 }
    );
  }
}
