import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/users - Get all users (owners/directors only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only owners and directors can access this endpoint
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only owners and directors can access user management." },
        { status: 403 }
      );
    }

    // Fetch all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get manager names for users who have managerId
    const usersWithManagerNames = await Promise.all(
      users.map(async (user) => {
        let managerName = null;
        if (user.profile?.managerId) {
          const manager = await prisma.user.findUnique({
            where: { id: user.profile.managerId },
            include: { profile: true },
          });
          if (manager?.profile) {
            managerName = `${manager.profile.firstName || ""} ${manager.profile.lastName || ""}`.trim() || manager.name;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          profile: user.profile ? {
            id: user.profile.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phone: user.profile.phone,
            zipcode: user.profile.zipcode,
            role: user.profile.role,
            repCode: user.profile.repCode,
            managerId: user.profile.managerId,
            managerName,
            status: user.profile.status,
            salespersonCode: user.profile.salespersonCode,
            member: user.profile.member,
          } : null,
        };
      })
    );

    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      reps: users.filter((u) => u.profile?.role === "salesperson").length,
      managers: users.filter((u) => u.profile?.role === "manager").length,
      freelancers: users.filter((u) => u.profile?.status === "freelancer").length,
      owners: users.filter((u) => u.profile?.role === "owner").length,
      directors: users.filter((u) => u.profile?.role === "director").length,
      banned: users.filter((u) => u.profile?.accountStatus === "banned").length,
      timeout: users.filter((u) => u.profile?.accountStatus === "timeout").length,
    };

    return NextResponse.json({ users: usersWithManagerNames, stats });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user (reassign manager, change role, status, permissions, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only owners and directors can access this endpoint
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      userId,
      managerId,
      role,
      status,
      accountStatus,
      banReason,
      timeoutUntil,
      mutedUntil,
      canAccessCRM,
      canAccessInventory,
      canAccessConfigurator,
      canAccessCalendar,
      canAccessReports,
      canManageUsers,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-ban or self-demotion
    if (userId === currentUser.id && (accountStatus === "banned" || role === "salesperson")) {
      return NextResponse.json(
        { error: "You cannot ban yourself or demote your own role" },
        { status: 400 }
      );
    }

    // Find the user's profile
    const userProfile = await prisma.userProfile.findFirst({
      where: { userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};

    if (managerId !== undefined) updateData.managerId = managerId;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (accountStatus) updateData.accountStatus = accountStatus;
    if (banReason !== undefined) updateData.banReason = banReason;
    if (timeoutUntil !== undefined) updateData.timeoutUntil = timeoutUntil ? new Date(timeoutUntil) : null;
    if (mutedUntil !== undefined) updateData.mutedUntil = mutedUntil ? new Date(mutedUntil) : null;
    if (canAccessCRM !== undefined) updateData.canAccessCRM = canAccessCRM;
    if (canAccessInventory !== undefined) updateData.canAccessInventory = canAccessInventory;
    if (canAccessConfigurator !== undefined) updateData.canAccessConfigurator = canAccessConfigurator;
    if (canAccessCalendar !== undefined) updateData.canAccessCalendar = canAccessCalendar;
    if (canAccessReports !== undefined) updateData.canAccessReports = canAccessReports;
    if (canManageUsers !== undefined) updateData.canManageUsers = canManageUsers;

    // Update the profile
    const updatedProfile = await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user (owners/directors only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only owners and directors can delete users
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user (CASCADE will delete profile, sessions, accounts)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
