import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

      // Send email via Resend
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "MJ Cargo <onboarding@resend.dev>",
          to: email,
          subject: "Reset Your MJ Cargo Password",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #ee6832; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .button { display: inline-block; background: #ee6832; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>MJ CARGO TRAILERS</h1>
                  </div>
                  <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.name || 'there'},</p>
                    <p>We received a request to reset your password for your MJ Cargo account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                      <a href="${resetUrl}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #ee6832;">${resetUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} MJ Cargo Trailers. All rights reserved.</p>
                      <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        // Don't return error to user - we already saved the token
      }
    }

    // Always return success (security best practice)
    return NextResponse.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
