/**
 * Resend Email Service Integration
 *
 * Setup Instructions:
 * 1. Sign up at https://resend.com (Free: 3,000 emails/month)
 * 2. Get API key from dashboard
 * 3. Add to .env: RESEND_API_KEY=re_xxxxx
 * 4. Verify domain or use onboarding@resend.dev for testing
 * 5. Install: pnpm add resend @react-email/components
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';

// Initialize Resend client
const apiKey = process.env.RESEND_API_KEY;
console.log('🔍 RESEND_API_KEY loaded:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');
const resend = new Resend(apiKey);

// Default sender email (use your verified domain)
// Strip quotes if they exist in the environment variable
const rawFromEmail = process.env.RESEND_FROM_EMAIL || 'MJ Cargo Sales <noreply@mjsalesdash.com>';
const DEFAULT_FROM = rawFromEmail.replace(/^["']|["']$/g, '').trim();

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: { name: string; value: string }[];
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = DEFAULT_FROM,
  replyTo,
  cc,
  bcc,
  tags,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo,
      cc,
      bcc,
      tags,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  userRole: string,
  employeeNumber: string
) {
  const WelcomeEmail = (await import('./templates/welcome-email')).default;

  return sendEmail({
    to: email,
    subject: `Welcome to MJ Cargo, ${userName}!`,
    react: WelcomeEmail({ userName, userRole, employeeNumber }),
    tags: [
      { name: 'category', value: 'welcome' },
      { name: 'role', value: userRole },
    ],
  });
}

/**
 * Send quote email to customer
 */
export async function sendQuoteEmail(
  customerEmail: string,
  customerName: string,
  repName: string,
  unitDescription: string,
  unitPrice: number,
  quoteLink: string,
  repEmail?: string
) {
  const QuoteEmail = (await import('./templates/quote-email')).default;

  return sendEmail({
    to: customerEmail,
    subject: `Your MJ Cargo Quote: ${unitDescription}`,
    react: QuoteEmail({
      customerName,
      repName,
      unitDescription,
      unitPrice,
      quoteLink,
    }),
    replyTo: repEmail, // Allow customer to reply directly to rep
    tags: [
      { name: 'category', value: 'quote' },
      { name: 'rep', value: repName },
    ],
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetLink: string,
  expiresInMinutes: number = 60
) {
  const PasswordResetEmail = (await import('./templates/password-reset')).default;

  return sendEmail({
    to: email,
    subject: 'Reset Your MJ Cargo Dashboard Password',
    react: PasswordResetEmail({ userName, resetLink, expiresInMinutes }),
    tags: [
      { name: 'category', value: 'password-reset' },
    ],
  });
}

/**
 * Send email verification link (Plain HTML - Serverless-friendly)
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationLink: string,
  expiresInHours: number = 24
) {
  // Use plain HTML instead of React Email to avoid bundling issues in serverless
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a3a52; padding: 30px 40px; text-align: center;">
                  <h1 style="color: #f5a623; margin: 0; font-size: 28px; font-weight: bold;">MJ Cargo Sales Dashboard</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1a3a52; margin: 0 0 20px 0; font-size: 24px;">Welcome ${userName}! 🎉</h2>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Thank you for creating an account with MJ Cargo Sales Dashboard!
                  </p>
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    To complete your registration and access your account, please verify your email address by clicking the button below:
                  </p>
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationLink}"
                           style="background-color: #1a3a52; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  <!-- Expiration Notice -->
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                    This verification link will expire in <strong>${expiresInHours} hours</strong>.
                  </p>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
                    If you didn't create an account with MJ Cargo, you can safely ignore this email.
                  </p>
                  <!-- Alternative Link -->
                  <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="color: #1a3a52; font-size: 12px; word-break: break-all; margin: 5px 0 0 0;">
                    ${verificationLink}
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 20px 40px; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                    This is an automated email. Please do not reply to this message.<br>
                    If you need assistance, contact your system administrator.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
                    © ${new Date().getFullYear()} MJ Cargo. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Verify Your Email - MJ Cargo Sales Dashboard',
      html,
      tags: [
        { name: 'category', value: 'email-verification' },
      ],
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Verification email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Test email service (for development)
 */
export async function testEmailService(testEmail: string) {
  const MJCargoEmail = (await import('./templates/mj-cargo-base')).default;

  return sendEmail({
    to: testEmail,
    subject: 'MJ Cargo Email Service Test',
    react: MJCargoEmail({
      heading: 'Email Service Test',
      body: (
        <>
          <p>This is a test email from the MJ Cargo Sales Dashboard.</p>
          <p>If you're seeing this, your email service is configured correctly! 🎉</p>
          <ul>
            <li>✅ Resend API is working</li>
            <li>✅ React Email templates are rendering</li>
            <li>✅ MJ Cargo branding is applied</li>
          </ul>
          <p>You're all set to send emails from the dashboard!</p>
        </>
      ),
      ctaText: 'View Dashboard',
      ctaLink: 'https://salesdash-ts.vercel.app/en/dashboard',
    }),
    tags: [
      { name: 'category', value: 'test' },
    ],
  });
}

/**
 * Check if Resend is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
