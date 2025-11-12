/**
 * Daily Digest Cron Job
 * Sends daily summary emails to managers with team stats
 *
 * Vercel Cron: Daily at 8:00 AM UTC
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyDigest } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this automatically)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📊 Starting daily digest cron job...");

    // Get all managers (owners, directors, managers)
    const managers = await prisma.user.findMany({
      where: {
        profile: {
          role: {
            in: ["owner", "director", "manager"],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log(`Found ${managers.length} managers to notify`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sentCount = 0;
    let errorCount = 0;

    // Send digest to each manager
    for (const manager of managers) {
      try {
        if (!manager.email || !manager.profile) continue;

        // Get team members for this manager
        const teamMembers = await prisma.user.findMany({
          where: {
            profile: {
              managerId: manager.id,
            },
          },
          select: {
            id: true,
          },
        });

        const teamMemberIds = teamMembers.map((m) => m.id);

        // Add manager's own ID (managers see their own leads too)
        const relevantUserIds = [...teamMemberIds, manager.id];

        // Get today's stats
        const [
          newLeadsToday,
          appliedToday,
          wonToday,
          hotLeads,
          staleLeads,
          activities,
        ] = await Promise.all([
          // New leads today
          prisma.customer.count({
            where: {
              assignedToId: { in: relevantUserIds },
              createdAt: { gte: today },
            },
          }),

          // Applied today
          prisma.customer.count({
            where: {
              assignedToId: { in: relevantUserIds },
              applied: true,
              updatedAt: { gte: today },
            },
          }),

          // Won today
          prisma.customer.count({
            where: {
              assignedToId: { in: relevantUserIds },
              status: "won",
              updatedAt: { gte: today },
            },
          }),

          // Hot leads (score 70+)
          prisma.customer.count({
            where: {
              assignedToId: { in: relevantUserIds },
              leadScore: { gte: 70 },
              status: { notIn: ["won", "dead"] },
            },
          }),

          // Stale leads (7+ days no activity)
          prisma.customer.count({
            where: {
              assignedToId: { in: relevantUserIds },
              status: { notIn: ["won", "dead"] },
              OR: [
                { lastActivityAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                { lastActivityAt: null },
              ],
            },
          }),

          // Team activity today
          prisma.activity.findMany({
            where: {
              userId: { in: relevantUserIds },
              createdAt: { gte: today },
            },
            select: {
              userId: true,
            },
          }),
        ]);

        // Calculate activity count per rep
        const activityCountMap: Record<string, number> = {};
        activities.forEach((activity) => {
          activityCountMap[activity.userId] = (activityCountMap[activity.userId] || 0) + 1;
        });

        // Get rep names
        const teamActivity = await Promise.all(
          Object.entries(activityCountMap).map(async ([userId, count]) => {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              include: { profile: true },
            });

            return {
              repName: user?.profile?.firstName || user?.email || "Unknown",
              activitiesCount: count,
            };
          })
        );

        // Sort by activity count
        teamActivity.sort((a, b) => b.activitiesCount - a.activitiesCount);

        // Send digest email
        await sendDailyDigest({
          managerEmail: manager.email,
          managerName: manager.profile.firstName || manager.email,
          stats: {
            newLeadsToday,
            appliedToday,
            wonToday,
            hotLeads,
            staleLeads,
            teamActivity: teamActivity.slice(0, 10), // Top 10 most active reps
          },
        });

        sentCount++;
        console.log(`✅ Sent digest to ${manager.email}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to send digest to ${manager.email}:`, error);
      }
    }

    console.log(
      `📊 Daily digest cron job completed: ${sentCount} sent, ${errorCount} errors`
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("❌ Daily digest cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to send daily digests" },
      { status: 500 }
    );
  }
}
