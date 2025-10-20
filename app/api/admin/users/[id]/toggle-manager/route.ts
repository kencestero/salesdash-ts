import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/users/[id]/toggle-manager
 *
 * Toggles whether a user appears in the "Available Managers" dropdown during signup.
 *
 * Requirements:
 * - User must be owner or director
 * - Target user must have role: owner, director, or manager
 *
 * Body: { isAvailableAsManager: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get current user's profile
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // 3. Authorization check - Only owners and directors can manage this
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only owners and directors can manage available managers." },
        { status: 403 }
      );
    }

    // 4. Get request body
    const body = await req.json();
    const { isAvailableAsManager } = body;

    if (typeof isAvailableAsManager !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request. isAvailableAsManager must be a boolean." },
        { status: 400 }
      );
    }

    // 5. Get target user
    const { id } = params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!targetUser?.profile) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // 6. Validate target user has appropriate role
    if (!["owner", "director", "manager"].includes(targetUser.profile.role)) {
      return NextResponse.json(
        { error: "Only users with role owner, director, or manager can be available as managers." },
        { status: 400 }
      );
    }

    // 7. Update the flag
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: id },
      data: {
        isAvailableAsManager,
      },
    });

    console.log(`✅ Manager availability updated for ${targetUser.email}: ${isAvailableAsManager}`);

    return NextResponse.json({
      success: true,
      message: `Manager availability ${isAvailableAsManager ? "enabled" : "disabled"} for ${targetUser.name || targetUser.email}`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        isAvailableAsManager: updatedProfile.isAvailableAsManager,
      },
    });

  } catch (error) {
    console.error("❌ Error toggling manager availability:", error);
    return NextResponse.json(
      { error: "Failed to update manager availability" },
      { status: 500 }
    );
  }
}
