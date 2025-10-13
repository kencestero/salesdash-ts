import { NextRequest, NextResponse } from "next/server";
import { isEmailServiceConfigured } from "@/lib/email/resend-service";

/**
 * GET /api/email/test-public
 *
 * Public endpoint to test if Resend API key is configured
 * Does NOT send emails, just checks configuration
 */
export async function GET(req: NextRequest) {
  try {
    // Check if RESEND_API_KEY exists
    const isConfigured = isEmailServiceConfigured();
    const apiKey = process.env.RESEND_API_KEY;

    if (!isConfigured || !apiKey) {
      return NextResponse.json({
        configured: false,
        message: "❌ RESEND_API_KEY is not set",
        apiKeyExists: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        setup: {
          step1: "Sign up at https://resend.com",
          step2: "Get API key from dashboard",
          step3: "Add to Vercel env: RESEND_API_KEY=re_xxxxx",
          step4: "Redeploy the app",
        },
      });
    }

    // Show masked API key for verification
    const maskedKey = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);

    return NextResponse.json({
      configured: true,
      message: "✅ RESEND_API_KEY is configured!",
      apiKeyMasked: maskedKey,
      apiKeyLength: apiKey.length,
      note: "To send a test email, log in and visit /api/email/test?to=your@email.com",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Configuration check failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
