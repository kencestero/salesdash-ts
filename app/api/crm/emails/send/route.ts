import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN || "remotivelogistics.com";

// CRM Preferences type
interface CRMPreferences {
  defaultViewId?: string | null;
  defaultSort?: string;
  followUpDays?: number;
  overdueReminders?: boolean;
  emailSignature?: string;
  fromNameFormat?: "name" | "nameCompany";
}

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
    let body = formData.get("body") as string;

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user with profile and CRM preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    // Build From name based on user preferences
    let fromName = "Remotive Logistics Sales";
    if (user?.profile) {
      const userName = user.profile.firstName
        ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
        : user.name || "Sales Rep";

      const crmPrefs = user.profile.crmPreferences as CRMPreferences | null;
      const fromNameFormat = crmPrefs?.fromNameFormat || "nameCompany";

      if (fromNameFormat === "name") {
        fromName = userName;
      } else {
        fromName = `${userName} (Remotive Logistics)`;
      }

      // Append email signature if configured
      const emailSignature = crmPrefs?.emailSignature;
      if (emailSignature && emailSignature.trim()) {
        body = `${body}\n\n${emailSignature}`;
      }
    }

    const fromEmail = `${fromName} <noreply@${FROM_DOMAIN}>`;

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
      from: fromEmail.replace(/['"]/g, ""),
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

    // Log email in database (user already fetched above)
    let createdEmailId: string | undefined;
    let createdActivityId: string | undefined;

    if (user && customerId) {
      // Create email record and capture ID
      const emailRecord = await prisma.email.create({
        data: {
          customerId,
          userId: user.id,
          subject,
          body,
          sentAt: new Date(),
          status: "sent",
        },
      });
      createdEmailId = emailRecord.id;

      // Also create activity log linked to email
      const activityRecord = await prisma.activity.create({
        data: {
          customerId,
          userId: user.id,
          emailId: emailRecord.id,  // Link to email record
          type: "email",
          subject: `Email Sent: ${subject}`,
          description: body.substring(0, 200),
          status: "completed",
          completedAt: new Date(),
        },
      });
      createdActivityId = activityRecord.id;

      // Update customer lastContactedAt
      await prisma.customer.update({
        where: { id: customerId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      emailId: createdEmailId || data?.id,
      activityId: createdActivityId,
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
