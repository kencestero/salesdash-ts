import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse request body
    const body = await req.json();
    const { requestId, message } = body;

    if (!requestId || !message?.trim()) {
      return NextResponse.json(
        { error: "requestId and message are required" },
        { status: 400 }
      );
    }

    // 3) Fetch the request log
    const requestLog = await prisma.requestLog.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        email: true,
        fullName: true,
        manufacturer: true,
        purpose: true,
        submittedByUserId: true,
      },
    });

    if (!requestLog) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 4) Authorization: ensure user owns this request or is the manager
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    const isOwner = requestLog.submittedByUserId === currentUser?.id;
    const isManager = currentUser?.profile?.role && ["owner", "director", "manager"].includes(currentUser.profile.role);

    if (!isOwner && !isManager) {
      return NextResponse.json(
        { error: "You don't have permission to reply to this request" },
        { status: 403 }
      );
    }

    // 5) Send email reply via Resend with threading
    await resend.emails.send({
      from: `Remotive SalesHub <${process.env.RESEND_FROM_EMAIL}>`,
      to: [requestLog.email],
      reply_to: `request+${requestLog.id}@mjsalesdash.com`, // Thread replies
      subject: `Re: [${requestLog.manufacturer}] ${requestLog.purpose}`,
      text: [
        `Hi ${requestLog.fullName},`,
        "",
        message.trim(),
        "",
        "— Remotive Logistics SalesDash",
        "",
        `(Reply to Request ID: ${requestLog.id})`,
      ].join("\n"),
    });

    // 6) Optional: Log the reply in database (if you add a RequestReply model later)
    // await prisma.requestReply.create({ ... })

    return NextResponse.json({
      ok: true,
      message: "Reply sent successfully",
    });
  } catch (err: unknown) {
    console.error("Error sending reply:", err);
    const msg = err instanceof Error ? err.message : "Failed to send reply";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
