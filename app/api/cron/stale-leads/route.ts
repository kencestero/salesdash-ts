/**
 * Stale Leads Alert Cron Job
 * Detects leads with 7+ days no activity and alerts managers
 *
 * Vercel Cron: Daily at 9:00 AM UTC (1 hour after daily digest)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStaleLeads } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("⚠️ Starting stale leads detection cron job...");

    // Get all managers
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

    console.log(`Found ${managers.length} managers to check`);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let sentCount = 0;
    let errorCount = 0;

    // Check stale leads for each manager's team
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

        // Add manager's own ID
        const relevantUserIds = [...teamMemberIds, manager.id];

        // Find stale leads (7+ days no activity, not won or dead)
        const staleLeads = await prisma.customer.findMany({
          where: {
            assignedToId: { in: relevantUserIds },
            status: { notIn: ["won", "dead"] },
            OR: [
              { lastActivityAt: { lt: sevenDaysAgo } },
              { lastActivityAt: null },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            leadScore: true,
            lastActivityAt: true,
            createdAt: true,
            assignedToId: true,
          },
          orderBy: {
            leadScore: "desc", // Prioritize high-value leads
          },
        });

        // Skip if no stale leads
        if (staleLeads.length === 0) {
          console.log(`✅ No stale leads for ${manager.email}`);
          continue;
        }

        // Calculate days since contact and get rep names
        const staleLeadsWithDetails = await Promise.all(
          staleLeads.map(async (lead) => {
            const assignedRep = await prisma.user.findUnique({
              where: { id: lead.assignedToId! },
              include: { profile: true },
            });

            const lastContact = lead.lastActivityAt || lead.createdAt;
            const daysSinceContact = Math.floor(
              (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              leadName: `${lead.firstName} ${lead.lastName}`,
              repName: assignedRep?.profile?.firstName || assignedRep?.email || "Unknown",
              daysSinceContact,
              leadScore: lead.leadScore,
            };
          })
        );

        // Send notification
        await notifyStaleLeads({
          managerEmail: manager.email,
          managerName: manager.profile.firstName || manager.email,
          staleLeads: staleLeadsWithDetails,
        });

        sentCount++;
        console.log(`✅ Sent stale leads alert to ${manager.email} (${staleLeads.length} leads)`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to send stale leads alert to ${manager.email}:`, error);
      }
    }

    console.log(
      `⚠️ Stale leads cron job completed: ${sentCount} sent, ${errorCount} errors`
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("❌ Stale leads cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to send stale leads alerts" },
      { status: 500 }
    );
  }
}
