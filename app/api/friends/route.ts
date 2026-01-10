import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends - Get user's friends list
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all accepted friendships (bidirectional)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUser.id, status: "accepted" },
          { friendId: currentUser.id, status: "accepted" }
        ]
      },
      include: {
        user: {
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
            },
            salesStats: {
              select: {
                totalUnitsSold: true,
                monthlyUnits: true
              }
            }
          }
        },
        friend: {
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
            },
            salesStats: {
              select: {
                totalUnitsSold: true,
                monthlyUnits: true
              }
            }
          }
        }
      }
    });

    // Format friends list (return the other user in each friendship)
    const friends = friendships.map(f => {
      const friendData = f.userId === currentUser.id ? f.friend : f.user;
      return {
        friendshipId: f.id,
        id: friendData.id,
        name: friendData.name,
        email: friendData.email,
        image: friendData.profile?.avatarUrl || friendData.image,
        role: friendData.profile?.role,
        repCode: friendData.profile?.repCode,
        totalUnitsSold: friendData.salesStats?.totalUnitsSold || 0,
        monthlyUnits: friendData.salesStats?.monthlyUnits || 0,
        friendsSince: f.createdAt
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

// POST /api/friends - Send friend request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
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

    if (currentUser.id === friendId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    // Check if friend exists
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, name: true }
    });

    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if blocked (either direction)
    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, blockedId: friendId },
          { userId: friendId, blockedId: currentUser.id }
        ]
      }
    });

    if (blocked) {
      return NextResponse.json(
        { error: "Cannot send friend request to this user" },
        { status: 403 }
      );
    }

    // Check for existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUser.id, friendId: friendId },
          { userId: friendId, friendId: currentUser.id }
        ]
      }
    });

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json(
          { error: "Already friends with this user" },
          { status: 400 }
        );
      }
      if (existing.status === "pending") {
        return NextResponse.json(
          { error: "Friend request already pending" },
          { status: 400 }
        );
      }
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        userId: currentUser.id,
        friendId: friendId,
        status: "pending"
      }
    });

    return NextResponse.json({
      message: "Friend request sent",
      friendship: {
        id: friendship.id,
        status: friendship.status
      }
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}
