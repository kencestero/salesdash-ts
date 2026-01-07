import remotiveEmail from './mj-cargo-base';

interface PasswordResetProps {
  userName: string;
  resetLink: string;
  expiresInMinutes?: number;
}

export default function PasswordResetEmail({
  userName,
  resetLink,
  expiresInMinutes = 60,
}: PasswordResetProps) {
  return (
    <remotiveEmail
      preview="Reset your Remotive Logistics Dashboard password"
      heading="Password Reset Request"
      body={
        <>
          <p>Hi {userName},</p>

          <p>We received a request to reset your password for the Remotive Logistics Sales Dashboard.</p>

          <p>Click the button below to choose a new password:</p>

          <div style={{
            backgroundColor: '#fff3e0',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: '4px solid #FF6B2C',
            margin: '20px 0'
          }}>
            <p style={{ margin: '0', fontSize: '14px' }}>
              ⚠️ <strong>This link expires in {expiresInMinutes} minutes</strong> for security reasons.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: '#666' }}>
            If you didn't request a password reset, you can safely ignore this email.
            Your password will not be changed.
          </p>
        </>
      }
      ctaText="Reset Password"
      ctaLink={resetLink}
      footerText="For security reasons, this password reset link will expire after use or after 60 minutes, whichever comes first."
    />
  );
}
