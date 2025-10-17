import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json(
        { message: "If the email exists, a verification link has been sent" },
        { status: 200 }
      );
    }

    // If already verified, no need to resend
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified. You can log in now." },
        { status: 200 }
      );
    }

    // Delete old verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new verification token
    const verificationToken = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    });

    // Get user profile for name
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const userName = userProfile
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : user.name || 'User';

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/en/auth/verify-email?token=${verificationToken}`;

    // Send verification email using Resend
    console.log('🔍 Checking RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS' : 'MISSING');

    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not configured!');
        return NextResponse.json(
          { message: "Email service is not configured. Please contact support." },
          { status: 500 }
        );
      }

      const { sendVerificationEmail } = await import('@/lib/email/resend-service');

      const result = await sendVerificationEmail(
        email,
        userName,
        verificationUrl,
        24 // 24 hours expiry
      );

      console.log('✅ Verification email resent successfully!', result);

      return NextResponse.json({
        ok: true,
        message: "Verification email sent! Check your inbox.",
      });
    } catch (emailError: any) {
      console.error('❌ Failed to send verification email:', emailError);
      return NextResponse.json(
        { message: "Failed to send email. Please try again or contact support." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    return NextResponse.json(
      { message: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
