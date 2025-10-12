import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, isEmailServiceConfigured } from "@/lib/email/resend-service";
import { generateTodayCode } from "@/lib/join-codes";

/**
 * POST /api/email/request-owner-code
 *
 * Request Owner code to be sent via email to administrators
 * Only accessible to authenticated users
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if email service is configured
    if (!isEmailServiceConfigured()) {
      return NextResponse.json(
        {
          error: "Email service not configured",
          message: "Please configure RESEND_API_KEY to enable email sending",
        },
        { status: 503 }
      );
    }

    // Generate today's owner code
    const ownerCode = generateTodayCode("owner");

    // Get requester info
    const requesterName = session.user.name || session.user.email;
    const requesterEmail = session.user.email;

    console.log(`🔐 Owner code requested by: ${requesterName} (${requesterEmail})`);

    // Create owner code email template
    const MJCargoEmail = (await import("@/lib/email/templates/mj-cargo-base")).default;

    const emailContent = MJCargoEmail({
      heading: "Owner Code Request",
      body: (
        <>
          <p><strong>An Owner code has been requested from the Sales Dashboard.</strong></p>

          <div style={{
            backgroundColor: '#fff3e0',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #FF6B2C',
            margin: '24px 0',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: '0 0 8px 0',
              fontWeight: 'normal'
            }}>
              Today's Owner Code
            </p>
            <p style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#FF6B2C',
              margin: '0',
              letterSpacing: '4px',
              fontFamily: 'monospace'
            }}>
              {ownerCode}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#999',
              margin: '8px 0 0 0'
            }}>
              Expires at midnight (ET)
            </p>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Requested by:</strong> {requesterName}
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Email:</strong> {requesterEmail}
            </p>
            <p style={{ margin: '4px 0', fontSize: '14px' }}>
              <strong>Time:</strong> {new Date().toLocaleString('en-US', {
                timeZone: 'America/New_York',
                dateStyle: 'full',
                timeStyle: 'long'
              })}
            </p>
          </div>

          <p><strong>⚠️ Important Security Reminders:</strong></p>
          <ul>
            <li>The Owner code grants <strong>full system access</strong></li>
            <li>Only share with trusted administrators</li>
            <li>Verify the requester's identity before sharing</li>
            <li>Code expires at midnight (Eastern Time)</li>
            <li>All Owner code usage is logged and auditable</li>
          </ul>

          <p>If you did not expect this request, please contact the requester immediately.</p>
        </>
      ),
      footerText: "This is an automated security notification from MJ Cargo Sales Dashboard. Owner code requests are logged for security purposes."
    });

    // Send email to both owners
    const recipients = ["mjcargotrailers@gmail.com", "kencestero@gmail.com"];

    const results = await Promise.allSettled(
      recipients.map(email =>
        sendEmail({
          to: email,
          subject: `🔐 Owner Code Request from ${requesterName}`,
          react: emailContent,
          tags: [
            { name: 'category', value: 'owner-code-request' },
            { name: 'requester', value: requesterEmail },
          ],
        })
      )
    );

    // Check if any emails failed
    const failed = results.filter(r => r.status === 'rejected');
    const succeeded = results.filter(r => r.status === 'fulfilled');

    if (failed.length === results.length) {
      // All emails failed
      throw new Error("Failed to send emails to any recipients");
    }

    console.log(`✅ Owner code emails sent: ${succeeded.length}/${results.length} successful`);

    return NextResponse.json({
      success: true,
      message: `Owner code request sent to ${succeeded.length} administrator(s)`,
      details: {
        sent: succeeded.length,
        failed: failed.length,
        recipients: recipients,
      },
    });
  } catch (error: any) {
    console.error("❌ Owner code request error:", error);
    return NextResponse.json(
      { error: "Failed to send owner code request", message: error.message },
      { status: 500 }
    );
  }
}
