import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import PasswordChangedEmail from "@/lib/email/templates/password-changed";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send confirmation email
    try {
      const changeTime = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
      });

      const emailHtml = render(
        PasswordChangedEmail({
          userName: user.name || "there",
          changeTime,
          loginLink: `${process.env.NEXTAUTH_URL}/en/auth/login`,
        })
      );

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, '') || 'MJ Cargo Sales <noreply@mjsalesdash.com>',
        to: user.email!,
        subject: "Your MJ SalesDash Password Has Been Changed",
        html: emailHtml,
      });
    } catch (emailError) {
      // Log email error but don't fail the password reset
      console.error("Failed to send password change confirmation email:", emailError);
    }

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
