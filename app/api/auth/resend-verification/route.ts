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

    // Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`;

    // TODO: Send actual email here
    console.log("📧 Resend Verification URL:", verificationUrl);

    return NextResponse.json({
      ok: true,
      message: "Verification email sent! Check your inbox.",
    });
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    return NextResponse.json(
      { message: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
