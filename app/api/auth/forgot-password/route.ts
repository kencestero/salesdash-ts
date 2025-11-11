import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Security: Always return success even if user doesn't exist
    // (prevents email enumeration attacks)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/en/auth/reset-password?token=${resetToken}`;

    // Initialize Resend inside function
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email with simple HTML
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, '') || 'MJ Cargo Sales <noreply@mjsalesdash.com>',
      to: user.email!,
      subject: 'Reset Your MJ SalesDash Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e6ebf1; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #E96114; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">MJ CARGO TRAILERS</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">Hi ${user.name || 'there'}! 🔐</h2>
                        <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">We received a request to reset your password for your MJ SalesDash account.</p>
                        <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">Click the button below to create a new password:</p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${resetLink}" style="background-color: #E96114; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Reset Password</a>
                            </td>
                          </tr>
                        </table>

                        <p style="color: #666; font-size: 14px; line-height: 20px; margin: 24px 0 16px 0;">This password reset link will expire in <strong>1 hour</strong> for security.</p>
                        <p style="color: #666; font-size: 14px; line-height: 20px; margin: 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid: #e6ebf1;">
                        <p style="color: #525252; font-size: 14px; line-height: 20px; margin: 0 0 8px 0; text-align: center;"><strong>MJ Cargo Trailers</strong></p>
                        <p style="color: #8b8b8b; font-size: 12px; line-height: 16px; margin: 0; text-align: center;">This is an automated email. Please do not reply to this message.</p>
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

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
