import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testEmailService, isEmailServiceConfigured } from "@/lib/email/resend-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/email/test?to=email@example.com
 *
 * Test email service configuration (authenticated users only)
 */
export async function GET(req: NextRequest) {
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
          setup: {
            step1: "Sign up at https://resend.com",
            step2: "Get API key from dashboard",
            step3: "Add RESEND_API_KEY to .env or Vercel env vars",
            step4: "Install packages: pnpm add resend @react-email/components",
          },
        },
        { status: 503 }
      );
    }

    // Get test email from query params (default to session user email)
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get("to") || session.user.email;

    console.log(`🧪 Testing email service, sending to: ${testEmail}`);

    const result = await testEmailService(testEmail);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      id: result.id,
      note: "Check your inbox! (Also check spam folder)",
    });
  } catch (error: any) {
    console.error("❌ Email test error:", error);
    return NextResponse.json(
      {
        error: "Email test failed",
        message: error.message,
        troubleshooting: {
          check1: "Verify RESEND_API_KEY is set correctly",
          check2: "Ensure API key has permission to send emails",
          check3: "Verify sender domain or use onboarding@resend.dev",
          check4: "Check Resend dashboard for error logs",
        },
      },
      { status: 500 }
    );
  }
}
