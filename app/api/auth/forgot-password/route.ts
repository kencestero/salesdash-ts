import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/lib/email/templates/reset-password';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email
    const emailHtml = render(
      ResetPasswordEmail({
        userName: user.name || 'there',
        resetLink,
        expiresInHours: 1,
      })
    );

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL?.replace(/^["']|["']$/g, '') || 'MJ Cargo Sales <noreply@mjsalesdash.com>',
      to: user.email!,
      subject: 'Reset Your MJ SalesDash Password',
      html: emailHtml,
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
