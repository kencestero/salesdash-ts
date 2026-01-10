import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/blocked - Get list of blocked users
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

    const blockedUsers = await prisma.blockedUser.findMany({
      where: { userId: currentUser.id },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: {
              select: {
                role: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const blocked = blockedUsers.map(b => ({
      blockId: b.id,
      id: b.blocked.id,
      name: b.blocked.name,
      email: b.blocked.email,
      image: b.blocked.profile?.avatarUrl || b.blocked.image,
      role: b.blocked.profile?.role,
      reason: b.reason,
      blockedAt: b.createdAt
    }));

    return NextResponse.json({ blocked });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked users" },
      { status: 500 }
    );
  }
}

// POST /api/blocked - Block a user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    if (currentUser.id === userId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userToBlock) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already blocked
    const existing = await prisma.blockedUser.findUnique({
      where: {
        userId_blockedId: {
          userId: currentUser.id,
          blockedId: userId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 400 }
      );
    }

    // Use transaction to block and remove any friendships
    await prisma.$transaction(async (tx) => {
      // Create block
      await tx.blockedUser.create({
        data: {
          userId: currentUser.id,
          blockedId: userId,
          reason: reason || null
        }
      });

      // Remove any existing friendships (both directions)
      await tx.friendship.deleteMany({
        where: {
          OR: [
            { userId: currentUser.id, friendId: userId },
            { userId: userId, friendId: currentUser.id }
          ]
        }
      });
    });

    return NextResponse.json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}

// DELETE /api/blocked - Unblock a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get("blockId");

    if (!blockId) {
      return NextResponse.json(
        { error: "Block ID is required" },
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

    // Find the block (must belong to current user)
    const block = await prisma.blockedUser.findFirst({
      where: {
        id: blockId,
        userId: currentUser.id
      }
    });

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    await prisma.blockedUser.delete({
      where: { id: blockId }
    });

    return NextResponse.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user" },
      { status: 500 }
    );
  }
}
