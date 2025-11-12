import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/chat/mark-read - Mark a thread as read (update lastReadAt)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { threadId, receiverId } = body;

    let actualThreadId = threadId;

    // If receiverId provided instead of threadId, find the thread
    if (!actualThreadId && receiverId) {
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
        // No thread exists yet, nothing to mark as read
        return NextResponse.json({ success: true, message: "No thread to mark as read" });
      }
    }

    if (!actualThreadId) {
      return NextResponse.json({ error: "threadId or receiverId is required" }, { status: 400 });
    }

    // Verify user is a participant in this thread
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

    // Update lastReadAt to current time
    await prisma.chatParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking thread as read:", error);
    return NextResponse.json({ error: "Failed to mark thread as read" }, { status: 500 });
  }
}
