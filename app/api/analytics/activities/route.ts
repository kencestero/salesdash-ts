import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/analytics/activities - Get activity analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date ranges
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Activity breakdown by type
    const activityByType = await prisma.activity.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Total activities
    const totalActivities = await prisma.activity.count();

    // Activities in last 7 days
    const recentActivities = await prisma.activity.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    });

    // Activities in last 30 days
    const monthlyActivities = await prisma.activity.count({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    });

    // Top 10 most recent activities with customer info
    const latestActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Activities by status (for tasks)
    const tasksByStatus = await prisma.activity.groupBy({
      by: ['status'],
      where: {
        type: 'task',
        status: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Daily activity trend (last 7 days)
    const dailyTrend = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Activity"
      WHERE "createdAt" >= ${last7Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Convert BigInt to Number for daily trend
    const dailyTrendData = Array.from({ length: 7 }, (_, i) => {
      const targetDate = new Date(last7Days);
      targetDate.setDate(targetDate.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayData = dailyTrend.find(d => {
        const dataDateStr = new Date(d.date).toISOString().split('T')[0];
        return dataDateStr === dateStr;
      });
      return {
        date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayData ? Number(dayData.count) : 0,
      };
    });

    // Format activity types
    const activityTypes = activityByType.map(item => ({
      type: item.type,
      count: item._count.id,
      percentage: totalActivities > 0
        ? Math.round((item._count.id / totalActivities) * 100)
        : 0,
    }));

    // Format task statuses
    const taskStatuses = tasksByStatus.map(item => ({
      status: item.status || 'unknown',
      count: item._count.id,
    }));

    return NextResponse.json({
      summary: {
        total: totalActivities,
        last7Days: recentActivities,
        last30Days: monthlyActivities,
      },
      byType: activityTypes,
      taskStatuses,
      dailyTrend: dailyTrendData,
      recent: latestActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        status: activity.status,
        createdAt: activity.createdAt,
        customer: activity.customer ? {
          id: activity.customer.id,
          name: `${activity.customer.firstName} ${activity.customer.lastName}`.trim(),
          email: activity.customer.email,
          phone: activity.customer.phone,
        } : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching activity analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity analytics" },
      { status: 500 }
    );
  }
}
