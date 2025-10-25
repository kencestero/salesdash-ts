import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, customerName, message } = await req.json();
    
    const data = await resend.emails.send({
      from: 'MJ Cargo Sales <sales@mjcargo.com>',
      to: [to],
      subject: subject || `Follow up from MJ Cargo Trailer Sales`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">MJ Cargo Trailer Sales</h1>
          </div>
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hi ${customerName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              ${message || 'Thank you for your interest in MJ Cargo Trailers!'}
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              I wanted to follow up on your inquiry about our trailers. We have some great options available that might be perfect for your needs.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Please let me know if you have any questions or would like to schedule a time to discuss.
            </p>
            <br/>
            <p style="color: #4b5563;">
              Best regards,<br/>
              <strong>MJ Cargo Sales Team</strong><br/>
              📞 Call us: 1-800-TRAILERS<br/>
              📧 Email: sales@mjcargo.com
            </p>
          </div>
        </div>
      `
    });
    
    console.log(`✉️ Email sent to ${customerName} at ${to}`);
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: `Email sent successfully to ${to}`
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
