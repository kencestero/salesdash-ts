/**
 * Password Changed Confirmation Email Template
 */

import remotiveEmail from './mj-cargo-base';

interface PasswordChangedEmailProps {
  userName: string;
  changeTime: string;
  loginLink: string;
}

export default function PasswordChangedEmail({
  userName,
  changeTime,
  loginLink,
}: PasswordChangedEmailProps) {
  return remotiveEmail({
    preview: 'Your Remotive SalesHub password has been changed',
    heading: `Hi ${userName}! 🔐`,
    body: (
      <>
        <p>Your password for Remotive SalesHub has been successfully changed.</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
          <strong>Time:</strong> {changeTime}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
          If you made this change, you can safely ignore this email. Your account is secure.
        </p>
        <p style={{ fontSize: '14px', color: '#dc2626', marginTop: '24px', padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626' }}>
          <strong>⚠️ Didn't change your password?</strong><br />
          If you did NOT make this change, please contact your system administrator immediately. 
          Your account may have been compromised.
        </p>
      </>
    ),
    ctaText: 'Login to SalesDash',
    ctaLink: loginLink,
    footerText:
      'This is an automated security notification. Please do not reply to this message. If you need assistance, contact your system administrator.',
  });
}
