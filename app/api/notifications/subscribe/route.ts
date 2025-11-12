/**
 * Push Notification Subscription API
 * POST /api/notifications/subscribe - Subscribe to push notifications
 * DELETE /api/notifications/subscribe - Unsubscribe from push notifications
 * GET /api/notifications/subscribe - Get current subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Get current subscription
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

    return NextResponse.json({
      subscriptions: user.pushSubscriptions,
      hasSubscription: user.pushSubscriptions.length > 0,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// Subscribe to push notifications
export async function POST(req: NextRequest) {
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
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      // Update existing subscription
      const updated = await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          lastUsedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        subscription: updated,
      });
    }

    // Create new subscription
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    console.log(`✅ Push subscription created for ${user.email}`);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// Unsubscribe from push notifications
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint) {
      // Delete specific subscription
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: user.id,
          endpoint,
        },
      });
    } else {
      // Delete all subscriptions for this user
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: user.id,
        },
      });
    }

    console.log(`✅ Push subscription deleted for ${user.email}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
