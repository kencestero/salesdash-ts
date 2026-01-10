import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/search - Search for users (for friend requests, etc.)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get users the current user has blocked
    const blockedByMe = await prisma.blockedUser.findMany({
      where: { userId: currentUser.id },
      select: { blockedId: true }
    });
    const blockedByMeIds = blockedByMe.map(b => b.blockedId);

    // Get users who have blocked the current user
    const blockedMe = await prisma.blockedUser.findMany({
      where: { blockedId: currentUser.id },
      select: { userId: true }
    });
    const blockedMeIds = blockedMe.map(b => b.userId);

    // Combine blocked IDs
    const excludeIds = [...new Set([...blockedByMeIds, ...blockedMeIds, currentUser.id])];

    // Search users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: excludeIds } },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              {
                profile: {
                  OR: [
                    { repCode: { contains: query, mode: "insensitive" } },
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } }
                  ]
                }
              }
            ]
          },
          {
            profile: {
              isActive: true,
              accountStatus: "active"
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        profile: {
          select: {
            role: true,
            repCode: true,
            avatarUrl: true
          }
        }
      },
      take: limit
    });

    // Check existing friendship status for each user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUser.id, friendId: { in: users.map(u => u.id) } },
          { friendId: currentUser.id, userId: { in: users.map(u => u.id) } }
        ]
      }
    });

    const friendshipMap = new Map();
    for (const f of friendships) {
      const otherUserId = f.userId === currentUser.id ? f.friendId : f.userId;
      const direction = f.userId === currentUser.id ? "outgoing" : "incoming";
      friendshipMap.set(otherUserId, { status: f.status, direction, id: f.id });
    }

    const results = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.profile?.avatarUrl || u.image,
      role: u.profile?.role,
      repCode: u.profile?.repCode,
      friendshipStatus: friendshipMap.get(u.id)?.status || null,
      friendshipDirection: friendshipMap.get(u.id)?.direction || null,
      friendshipId: friendshipMap.get(u.id)?.id || null
    }));

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
