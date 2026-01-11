import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { createNotification } from "@/lib/in-app-notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

const DIAMOND_CARGO_EMAIL = "lee@diamondcargomfg.com";
const DIAMOND_CARGO_NAME = "Lee Portivent";

const PURPOSE_LABELS: Record<string, string> = {
  quote: "Quote",
  availability: "Availability",
  pictures: "Pictures",
  "more-info": "More Info",
  other: "Other",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    // Extract form fields
    const purpose = formData.get("purpose") as string;
    const message = formData.get("message") as string;
    const repCode = formData.get("repCode") as string;
    const repFirstName = formData.get("repFirstName") as string;
    const repLastName = formData.get("repLastName") as string;
    const repEmail = formData.get("repEmail") as string;
    const repUserId = formData.get("repUserId") as string;
    const managerId = formData.get("managerId") as string;

    // Validate required fields
    if (!purpose || !PURPOSE_LABELS[purpose]) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Process attachments
    const attachmentFiles = formData.getAll("attachments") as File[];
    const validAttachments: { filename: string; content: Buffer; contentType: string }[] = [];

    if (attachmentFiles.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} attachments allowed` },
        { status: 400 }
      );
    }

    for (const file of attachmentFiles) {
      if (!(file instanceof File) || file.size === 0) continue;

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PNG, JPEG, WEBP, GIF allowed.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum 5MB per file.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      validAttachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type,
      });
    }

    // Build rep name
    const repName = `${repFirstName || ""} ${repLastName || ""}`.trim() || "Unknown Rep";
    const purposeLabel = PURPOSE_LABELS[purpose];

    // Create email subject
    const emailSubject = `[Remotive SalesHub] ${purposeLabel} Request - ${repName} (${repCode || "N/A"})`;

    // Create request log in database
    const requestLog = await prisma.requestLog.create({
      data: {
        email: repEmail,
        fullName: repName,
        manufacturer: "diamond",
        purpose: purpose,
        message: message,
        status: "PENDING",
        submittedByUserId: repUserId || null,
        submittedByName: repName,
        submittedByEmail: repEmail,
        repCode: repCode || null,
        managerId: managerId || null,
        managerNotified: false,
      },
    });

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #E96114, #09213C); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 5px; }
    .message-box { background: white; border-left: 4px solid #E96114; padding: 15px; margin-top: 10px; }
    .footer { padding: 15px 20px; background: #eee; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">Remotive SalesHub - ${purposeLabel} Request</h2>
  </div>
  <div class="content">
    <div class="field">
      <div class="label">Sales Rep</div>
      <div class="value">${repName}</div>
    </div>
    <div class="field">
      <div class="label">Rep Code</div>
      <div class="value">${repCode || "N/A"}</div>
    </div>
    <div class="field">
      <div class="label">Rep Email</div>
      <div class="value"><a href="mailto:${repEmail}">${repEmail}</a></div>
    </div>
    <div class="field">
      <div class="label">Request Type</div>
      <div class="value">${purposeLabel}</div>
    </div>
    <div class="field">
      <div class="label">Request Details</div>
      <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
    </div>
    ${validAttachments.length > 0 ? `
    <div class="field">
      <div class="label">Attachments</div>
      <div class="value">${validAttachments.length} image(s) attached</div>
    </div>
    ` : ""}
  </div>
  <div class="footer">
    <p>This request was sent via Remotive SalesHub.</p>
    <p>Request ID: ${requestLog.id}</p>
    <p>To reply, simply respond to this email or contact the rep directly at ${repEmail}.</p>
  </div>
</body>
</html>
    `.trim();

    // Plain text version
    const emailText = `
Remotive SalesHub - ${purposeLabel} Request

Sales Rep: ${repName}
Rep Code: ${repCode || "N/A"}
Rep Email: ${repEmail}
Request Type: ${purposeLabel}

Request Details:
${message}

${validAttachments.length > 0 ? `Attachments: ${validAttachments.length} image(s) attached` : ""}

---
Request ID: ${requestLog.id}
To reply, simply respond to this email or contact the rep directly at ${repEmail}.
    `.trim();

    // Send email to Diamond Cargo
    const emailResult = await resend.emails.send({
      from: `Remotive SalesHub <${process.env.RESEND_FROM_EMAIL || "noreply@remotivelogistics.com"}>`,
      to: [DIAMOND_CARGO_EMAIL],
      replyTo: repEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      attachments: validAttachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    });

    if (emailResult.error) {
      console.error("Failed to send email:", emailResult.error);
      await prisma.requestLog.update({
        where: { id: requestLog.id },
        data: { status: "FAILED", error: emailResult.error.message },
      });
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // Update request log to SENT
    await prisma.requestLog.update({
      where: { id: requestLog.id },
      data: { status: "SENT" },
    });

    // Send confirmation notification to rep
    if (repUserId) {
      await createNotification({
        userId: repUserId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Request Sent to Diamond Cargo",
        message: `Your ${purposeLabel.toLowerCase()} request has been sent to Lee at Diamond Cargo. You'll be notified when they reply.`,
        actionUrl: "/en/crm/messages",
        skipEmail: true, // Don't email since they just submitted
      });
    }

    // Notify manager if exists
    if (managerId) {
      await createNotification({
        userId: managerId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Team Member Sent Diamond Cargo Request",
        message: `${repName} sent a ${purposeLabel.toLowerCase()} request to Diamond Cargo.`,
        actionUrl: "/en/crm/messages",
        skipEmail: false,
      });

      // Update manager notified flag
      await prisma.requestLog.update({
        where: { id: requestLog.id },
        data: { managerNotified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Request sent successfully",
      requestId: requestLog.id,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
