import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/analytics/reports-snapshot - Get dashboard reports snapshot data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const last60Days = new Date(now);
    last60Days.setDate(last60Days.getDate() - 60);

    // 1. Total Active Users
    const totalUsers = await prisma.user.count({
      where: {
        profile: {
          isActive: true,
        },
      },
    });

    // Previous period for comparison
    const usersCreatedBefore30Days = await prisma.user.count({
      where: {
        profile: {
          isActive: true,
        },
        createdAt: {
          lt: last30Days,
        },
      },
    });

    // 2. Customer Activities (Calls, Emails, Meetings, Notes, Tasks)
    const totalActivities = await prisma.activity.count();

    const activitiesLast30Days = await prisma.activity.count({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    });

    const activitiesPrevious30Days = await prisma.activity.count({
      where: {
        createdAt: {
          gte: last60Days,
          lt: last30Days,
        },
      },
    });

    // 3. Conversations (Internal Messages)
    const totalMessages = await prisma.internalMessage.count();

    const messagesLast30Days = await prisma.internalMessage.count({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    });

    const messagesPrevious30Days = await prisma.internalMessage.count({
      where: {
        createdAt: {
          gte: last60Days,
          lt: last30Days,
        },
      },
    });

    // 4. New Users (Last 30 Days)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    });

    const newUsersPrevious = await prisma.user.count({
      where: {
        createdAt: {
          gte: last60Days,
          lt: last30Days,
        },
      },
    });

    // Get daily breakdown for charts (last 10 days)
    const last10Days = new Date(now);
    last10Days.setDate(last10Days.getDate() - 10);

    // Get daily activity counts for chart
    const dailyActivities = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Activity"
      WHERE "createdAt" >= ${last10Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const dailyMessages = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "internal_messages"
      WHERE "createdAt" >= ${last10Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const dailyNewUsers = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "User"
      WHERE "createdAt" >= ${last10Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // For "All Users" we'll show daily active users from DashboardVisit
    const dailyActiveUsers = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(DISTINCT "userId")::bigint as count
      FROM "DashboardVisit"
      WHERE "createdAt" >= ${last10Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Convert BigInt to Number and fill missing days with 0
    const createChartData = (
      dailyData: Array<{ date: Date; count: bigint }>,
      days: number = 10
    ): number[] => {
      return Array.from({ length: days }, (_, i) => {
        const targetDate = new Date(last10Days);
        targetDate.setDate(targetDate.getDate() + i);
        const dateStr = targetDate.toISOString().split('T')[0];
        const dayData = dailyData.find(d => {
          const dataDateStr = new Date(d.date).toISOString().split('T')[0];
          return dataDateStr === dateStr;
        });
        return dayData ? Number(dayData.count) : 0;
      });
    };

    return NextResponse.json({
      allUsers: {
        total: totalUsers,
        change: calculateChange(totalUsers, usersCreatedBefore30Days),
        chartData: createChartData(dailyActiveUsers),
      },
      activities: {
        total: totalActivities,
        change: calculateChange(activitiesLast30Days, activitiesPrevious30Days),
        chartData: createChartData(dailyActivities),
      },
      conversations: {
        total: totalMessages,
        change: calculateChange(messagesLast30Days, messagesPrevious30Days),
        chartData: createChartData(dailyMessages),
      },
      newUsers: {
        total: newUsers,
        change: calculateChange(newUsers, newUsersPrevious),
        chartData: createChartData(dailyNewUsers),
      },
    });
  } catch (error) {
    console.error("Error fetching reports snapshot:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports snapshot" },
      { status: 500 }
    );
  }
}
