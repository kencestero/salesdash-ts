# Email System Setup Guide

This guide covers setting up a transactional email service for your sales dashboard. The system is designed to send emails for notifications, customer communications, and marketing campaigns.

## Overview

The application includes:
- **Email database model** (Prisma schema already configured)
- **EmailTemplate database model** (for reusable email templates)
- **React Email templates** (for beautiful, responsive emails)
- Integration points for email service provider

## Recommended Email Service Providers

### 1. **Resend** (Recommended for this project)

**Pros:**
- Modern, developer-friendly API
- Built-in React Email support
- Generous free tier (100 emails/day, 3,000/month)
- Great deliverability
- Excellent documentation

**Setup:**

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use dev mode for testing)
3. Get your API key from the dashboard

**Environment Variables:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com  # or onboarding@resend.dev for testing
```

**Installation:**
```bash
pnpm add resend
```

**Example Usage:**
```typescript
// app/api/email/send/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

---

### 2. **SendGrid**

**Pros:**
- Industry standard
- Very generous free tier (100 emails/day forever)
- Advanced analytics and tracking
- Good deliverability

**Setup:**

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key (Settings → API Keys)
3. Verify your sender email or domain

**Environment Variables:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Installation:**
```bash
pnpm add @sendgrid/mail
```

**Example Usage:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, html: string) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM!,
    subject,
    html,
  };

  return await sgMail.send(msg);
}
```

---

### 3. **AWS SES (Simple Email Service)**

**Pros:**
- Extremely cost-effective at scale ($0.10 per 1,000 emails)
- High deliverability
- Part of AWS ecosystem
- No daily sending limits after verification

**Cons:**
- More complex setup
- Requires AWS account
- Starts in sandbox mode (must request production access)

**Setup:**

1. Create AWS account
2. Set up IAM user with SES permissions
3. Verify email/domain in SES console
4. Request production access (to send to any email)

**Environment Variables:**
```bash
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Installation:**
```bash
pnpm add @aws-sdk/client-ses
```

---

### 4. **Postmark**

**Pros:**
- Excellent deliverability (focused on transactional emails)
- Great customer support
- Good free tier (100 emails/month)
- Simple, clean API

**Environment Variables:**
```bash
POSTMARK_API_KEY=xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

## Implementation Guide

### Step 1: Choose and Configure Email Provider

Add environment variables to your `.env` file based on your chosen provider (see examples above).

### Step 2: Update .env.example

Add to `.env.example`:
```bash
# Email Configuration (choose one provider)
# Resend (Recommended)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Or SendGrid
# SENDGRID_API_KEY=your-sendgrid-api-key
# EMAIL_FROM=noreply@yourdomain.com

# Or AWS SES
# AWS_SES_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# EMAIL_FROM=noreply@yourdomain.com
```

### Step 3: Create Email Service Utility

Create `lib/email.ts`:

```typescript
import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  templateId?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, templateId } = options;

  try {
    // Send email via Resend
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });

    // Log email to database
    await prisma.email.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        body: html,
        status: 'sent',
        sentAt: new Date(),
        templateId: templateId || null,
      },
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send error:', error);

    // Log failed email
    await prisma.email.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        body: html,
        status: 'failed',
        templateId: templateId || null,
      },
    });

    throw error;
  }
}
```

### Step 4: Create Email API Route

Create `app/api/email/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, html, templateId } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    const result = await sendEmail({ to, subject, html, templateId });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

### Step 5: Using React Email Templates

The app already has React Email installed. Use it to create beautiful emails:

```typescript
// Example: Send welcome email
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/welcome';
import { sendEmail } from '@/lib/email';

async function sendWelcomeEmail(userEmail: string, userName: string) {
  const emailHtml = render(<WelcomeEmail userName={userName} />);

  await sendEmail({
    to: userEmail,
    subject: 'Welcome to Remotive Logistics!',
    html: emailHtml,
    templateId: 'welcome',
  });
}
```

### Step 6: Add Email Templates to Database

Create email templates in the database for reusability:

```typescript
// scripts/seed-email-templates.ts
import { prisma } from '../lib/prisma';

async function seedEmailTemplates() {
  await prisma.emailTemplate.createMany({
    data: [
      {
        name: 'Welcome Email',
        slug: 'welcome',
        subject: 'Welcome to Remotive Logistics!',
        body: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
      },
      {
        name: 'Credit Application Approved',
        slug: 'credit-approved',
        subject: 'Your Credit Application Has Been Approved',
        body: '<h1>Congratulations!</h1><p>Your credit application has been approved.</p>',
      },
      {
        name: 'New Deal Notification',
        slug: 'deal-notification',
        subject: 'New Deal Alert',
        body: '<h1>New Deal</h1><p>A new deal has been created.</p>',
      },
    ],
  });
}

seedEmailTemplates();
```

Run: `pnpm tsx scripts/seed-email-templates.ts`

---

## Email Use Cases for Your Sales Dashboard

### 1. **Customer Communications**
- Welcome emails for new customers
- Deal updates and notifications
- Invoice reminders
- Follow-up emails after viewings

### 2. **Credit Application Workflow**
- Application received confirmation
- Application approved/declined notifications
- Documents required emails

### 3. **Internal Notifications**
- New lead notifications to sales team
- Daily/weekly sales reports
- Inventory alerts (low stock, new arrivals)

### 4. **Marketing Campaigns**
- Promotional emails for trailers
- Seasonal sales announcements
- Newsletter updates

---

## Testing Email System

### Development Testing

Use Resend's dev mode or create a test API endpoint:

```typescript
// app/api/email/test/route.ts
import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sendEmail({
      to: 'your-email@example.com',
      subject: 'Test Email from Remotive Logistics Dashboard',
      html: '<h1>Test Email</h1><p>This is a test email.</p>',
    });

    return NextResponse.json({ message: 'Test email sent!' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

Visit `/api/email/test` to send a test email.

---

## Security Best Practices

✅ **DO:**
- Store API keys in environment variables
- Use server-side API routes only (never expose keys to client)
- Validate recipient email addresses
- Rate limit email sending endpoints
- Log all email sends to database
- Use HTTPS for all email-related requests

❌ **DON'T:**
- Hardcode API keys in your code
- Expose email service credentials in client-side code
- Allow unauthenticated users to send emails
- Send emails without rate limiting
- Store email content without sanitization

---

## Vercel Deployment

Add environment variables to Vercel:

```bash
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
```

Select "Production", "Preview", and "Development" when prompted.

Or use Vercel dashboard: Project Settings → Environment Variables

---

## Cost Comparison

| Provider | Free Tier | Paid Pricing | Best For |
|----------|-----------|--------------|----------|
| **Resend** | 3,000/month | $20/mo for 50k | Modern apps, React Email |
| **SendGrid** | 100/day forever | $15/mo for 40k | Established apps, analytics |
| **AWS SES** | 62,000 (first year) | $0.10 per 1k | High volume, AWS users |
| **Postmark** | 100/month | $15/mo for 10k | Transactional emails |

---

## Troubleshooting

### Emails not sending
1. Check API key is correct and active
2. Verify sender email/domain is verified
3. Check email service provider dashboard for errors
4. Review server logs for error messages

### Emails going to spam
1. Verify your domain with SPF, DKIM, DMARC records
2. Use a professional "from" email (not gmail/yahoo)
3. Warm up your sending domain gradually
4. Avoid spam trigger words in subject/body

### Rate limiting errors
1. Check your plan's sending limits
2. Implement queue system for bulk emails
3. Upgrade to higher tier if needed

---

## Next Steps

1. Choose your email provider (Resend recommended)
2. Sign up and get API credentials
3. Add environment variables
4. Install the SDK (`pnpm add resend`)
5. Create `lib/email.ts` utility
6. Create email API route
7. Test with a simple email
8. Integrate into your application workflows

---

**Questions?** Check your provider's documentation:
- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com)
- [AWS SES Docs](https://docs.aws.amazon.com/ses/)
- [Postmark Docs](https://postmarkapp.com/developer)
