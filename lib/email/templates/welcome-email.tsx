import remotiveEmail from './mj-cargo-base';

interface WelcomeEmailProps {
  userName: string;
  userRole: string;
  employeeNumber: string;
}

export default function WelcomeEmail({ userName, userRole, employeeNumber }: WelcomeEmailProps) {
  return (
    <remotiveEmail
      preview="Welcome to Remotive Logistics Sales Dashboard!"
      heading={`Welcome to the Team, ${userName}!`}
      body={
        <>
          <p>We're excited to have you join Remotive Logistics Trailers as a <strong>{userRole}</strong>.</p>

          <p>Your account has been successfully created with the following details:</p>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: '4px solid #FF6B2C',
            margin: '20px 0'
          }}>
            <p style={{ margin: '4px 0' }}><strong>Name:</strong> {userName}</p>
            <p style={{ margin: '4px 0' }}><strong>Role:</strong> {userRole}</p>
            <p style={{ margin: '4px 0' }}><strong>Employee #:</strong> {employeeNumber}</p>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Access your dashboard to view available inventory</li>
            <li>Use the Finance Calculator to create customer quotes</li>
            <li>Track your deals and manage customer relationships</li>
            <li>View your activity and performance metrics</li>
          </ul>

          <p>If you have any questions, reach out to your manager or contact our support team.</p>

          <p style={{ marginTop: '24px' }}>Welcome aboard!</p>
          <p><strong>Remotive Logistics Team</strong></p>
        </>
      }
      ctaText="Access Dashboard"
      ctaLink="https://salesdash-ts.vercel.app/en/dashboard"
    />
  );
}
