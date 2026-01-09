import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/threads - List message threads for current user (rep inbox)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause based on role
    const where: any = {};

    // Filter by customer if provided
    if (customerId) {
      where.customerId = customerId;
    }

    // Role-based visibility
    const role = currentUser.profile?.role || "salesperson";
    if (role === "owner" || role === "director" || currentUser.profile?.canAdminCRM) {
      // Can see all threads
    } else if (role === "manager") {
      // Can see own threads and threads assigned to their team
      where.OR = [
        { assignedToId: currentUser.id },
        { managerId: currentUser.id },
      ];
    } else {
      // Salesperson: only own threads
      where.assignedToId = currentUser.id;
    }

    // Filter unread if requested
    if (unreadOnly) {
      if (role === "manager") {
        where.OR = [
          { assignedToId: currentUser.id, unreadForRep: true },
          { managerId: currentUser.id, unreadForManager: true },
        ];
      } else {
        where.unreadForRep = true;
      }
    }

    const threads = await prisma.messageThread.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            direction: true,
            bodyText: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    });

    // Get unread count for badge
    const unreadCount = await prisma.messageThread.count({
      where: {
        ...where,
        unreadForRep: true,
      },
    });

    return NextResponse.json({
      threads: threads.map((thread) => ({
        id: thread.id,
        customerId: thread.customerId,
        customerName: `${thread.customer.firstName} ${thread.customer.lastName}`.trim(),
        customerEmail: thread.customer.email,
        customerPhone: thread.customer.phone,
        subject: thread.subject,
        lastMessageAt: thread.lastMessageAt,
        lastMessagePreview: thread.lastMessagePreview,
        unreadForRep: thread.unreadForRep,
        unreadForManager: thread.unreadForManager,
        portalToken: thread.portalToken,
        lastMessage: thread.messages[0] || null,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

// POST /api/crm/threads - Create a new thread for a customer
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { customerId, subject, initialMessage } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // === ROLE-BASED VISIBILITY CHECK (Critical Security Fix) ===
    const role = currentUser.profile?.role || "salesperson";
    const isCRMAdmin = currentUser.profile?.canAdminCRM ?? false;
    const isOwnerOrDirector = ["owner", "director"].includes(role);
    const isManager = role === "manager";
    const isSalesperson = role === "salesperson" && !isCRMAdmin;

    let canAccess = false;

    if (isOwnerOrDirector || isCRMAdmin) {
      canAccess = true;
    } else if (isManager) {
      // Manager can create threads for their team's customers
      const teamMembers = await prisma.userProfile.findMany({
        where: { managerId: currentUser.id },
        select: { userId: true },
      });
      const teamMemberIds = teamMembers.map((m) => m.userId);
      teamMemberIds.push(currentUser.id);
      canAccess =
        teamMemberIds.includes(customer.assignedToId || "") ||
        customer.managerId === currentUser.id;
    } else if (isSalesperson) {
      // Salesperson can only create threads for their own customers
      canAccess = customer.assignedToId === currentUser.id;
    }

    if (!canAccess) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if thread already exists for this customer
    let thread = await prisma.messageThread.findFirst({
      where: { customerId },
    });

    if (!thread) {
      // Create new thread
      thread = await prisma.messageThread.create({
        data: {
          customerId,
          assignedToId: customer.assignedToId || currentUser.id,
          managerId: customer.managerId || currentUser.profile?.managerId || null,
          subject: subject || null,
        },
      });
    }

    // If initial message provided, create it as outbound
    if (initialMessage && typeof initialMessage === "string" && initialMessage.trim()) {
      const trimmedMessage = initialMessage.trim();
      const preview = trimmedMessage.substring(0, 200);

      await prisma.$transaction([
        prisma.message.create({
          data: {
            threadId: thread.id,
            customerId,
            direction: "OUTBOUND",
            channel: "SYSTEM",
            fromName: currentUser.profile
              ? `${currentUser.profile.firstName || ""} ${currentUser.profile.lastName || ""}`.trim() || currentUser.name
              : currentUser.name,
            fromEmail: currentUser.email,
            toName: `${customer.firstName} ${customer.lastName}`.trim(),
            toEmail: customer.email,
            bodyText: trimmedMessage,
          },
        }),
        prisma.messageThread.update({
          where: { id: thread.id },
          data: {
            lastMessageAt: new Date(),
            lastMessagePreview: preview,
          },
        }),
      ]);
    }

    return NextResponse.json({
      thread: {
        id: thread.id,
        customerId: thread.customerId,
        portalToken: thread.portalToken,
        subject: thread.subject,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
