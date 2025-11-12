import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/chat/unread-counts - Get unread message counts for all threads
export async function GET(req: NextRequest) {
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

    // Fetch all threads where user is a participant with their lastReadAt
    const participations = await prisma.chatParticipant.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        thread: {
          include: {
            participants: {
              where: {
                userId: { not: currentUser.id },
              },
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1, // Latest message
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Calculate unread counts for each thread
    const unreadCounts = await Promise.all(
      participations.map(async (participation) => {
        const { thread, lastReadAt } = participation;

        // Get the other participant (for 1-on-1 chats)
        const otherParticipant = thread.participants[0]?.user;

        // Count unread messages (messages created after lastReadAt)
        const unreadCount = await prisma.chatMessage.count({
          where: {
            threadId: thread.id,
            senderId: { not: currentUser.id }, // Only count messages from others
            createdAt: lastReadAt
              ? { gt: lastReadAt }
              : undefined, // If never read, count all messages from others
          },
        });

        // Get last message timestamp
        const lastMessageTime = thread.messages[0]?.createdAt || null;

        return {
          threadId: thread.id,
          otherUserId: otherParticipant?.id || null,
          unreadCount,
          lastMessageTime,
        };
      })
    );

    // Create a map for easy lookup by userId
    const unreadByUserId: Record<string, { unreadCount: number; lastMessageTime: string | null }> = {};
    unreadCounts.forEach((item) => {
      if (item.otherUserId) {
        unreadByUserId[item.otherUserId] = {
          unreadCount: item.unreadCount,
          lastMessageTime: item.lastMessageTime?.toISOString() || null,
        };
      }
    });

    return NextResponse.json({ unreadByUserId });
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    return NextResponse.json({ error: "Failed to fetch unread counts" }, { status: 500 });
  }
}
