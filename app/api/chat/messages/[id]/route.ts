import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// DELETE /api/chat/messages/[id] - Delete a specific message
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;

    // Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the message and verify ownership
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { senderId: true, threadId: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only allow sender to delete their own messages
    if (message.senderId !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json(
      { message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
