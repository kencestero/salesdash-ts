import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAYPLAN_VERSION = "2026-01-11-v1";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { acknowledged } = body;

    if (!acknowledged) {
      return NextResponse.json(
        { error: "You must acknowledge the payplan to accept" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine if we should auto-enable the account
    // Only auto-set accountStatus="active" if current accountStatus === "disabled_declined_payplan"
    // Other disabled states (disabled_admin, disabled_inactivity_hold) require admin intervention
    const currentAccountStatus = user.profile.accountStatus || "active";
    const shouldAutoEnable = currentAccountStatus === "disabled_declined_payplan";

    // Update profile with payplan acceptance
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        payplanStatus: "ACCEPTED",
        payplanVersion: PAYPLAN_VERSION,
        payplanAcceptedAt: new Date(),
        // Only auto-enable if previously disabled due to declined payplan
        ...(shouldAutoEnable && { accountStatus: "active" }),
      },
    });

    // Get IP and user agent for audit log
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email || "",
        userName: user.name || user.profile.firstName || "",
        action: "PAYPLAN_ACCEPTED",
        entityType: "UserProfile",
        entityId: user.profile.id,
        oldValue: {
          payplanStatus: user.profile.payplanStatus,
          accountStatus: currentAccountStatus,
        },
        newValue: {
          payplanStatus: "ACCEPTED",
          payplanVersion: PAYPLAN_VERSION,
          accountStatus: shouldAutoEnable ? "active" : currentAccountStatus,
        },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payplan accepted successfully",
      accountEnabled: shouldAutoEnable,
    });
  } catch (error) {
    console.error("Error accepting payplan:", error);
    return NextResponse.json(
      { error: "Failed to accept payplan" },
      { status: 500 }
    );
  }
}
