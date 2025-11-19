import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/analytics/dashboard - Log a dashboard visit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    // Log the dashboard visit
    await prisma.dashboardVisit.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error logging dashboard visit:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/analytics/dashboard - Get dashboard analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Time range: last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get unique users in last 24 hours
    const uniqueUserVisits = await prisma.dashboardVisit.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: since },
      },
    });

    const usersLast24h = uniqueUserVisits.length;

    // Get visits per hour for the last 24 hours
    const visitsPerHour = await prisma.$queryRaw<
      { hour: string; count: bigint }[]
    >`
      SELECT
        to_char(date_trunc('hour', "createdAt"), 'HH24:00') as hour,
        COUNT(*) as count
      FROM "DashboardVisit"
      WHERE "createdAt" >= ${since}
      GROUP BY date_trunc('hour', "createdAt")
      ORDER BY date_trunc('hour', "createdAt")
    `;

    // Convert bigint to number for JSON serialization
    const formattedVisitsPerHour = visitsPerHour.map((v) => ({
      hour: v.hour,
      count: Number(v.count),
    }));

    // Get total visits in last 24 hours
    const totalVisits = await prisma.dashboardVisit.count({
      where: {
        createdAt: { gte: since },
      },
    });

    // Get visits in last 30 minutes for "live" indicator
    const last30Min = new Date(Date.now() - 30 * 60 * 1000);
    const visitsLast30Min = await prisma.dashboardVisit.count({
      where: {
        createdAt: { gte: last30Min },
      },
    });

    return NextResponse.json({
      usersLast24h,
      totalVisits,
      visitsLast30Min,
      visitsPerHour: formattedVisitsPerHour,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error.message },
      { status: 500 }
    );
  }
}
