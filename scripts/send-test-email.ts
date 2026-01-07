import { Resend } from 'resend';

// Load API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Remotive Logistics <noreply@mjsalesdash.com>',
      to: ['kencestero@gmail.com'],
      subject: 'Test Email from Remotive Logistics Sales Dashboard',
      html: `
        <h1>🎉 Email Setup Complete!</h1>
        <p>This is a test email from your verified domain: <strong>mjsalesdash.com</strong></p>
        <p>Your email system is now working correctly!</p>
        <br>
        <p>- Remotive Logistics Team</p>
      `,
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', data?.id);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

sendTestEmail();
