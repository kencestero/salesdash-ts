import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse request body
    const body = await req.json();
    const { threadId, body: messageBody } = body;

    if (!threadId || !messageBody?.trim()) {
      return NextResponse.json(
        { error: "threadId and body are required" },
        { status: 400 }
      );
    }

    // 3) Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4) Verify user is a participant in this thread
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        threadId,
        userId: currentUser.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this thread" },
        { status: 403 }
      );
    }

    // 5) Create the message
    const message = await prisma.chatMessage.create({
      data: {
        body: messageBody.trim(),
        senderId: currentUser.id,
        threadId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 6) Update thread's updatedAt timestamp
    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (err: unknown) {
    console.error("Error sending message:", err);
    const msg = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
