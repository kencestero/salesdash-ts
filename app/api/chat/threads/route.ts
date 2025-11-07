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

    // 2) Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) Fetch all threads where user is a participant
    const threads = await prisma.chatThread.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Latest message for preview
          select: {
            id: true,
            body: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(threads);
  } catch (err: unknown) {
    console.error("Error fetching chat threads:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch threads";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
