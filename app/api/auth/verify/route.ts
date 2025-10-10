import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/en/auth/verify-email?error=invalid_token", req.url)
      );
    }

    // Check if token expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/en/auth/verify-email?error=expired_token", req.url)
      );
    }

    // Verify the user's email
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Mark user profile as member
    await prisma.userProfile.updateMany({
      where: { userId: user.id },
      data: { member: true },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    console.log("✅ Email verified for:", user.email);

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/en/auth/login?verified=true", req.url)
    );
  } catch (error) {
    console.error("❌ Email verification error:", error);
    return NextResponse.redirect(
      new URL("/en/auth/verify-email?error=verification_failed", req.url)
    );
  }
}
