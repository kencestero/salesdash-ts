import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyCustomerReply } from "@/lib/in-app-notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================
// Rate Limiting for Reply Portal POST
// ============================================

interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}

// In-memory rate limit store (per IP address)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean up every 5 minutes

// Periodic cleanup of stale entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);

/**
 * Check rate limit for an IP address
 * Returns true if request should be blocked
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  // Check if window has expired
  if (now - entry.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
    // Reset the window
    rateLimitStore.set(ip, { count: 1, firstRequestTime: now });
    return false;
  }

  // Within window - check count
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true; // Rate limited
  }

  // Increment count
  entry.count++;
  return false;
}

// GET /api/reply-portal/[token] - Validate token and get thread info for customer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find thread by portal token
    const thread = await prisma.messageThread.findUnique({
      where: { portalToken: token },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            direction: true,
            channel: true,
            fromName: true,
            bodyText: true,
            createdAt: true,
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 404 }
      );
    }

    // Check token expiry if set
    if (thread.portalTokenExpiry && thread.portalTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "This reply link has expired. Please contact your sales representative." },
        { status: 410 }
      );
    }

    // Get rep info for display
    const rep = await prisma.user.findUnique({
      where: { id: thread.assignedToId },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      thread: {
        id: thread.id,
        subject: thread.subject,
        customerName: `${thread.customer.firstName} ${thread.customer.lastName}`.trim(),
        repName: rep?.profile
          ? `${rep.profile.firstName || ""} ${rep.profile.lastName || ""}`.trim() || rep.name
          : rep?.name || "Your Sales Representative",
        repPhone: rep?.profile?.phone || null,
        messages: thread.messages.map((msg) => ({
          id: msg.id,
          direction: msg.direction,
          fromName: msg.fromName,
          bodyText: msg.bodyText,
          createdAt: msg.createdAt,
          isCustomer: msg.direction === "INBOUND",
        })),
      },
    });
  } catch (error) {
    console.error("Error validating reply portal token:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}

// POST /api/reply-portal/[token] - Customer submits a reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limiting check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
               req.headers.get("x-real-ip") ||
               "unknown";

    if (isRateLimited(ip)) {
      console.warn(`Rate limited reply portal request from IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Find thread by portal token
    const thread = await prisma.messageThread.findUnique({
      where: { portalToken: token },
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
        { error: "Invalid or expired link" },
        { status: 404 }
      );
    }

    // Check token expiry if set
    if (thread.portalTokenExpiry && thread.portalTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "This reply link has expired. Please contact your sales representative." },
        { status: 410 }
      );
    }

    // Get request metadata (ip already extracted above for rate limiting)
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create the inbound message and update thread in a transaction
    const trimmedMessage = message.trim();
    const preview = trimmedMessage.substring(0, 200);

    const customerName = `${thread.customer.firstName} ${thread.customer.lastName}`.trim();

    const [newMessage] = await prisma.$transaction([
      // Create the message
      prisma.message.create({
        data: {
          threadId: thread.id,
          customerId: thread.customerId,
          direction: "INBOUND",
          channel: "PORTAL",
          fromName: customerName,
          fromEmail: thread.customer.email,
          bodyText: trimmedMessage,
          metadata: {
            ip,
            userAgent,
            submittedAt: new Date().toISOString(),
          },
        },
      }),
      // Update thread metadata
      prisma.messageThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
          unreadForRep: true,
          unreadForManager: thread.managerId ? true : false,
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
          type: "message",
          subject: "Customer Reply via Portal",
          description: `Customer submitted a reply through the reply portal: "${preview}${trimmedMessage.length > 200 ? "..." : ""}"`,
          status: "completed",
          completedAt: new Date(),
        },
      }),
    ]);

    // Send in-app notification to the assigned rep (non-blocking)
    notifyCustomerReply({
      recipientUserId: thread.assignedToId,
      customerId: thread.customerId,
      customerName,
      threadId: thread.id,
      messagePreview: trimmedMessage,
    }).catch((err) => {
      console.error("Failed to send customer reply notification:", err);
    });

    // Also notify the manager if assigned (non-blocking)
    if (thread.managerId) {
      notifyCustomerReply({
        recipientUserId: thread.managerId,
        customerId: thread.customerId,
        customerName,
        threadId: thread.id,
        messagePreview: trimmedMessage,
      }).catch((err) => {
        console.error("Failed to send manager reply notification:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting reply:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again." },
      { status: 500 }
    );
  }
}
