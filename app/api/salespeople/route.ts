import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/salespeople
 * Returns all active salespeople with their manager info
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users with their profiles and manager info
    const users = await prisma.user.findMany({
      where: {
        profile: {
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            managerId: true,
            repCode: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Build a map of user IDs to names for manager lookup
    const userMap = new Map<string, string>();
    users.forEach((user) => {
      const displayName = user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.name || user.email || "Unknown";
      userMap.set(user.id, displayName);
    });

    // Format response with manager names
    const salespeople = users.map((user) => {
      const displayName = user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.name || user.email || "Unknown";

      const managerName = user.profile?.managerId
        ? userMap.get(user.profile.managerId) || null
        : null;

      return {
        id: user.id,
        name: displayName,
        email: user.email,
        role: user.profile?.role || "salesperson",
        repCode: user.profile?.repCode || null,
        managerId: user.profile?.managerId || null,
        managerName: managerName,
      };
    });

    return NextResponse.json({ salespeople });
  } catch (error: any) {
    console.error("Error fetching salespeople:", error);
    return NextResponse.json(
      { error: "Failed to fetch salespeople" },
      { status: 500 }
    );
  }
}
