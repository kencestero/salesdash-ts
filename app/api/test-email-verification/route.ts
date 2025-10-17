import { NextResponse } from "next/server";

/**
 * Test endpoint to verify email sending actually works
 *
 * Call this to test:
 * POST https://mjsalesdash.com/api/test-email-verification
 * Body: { "email": "your-test-email@gmail.com", "userName": "Test User" }
 */
export async function POST(req: Request) {
  try {
    const { email, userName } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log('🧪 TEST: Starting email verification test');
    console.log('🧪 TEST: Email:', email);
    console.log('🧪 TEST: User Name:', userName || 'Test User');

    // Check environment variables
    const hasApiKey = !!process.env.RESEND_API_KEY;
    const hasFromEmail = !!process.env.RESEND_FROM_EMAIL;

    console.log('🧪 TEST: RESEND_API_KEY present:', hasApiKey);
    console.log('🧪 TEST: RESEND_FROM_EMAIL present:', hasFromEmail);

    if (!hasApiKey) {
      console.error('❌ TEST: RESEND_API_KEY is not configured!');
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY is not configured in environment variables',
        checks: {
          hasApiKey,
          hasFromEmail,
        }
      }, { status: 500 });
    }

    // Try to import the email service
    console.log('🧪 TEST: Importing email service...');
    const { sendVerificationEmail } = await import('@/lib/email/resend-service');
    console.log('🧪 TEST: Email service imported successfully');

    // Generate a test verification URL
    const testToken = `test_${Math.random().toString(36).substring(2)}`;
    const verificationUrl = `${process.env.NEXTAUTH_URL}/en/auth/verify-email?token=${testToken}`;

    console.log('🧪 TEST: Verification URL:', verificationUrl);

    // Try to send the email
    console.log('🧪 TEST: Attempting to send verification email...');
    const result = await sendVerificationEmail(
      email,
      userName || 'Test User',
      verificationUrl,
      24 // 24 hours expiry
    );

    console.log('🧪 TEST: ✅ Email sent successfully!');
    console.log('🧪 TEST: Result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully! Check your inbox.',
      result,
      checks: {
        hasApiKey,
        hasFromEmail,
        emailService: 'imported successfully',
      },
      testData: {
        to: email,
        verificationUrl,
      }
    });

  } catch (error: any) {
    console.error('🧪 TEST: ❌ Failed to send email');
    console.error('🧪 TEST: Error type:', error.constructor.name);
    console.error('🧪 TEST: Error message:', error.message);
    console.error('🧪 TEST: Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      stack: error.stack,
      checks: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      }
    }, { status: 500 });
  }
}

// Allow GET requests too for easy browser testing
export async function GET() {
  return NextResponse.json({
    message: 'Email verification test endpoint',
    usage: 'POST to this endpoint with { "email": "your@email.com", "userName": "Your Name" }',
    checks: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'not set',
    }
  });
}
