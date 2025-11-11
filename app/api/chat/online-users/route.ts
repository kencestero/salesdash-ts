import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/chat/online-users - Get all registered users with online status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
            lastSeen: true,
            isOnline: true,
            isActive: true,
            accountStatus: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filter out inactive users and calculate online status
    // User is online if lastSeen < 2 minutes ago
    const now = new Date();
    const usersWithStatus = users
      .filter((user) => {
        // Only show active users
        return user.profile?.isActive !== false && user.profile?.accountStatus === "active";
      })
      .map((user) => {
        const lastSeen = user.profile?.lastSeen || new Date(0);
        const minutesSinceLastSeen = (now.getTime() - lastSeen.getTime()) / 60000;
        const isOnline = minutesSinceLastSeen < 2;

        return {
          id: user.id,
          name: user.name || `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || user.email,
          email: user.email,
          avatar: user.profile?.avatarUrl || user.image || null,
          role: user.profile?.role || "salesperson",
          lastSeen: user.profile?.lastSeen || new Date(0),
          isOnline,
          status: isOnline ? "online" : "offline",
        };
      });

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
