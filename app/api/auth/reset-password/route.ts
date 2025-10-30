import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

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

      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, '') || 'MJ Cargo Sales <noreply@mjsalesdash.com>',
        to: user.email!,
        subject: "Your MJ SalesDash Password Has Been Changed",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e6ebf1; border-radius: 8px;">
                      <tr>
                        <td style="background-color: #E96114; padding: 30px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MJ CARGO TRAILERS</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Hi ${user.name || 'there'}! 🔐</h2>
                          <p style="color: #525252; font-size: 16px; line-height: 24px;">Your password for MJ SalesDash has been successfully changed.</p>
                          <p style="color: #666; font-size: 14px; margin-top: 16px;"><strong>Time:</strong> ${changeTime}</p>
                          <p style="color: #666; font-size: 14px;">If you made this change, you can safely ignore this email.</p>
                          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-top: 24px;">
                            <p style="color: #dc2626; font-size: 14px; margin: 0;"><strong>⚠️ Didn't change your password?</strong><br/>If you did NOT make this change, contact your system administrator immediately.</p>
                          </div>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                            <tr>
                              <td align="center">
                                <a href="${process.env.NEXTAUTH_URL}/en/auth/login" style="background-color: #E96114; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Login to SalesDash</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e6ebf1;">
                          <p style="color: #8b8b8b; font-size: 12px; margin: 0;">This is an automated security notification.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
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
