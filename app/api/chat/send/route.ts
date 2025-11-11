import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse request body
    const body = await req.json();
    const { threadId, receiverId, body: messageBody } = body;

    if (!messageBody?.trim()) {
      return NextResponse.json(
        { error: "message body is required" },
        { status: 400 }
      );
    }

    // Must provide either threadId OR receiverId for 1-on-1 chat
    if (!threadId && !receiverId) {
      return NextResponse.json(
        { error: "threadId or receiverId is required" },
        { status: 400 }
      );
    }

    // 3) Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let actualThreadId = threadId;

    // 4) Auto-create thread for 1-on-1 if receiverId provided without threadId
    if (!threadId && receiverId) {
      // Check if thread already exists between these two users
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
        actualThreadId = existingThread.id;
      } else {
        // Create new thread for 1-on-1 conversation
        const newThread = await prisma.chatThread.create({
          data: {
            isGroup: false,
            participants: {
              create: [
                { userId: currentUser.id },
                { userId: receiverId },
              ],
            },
          },
        });
        actualThreadId = newThread.id;
      }
    }

    // 5) Verify user is a participant in this thread
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        threadId: actualThreadId,
        userId: currentUser.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this thread" },
        { status: 403 }
      );
    }

    // 6) Create the message
    const message = await prisma.chatMessage.create({
      data: {
        body: messageBody.trim(),
        senderId: currentUser.id,
        threadId: actualThreadId,
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
      },
    });

    // 7) Update thread's updatedAt timestamp
    await prisma.chatThread.update({
      where: { id: actualThreadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      message: "Message sent successfully",
      threadId: actualThreadId,
      data: message,
    });
  } catch (err: unknown) {
    console.error("Error sending message:", err);
    const msg = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
