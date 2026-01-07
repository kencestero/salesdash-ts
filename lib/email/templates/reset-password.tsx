/**
 * Password Reset Email Template
 */

import remotiveEmail from './mj-cargo-base';

interface ResetPasswordEmailProps {
  userName: string;
  resetLink: string;
  expiresInHours?: number;
}

export default function ResetPasswordEmail({
  userName,
  resetLink,
  expiresInHours = 1,
}: ResetPasswordEmailProps) {
  return remotiveEmail({
    preview: 'Reset your Remotive SalesHub password',
    heading: `Hi ${userName}! 🔐`,
    body: (
      <>
        <p>We received a request to reset your password for your Remotive SalesHub account.</p>
        <p>
          Click the button below to create a new password:
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          This password reset link will expire in <strong>{expiresInHours} hour{expiresInHours > 1 ? 's' : ''}</strong> for security.
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </>
    ),
    ctaText: 'Reset Password',
    ctaLink: resetLink,
    footerText:
      'This is an automated email. Please do not reply to this message. If you need assistance, contact your system administrator.',
  });
}
