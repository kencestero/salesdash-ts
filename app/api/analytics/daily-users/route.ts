import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/analytics/daily-users - Get count of unique users who logged in today
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get start of today in UTC
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get unique user IDs who visited today
    const dailyVisits = await prisma.dashboardVisit.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const uniqueUserCount = dailyVisits.length;

    // Get percentage change from yesterday
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const yesterdayVisits = await prisma.dashboardVisit.findMany({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lt: startOfToday,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const yesterdayCount = yesterdayVisits.length;
    let percentageChange = 0;
    let trend: "up" | "down" | "same" = "same";

    if (yesterdayCount > 0) {
      percentageChange = Math.round(((uniqueUserCount - yesterdayCount) / yesterdayCount) * 100);
      trend = uniqueUserCount > yesterdayCount ? "up" : uniqueUserCount < yesterdayCount ? "down" : "same";
    } else if (uniqueUserCount > 0) {
      trend = "up";
      percentageChange = 100;
    }

    return NextResponse.json({
      count: uniqueUserCount,
      percentageChange,
      trend,
      yesterdayCount,
    });
  } catch (error) {
    console.error("Error fetching daily users:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily users" },
      { status: 500 }
    );
  }
}
