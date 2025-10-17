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

// PATCH /api/admin/users - Update user (reassign manager, change role, etc.)
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
    const { userId, managerId, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Update the profile
    const updatedProfile = await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: {
        ...(managerId !== undefined && { managerId }),
        ...(role && { role }),
        ...(status && { status }),
      },
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
