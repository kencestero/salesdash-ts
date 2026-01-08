import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const BASE_URL = process.env.NEXTAUTH_URL || 'https://remotivelogistics.com';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, customerName, message, customerId } = await req.json();

    // Get current user for rep info
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const repName = currentUser.profile
      ? `${currentUser.profile.firstName || ''} ${currentUser.profile.lastName || ''}`.trim() || currentUser.name
      : currentUser.name || 'Remotive Logistics Sales Team';

    // Generate reply portal link if customerId provided
    let replyLink: string | null = null;
    let threadId: string | null = null;

    if (customerId) {
      // Find or create a message thread for this customer
      let thread = await prisma.messageThread.findFirst({
        where: { customerId },
      });

      if (!thread) {
        // Get customer to find assigned rep
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
        });

        if (customer) {
          thread = await prisma.messageThread.create({
            data: {
              customerId,
              assignedToId: customer.assignedToId || currentUser.id,
              managerId: customer.managerId || currentUser.profile?.managerId || null,
              subject: subject || 'Conversation with Remotive Logistics',
            },
          });
        }
      }

      if (thread) {
        replyLink = `${BASE_URL}/reply/${thread.portalToken}`;
        threadId = thread.id;

        // Log outbound email as a message in the thread
        await prisma.message.create({
          data: {
            threadId: thread.id,
            customerId,
            direction: 'OUTBOUND',
            channel: 'EMAIL',
            fromName: repName,
            fromEmail: session.user.email,
            toName: customerName,
            toEmail: to,
            bodyText: message || 'Thank you for your interest in Remotive Logistics Trailers!',
          },
        });

        // Update thread metadata
        await prisma.messageThread.update({
          where: { id: thread.id },
          data: {
            lastMessageAt: new Date(),
            lastMessagePreview: (message || 'Thank you for your interest...').substring(0, 200),
          },
        });
      }
    }

    // Build email HTML with reply button
    const replyButtonHtml = replyLink
      ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${replyLink}" style="display: inline-block; background: #E96114; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reply to This Message
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
            Click the button above to send us a message directly
          </p>
        </div>
      `
      : '';

    const data = await resend.emails.send({
      from: 'Remotive Logistics Sales <sales@remotivelogistics.com>',
      to: [to],
      subject: subject || `Follow up from Remotive Logistics Trailer Sales`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E96114 0%, #09213C 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Remotive Logistics Trailer Sales</h1>
          </div>
          <div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hi ${customerName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              ${message || 'Thank you for your interest in Remotive Logistics Trailers!'}
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              I wanted to follow up on your inquiry about our trailers. We have some great options available that might be perfect for your needs.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Please let me know if you have any questions or would like to schedule a time to discuss.
            </p>
            ${replyButtonHtml}
            <br/>
            <p style="color: #4b5563;">
              Best regards,<br/>
              <strong>${repName}</strong><br/>
              Remotive Logistics Sales Team<br/>
              📞 Call us: 1-800-TRAILERS<br/>
              📧 Email: sales@remotivelogistics.com
            </p>
          </div>
        </div>
      `
    });

    console.log(`✉️ Email sent to ${customerName} at ${to}${replyLink ? ' (with reply portal link)' : ''}`);

    return NextResponse.json({
      success: true,
      data,
      message: `Email sent successfully to ${to}`,
      threadId,
      replyLink,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
