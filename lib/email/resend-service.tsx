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
import { render } from '@react-email/components';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email (use your verified domain)
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'MJ Cargo <onboarding@resend.dev>';

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
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationLink: string,
  expiresInHours: number = 24
) {
  const VerifyEmail = (await import('./templates/verify-email')).default;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - MJ Cargo Sales Dashboard',
    react: VerifyEmail({ userName, verificationLink, expiresInHours }),
    tags: [
      { name: 'category', value: 'email-verification' },
    ],
  });
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
