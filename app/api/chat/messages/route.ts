import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Get threadId or receiverId from query params
    const { searchParams } = new URL(req.url);
    let threadId = searchParams.get("threadId");
    const receiverId = searchParams.get("receiverId");

    if (!threadId && !receiverId) {
      return NextResponse.json(
        { error: "threadId or receiverId is required" },
        { status: 400 }
      );
    }

    // 3) Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, image: true, profile: { select: { avatarUrl: true } } },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4) If receiverId provided, find or create thread
    if (!threadId && receiverId) {
      const existingThread = await prisma.chatThread.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: {
              userId: { in: [currentUser.id, receiverId] },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingThread && existingThread.participants.length === 2) {
        threadId = existingThread.id;
      } else {
        // No thread exists yet - return empty messages
        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: { select: { avatarUrl: true } },
          },
        });

        return NextResponse.json({
          chat: {
            chat: [],
          },
          contact: {
            id: receiver?.id,
            fullName: receiver?.name,
            avatar: receiver?.profile?.avatarUrl || receiver?.image,
          },
        });
      }
    }

    // 5) Verify user is a participant in this thread
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        threadId: threadId!,
        userId: currentUser.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this thread" },
        { status: 403 }
      );
    }

    // 6) Get thread with participants info
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId! },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                profile: { select: { avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    // Get the receiver (other participant)
    const receiver = thread?.participants.find((p) => p.userId !== currentUser.id)?.user;

    // 7) Fetch messages for this thread
    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId: threadId!,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: true,
      },
    });

    // Transform to frontend format
    const transformedMessages = messages.map((msg) => ({
      messageId: msg.id,
      message: msg.body,
      senderId: msg.senderId,
      avatar:
        msg.senderId === currentUser.id
          ? currentUser.profile?.avatarUrl || currentUser.image
          : receiver?.profile?.avatarUrl || receiver?.image,
      fullName: msg.senderId === currentUser.id ? currentUser.name : receiver?.name,
      time: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      chat: {
        chat: transformedMessages,
      },
      contact: {
        id: receiver?.id,
        fullName: receiver?.name,
        avatar: receiver?.profile?.avatarUrl || receiver?.image,
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching chat messages:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch messages";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
