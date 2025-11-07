import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Get threadId from query params
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required" },
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

    // 5) Fetch messages for this thread
    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId,
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
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(messages);
  } catch (err: unknown) {
    console.error("Error fetching chat messages:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch messages";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
