import { NextRequest, NextResponse } from "next/server";
import { testEmailService, isEmailServiceConfigured } from "@/lib/email/resend-service";

/**
 * GET /api/email/send-test?to=email@example.com
 *
 * PUBLIC endpoint to actually send a test email (no auth required)
 * TEMPORARY - Remove after testing!
 */
export async function GET(req: NextRequest) {
  try {
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

    // Get test email from query params
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get("to");

    if (!testEmail) {
      return NextResponse.json(
        {
          error: "Missing email parameter",
          usage: "GET /api/email/send-test?to=your@email.com",
        },
        { status: 400 }
      );
    }

    console.log(`🧪 PUBLIC TEST: Sending email to: ${testEmail}`);

    const result = await testEmailService(testEmail);

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      id: result.id,
      note: "Check your inbox! (Also check spam folder)",
      warning: "This is a temporary public endpoint - remove after testing!",
    });
  } catch (error: any) {
    console.error("❌ Email send error:", error);
    return NextResponse.json(
      {
        error: "Email send failed",
        message: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
