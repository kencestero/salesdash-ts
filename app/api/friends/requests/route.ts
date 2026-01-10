import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends/requests - Get pending friend requests
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

    // Get incoming requests (where current user is the friend)
    const incomingRequests = await prisma.friendship.findMany({
      where: {
        friendId: currentUser.id,
        status: "pending"
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
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get outgoing requests (where current user is the sender)
    const outgoingRequests = await prisma.friendship.findMany({
      where: {
        userId: currentUser.id,
        status: "pending"
      },
      include: {
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
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const incoming = incomingRequests.map(r => ({
      id: r.id,
      from: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        image: r.user.profile?.avatarUrl || r.user.image,
        role: r.user.profile?.role,
        repCode: r.user.profile?.repCode
      },
      sentAt: r.createdAt
    }));

    const outgoing = outgoingRequests.map(r => ({
      id: r.id,
      to: {
        id: r.friend.id,
        name: r.friend.name,
        email: r.friend.email,
        image: r.friend.profile?.avatarUrl || r.friend.image,
        role: r.friend.profile?.role,
        repCode: r.friend.profile?.repCode
      },
      sentAt: r.createdAt
    }));

    return NextResponse.json({
      incoming,
      outgoing,
      counts: {
        incoming: incoming.length,
        outgoing: outgoing.length
      }
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
}

// PATCH /api/friends/requests - Accept or decline a friend request
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'" },
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

    // Find the request (must be directed at current user)
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        friendId: currentUser.id,
        status: "pending"
      }
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      await prisma.friendship.update({
        where: { id: requestId },
        data: { status: "accepted" }
      });

      return NextResponse.json({ message: "Friend request accepted" });
    } else {
      // Decline - delete the request
      await prisma.friendship.delete({
        where: { id: requestId }
      });

      return NextResponse.json({ message: "Friend request declined" });
    }
  } catch (error) {
    console.error("Error handling friend request:", error);
    return NextResponse.json(
      { error: "Failed to handle friend request" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/requests - Cancel an outgoing friend request
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
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

    // Find the request (must be sent by current user)
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        userId: currentUser.id,
        status: "pending"
      }
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    await prisma.friendship.delete({
      where: { id: requestId }
    });

    return NextResponse.json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error cancelling friend request:", error);
    return NextResponse.json(
      { error: "Failed to cancel friend request" },
      { status: 500 }
    );
  }
}
