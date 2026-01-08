import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/threads/[id] - Get thread details with all messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const role = currentUser.profile?.role || "salesperson";
    const canAccess =
      role === "owner" ||
      role === "director" ||
      currentUser.profile?.canAdminCRM ||
      thread.assignedToId === currentUser.id ||
      thread.managerId === currentUser.id;

    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Mark as read for this user
    const isRep = thread.assignedToId === currentUser.id;
    const isManager = thread.managerId === currentUser.id;

    if (isRep && thread.unreadForRep) {
      await prisma.$transaction([
        prisma.messageThread.update({
          where: { id },
          data: { unreadForRep: false },
        }),
        prisma.message.updateMany({
          where: {
            threadId: id,
            direction: "INBOUND",
            readByRepAt: null,
          },
          data: { readByRepAt: new Date() },
        }),
      ]);
    }

    if (isManager && thread.unreadForManager) {
      await prisma.$transaction([
        prisma.messageThread.update({
          where: { id },
          data: { unreadForManager: false },
        }),
        prisma.message.updateMany({
          where: {
            threadId: id,
            direction: "INBOUND",
            readByManagerAt: null,
          },
          data: { readByManagerAt: new Date() },
        }),
      ]);
    }

    // Get rep info
    const rep = await prisma.user.findUnique({
      where: { id: thread.assignedToId },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Build reply portal URL
    const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reply/${thread.portalToken}`;

    return NextResponse.json({
      thread: {
        id: thread.id,
        customerId: thread.customerId,
        customerName: `${thread.customer.firstName} ${thread.customer.lastName}`.trim(),
        customerEmail: thread.customer.email,
        customerPhone: thread.customer.phone,
        customerStatus: thread.customer.status,
        assignedToId: thread.assignedToId,
        repName: rep?.profile
          ? `${rep.profile.firstName || ""} ${rep.profile.lastName || ""}`.trim() || rep.name
          : rep?.name || "Unknown",
        managerId: thread.managerId,
        subject: thread.subject,
        portalToken: thread.portalToken,
        portalUrl,
        lastMessageAt: thread.lastMessageAt,
        unreadForRep: thread.unreadForRep,
        unreadForManager: thread.unreadForManager,
        createdAt: thread.createdAt,
        messages: thread.messages.map((msg) => ({
          id: msg.id,
          direction: msg.direction,
          channel: msg.channel,
          fromName: msg.fromName,
          fromEmail: msg.fromEmail,
          toName: msg.toName,
          toEmail: msg.toEmail,
          bodyText: msg.bodyText,
          createdAt: msg.createdAt,
          isCustomer: msg.direction === "INBOUND",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

// POST /api/crm/threads/[id] - Send a message to the thread (rep reply)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    const role = currentUser.profile?.role || "salesperson";
    const canAccess =
      role === "owner" ||
      role === "director" ||
      currentUser.profile?.canAdminCRM ||
      thread.assignedToId === currentUser.id ||
      thread.managerId === currentUser.id;

    if (!canAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const trimmedMessage = message.trim();
    const preview = trimmedMessage.substring(0, 200);

    // Create outbound message and update thread
    const [newMessage] = await prisma.$transaction([
      prisma.message.create({
        data: {
          threadId: thread.id,
          customerId: thread.customerId,
          direction: "OUTBOUND",
          channel: "SYSTEM",
          fromName: currentUser.profile
            ? `${currentUser.profile.firstName || ""} ${currentUser.profile.lastName || ""}`.trim() || currentUser.name
            : currentUser.name,
          fromEmail: currentUser.email,
          toName: `${thread.customer.firstName} ${thread.customer.lastName}`.trim(),
          toEmail: thread.customer.email,
          bodyText: trimmedMessage,
        },
      }),
      prisma.messageThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
          unreadForRep: false,
          unreadForManager: false,
        },
      }),
      // Update customer's lastContactedAt
      prisma.customer.update({
        where: { id: thread.customerId },
        data: {
          lastContactedAt: new Date(),
          lastActivityAt: new Date(),
        },
      }),
      // Create activity log for CRM
      prisma.activity.create({
        data: {
          customerId: thread.customerId,
          userId: currentUser.id,
          type: "message",
          subject: "Rep Reply Sent",
          description: `Sent reply to customer: "${preview}${trimmedMessage.length > 200 ? "..." : ""}"`,
          status: "completed",
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        direction: newMessage.direction,
        fromName: newMessage.fromName,
        bodyText: newMessage.bodyText,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
