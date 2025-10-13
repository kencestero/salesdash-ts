/**
 * Email Verification Template
 */

import MJCargoEmail from './mj-cargo-base';

interface VerifyEmailProps {
  userName: string;
  verificationLink: string;
  expiresInHours?: number;
}

export default function VerifyEmail({
  userName,
  verificationLink,
  expiresInHours = 24,
}: VerifyEmailProps) {
  return MJCargoEmail({
    preview: 'Verify your email address to complete registration',
    heading: `Welcome ${userName}! 🎉`,
    body: (
      <>
        <p>Thank you for creating an account with MJ Cargo Sales Dashboard!</p>
        <p>
          To complete your registration and access your account, please verify
          your email address by clicking the button below:
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
          This verification link will expire in <strong>{expiresInHours} hours</strong>.
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
          If you didn't create an account with MJ Cargo, you can safely ignore this email.
        </p>
      </>
    ),
    ctaText: 'Verify Email Address',
    ctaLink: verificationLink,
    footerText:
      'This is an automated email. Please do not reply to this message. If you need assistance, contact your system administrator.',
  });
}