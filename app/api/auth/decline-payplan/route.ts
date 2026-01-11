import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const PAYPLAN_VERSION = "2026-01-11-v1";
const ADMIN_EMAIL = "ken@remotivelogistics.com";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get IP and user agent for audit log
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const currentAccountStatus = user.profile.accountStatus || "active";

    // Update profile: decline payplan and disable account
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        payplanStatus: "DECLINED",
        payplanVersion: PAYPLAN_VERSION,
        payplanDeclinedAt: new Date(),
        accountStatus: "disabled_declined_payplan",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email || "",
        userName: user.name || user.profile.firstName || "",
        action: "PAYPLAN_DECLINED_ACCOUNT_DISABLED",
        entityType: "UserProfile",
        entityId: user.profile.id,
        oldValue: {
          payplanStatus: user.profile.payplanStatus,
          accountStatus: currentAccountStatus,
        },
        newValue: {
          payplanStatus: "DECLINED",
          payplanVersion: PAYPLAN_VERSION,
          accountStatus: "disabled_declined_payplan",
        },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    // Send admin notification email
    const userName = user.profile.firstName && user.profile.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.name || "Unknown User";

    try {
      await resend.emails.send({
        from: `Remotive SalesHub <${process.env.RESEND_FROM_EMAIL || "noreply@remotivelogistics.com"}>`,
        to: [ADMIN_EMAIL],
        subject: "SalesHub Rep Declined Payplan (Account Disabled)",
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626, #09213C); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 5px; font-size: 16px; }
    .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin-top: 15px; }
    .footer { padding: 15px 20px; background: #eee; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Account Disabled - Payplan Declined</h2>
    </div>
    <div class="content">
      <div class="alert">
        <strong>A sales rep has declined the payplan and their account has been automatically disabled.</strong>
      </div>
      <div class="field">
        <div class="label">User</div>
        <div class="value">${userName}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value">${user.email}</div>
      </div>
      <div class="field">
        <div class="label">Timestamp</div>
        <div class="value">${new Date().toISOString()}</div>
      </div>
      <div class="field">
        <div class="label">Payplan Version</div>
        <div class="value">${PAYPLAN_VERSION}</div>
      </div>
      <div class="field">
        <div class="label">IP Address</div>
        <div class="value">${ip}</div>
      </div>
    </div>
    <div class="footer">
      <p>To re-enable this account, manually set accountStatus to "active" and payplanStatus to "ACCEPTED" in the database.</p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the request if email fails - the important part (disabling) succeeded
    }

    return NextResponse.json({
      success: true,
      signOut: true,
      message: "Account disabled due to payplan decline",
    });
  } catch (error) {
    console.error("Error declining payplan:", error);
    return NextResponse.json(
      { error: "Failed to process payplan decline" },
      { status: 500 }
    );
  }
}
