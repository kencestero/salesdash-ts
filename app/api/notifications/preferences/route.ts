/**
 * Notification Preferences API
 * PATCH /api/notifications/preferences - Update notification preferences
 * GET /api/notifications/preferences - Get notification preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get notification preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pushSubscriptions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has no subscriptions, return defaults
    if (user.pushSubscriptions.length === 0) {
      return NextResponse.json({
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          notifyNewLeads: true,
          notifyStatusChanges: true,
          notifyStaleLeads: true,
          notifyDailyDigest: true,
        },
      });
    }

    // Return preferences from first subscription (they should all be the same)
    const sub = user.pushSubscriptions[0];
    return NextResponse.json({
      preferences: {
        emailNotifications: sub.emailNotifications,
        pushNotifications: sub.pushNotifications,
        notifyNewLeads: sub.notifyNewLeads,
        notifyStatusChanges: sub.notifyStatusChanges,
        notifyStaleLeads: sub.notifyStaleLeads,
        notifyDailyDigest: sub.notifyDailyDigest,
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// Update notification preferences
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      emailNotifications,
      pushNotifications,
      notifyNewLeads,
      notifyStatusChanges,
      notifyStaleLeads,
      notifyDailyDigest,
    } = body;

    // Update all subscriptions for this user
    const updateData: any = {};
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (notifyNewLeads !== undefined) updateData.notifyNewLeads = notifyNewLeads;
    if (notifyStatusChanges !== undefined) updateData.notifyStatusChanges = notifyStatusChanges;
    if (notifyStaleLeads !== undefined) updateData.notifyStaleLeads = notifyStaleLeads;
    if (notifyDailyDigest !== undefined) updateData.notifyDailyDigest = notifyDailyDigest;

    await prisma.pushSubscription.updateMany({
      where: {
        userId: user.id,
      },
      data: updateData,
    });

    console.log(`✅ Notification preferences updated for ${user.email}`);

    return NextResponse.json({
      success: true,
      preferences: updateData,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
