import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MJ Cargo Sales <noreply@mjsalesdash.com>";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const customerId = formData.get("customerId") as string;
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get attachments if any
    const attachmentFiles = formData.getAll("attachments") as File[];
    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL.replace(/['"]/g, ""),
      to: [to],
      subject,
      text: body,
      ...(attachments.length > 0 && { attachments }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    // Log email in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user && customerId) {
      await prisma.email.create({
        data: {
          customerId,
          userId: user.id,
          subject,
          body,
          sentAt: new Date(),
          status: "sent",
        },
      });

      // Also create activity log
      await prisma.activity.create({
        data: {
          customerId,
          userId: user.id,
          type: "email",
          subject: `Email Sent: ${subject}`,
          description: body.substring(0, 200),
          status: "completed",
          completedAt: new Date(),
        },
      });

      // Update customer lastContactedAt
      await prisma.customer.update({
        where: { id: customerId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
