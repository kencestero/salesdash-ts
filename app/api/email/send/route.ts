import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  sendWelcomeEmail,
  sendQuoteEmail,
  sendPasswordResetEmail,
  isEmailServiceConfigured,
} from "@/lib/email/resend-service";

/**
 * POST /api/email/send
 *
 * Send emails from the dashboard (authenticated users only)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if email service is configured
    if (!isEmailServiceConfigured()) {
      return NextResponse.json(
        {
          error: "Email service not configured",
          message: "Please add RESEND_API_KEY to environment variables",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    console.log(`📧 Sending ${type} email from:`, session.user.email);

    let result;

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(
          data.email,
          data.userName,
          data.userRole,
          data.employeeNumber
        );
        break;

      case "quote":
        result = await sendQuoteEmail(
          data.customerEmail,
          data.customerName,
          data.repName,
          data.unitDescription,
          data.unitPrice,
          data.quoteLink,
          data.repEmail || session.user.email
        );
        break;

      case "password-reset":
        result = await sendPasswordResetEmail(
          data.email,
          data.userName,
          data.resetLink,
          data.expiresInMinutes
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} email sent successfully`,
      id: result.id,
    });
  } catch (error: any) {
    console.error("❌ Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email", message: error.message },
      { status: 500 }
    );
  }
}
