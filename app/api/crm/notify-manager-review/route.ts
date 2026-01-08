import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/in-app-notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, customerName, managerId, managerName } = body;

    if (!customerId || !managerId) {
      return NextResponse.json(
        { error: "Missing required fields: customerId and managerId" },
        { status: 400 }
      );
    }

    // Get the current user (the one requesting the review)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requesterName = currentUser.name || currentUser.email;

    // Create notification for the manager
    const notificationResult = await createNotification({
      userId: managerId,
      type: "STATUS_CHANGED",
      title: "Customer Review Requested",
      message: `${requesterName} has flagged ${customerName || "a customer"} as unresponsive and needs your review.`,
      data: {
        customerId,
        customerName,
        requestedBy: currentUser.id,
        requestedByName: requesterName,
        reason: "customer_not_responsive",
      },
      actionUrl: `/en/crm/customers/${customerId}`,
    });

    // Also log an activity on the customer timeline
    await prisma.activity.create({
      data: {
        customerId,
        type: "note",
        subject: "Manager Review Requested",
        description: `${requesterName} flagged this customer as unresponsive and requested manager review from ${managerName || "assigned manager"}.`,
        userId: currentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      notificationSent: notificationResult.success,
      emailSent: notificationResult.emailSent,
    });
  } catch (error) {
    console.error("Error sending manager review notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
