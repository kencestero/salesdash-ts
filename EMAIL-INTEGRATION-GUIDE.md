# Remotive Logistics Email Integration Guide

## 🎯 Overview

The Remotive Logistics Sales Dashboard now includes a complete email system with professional, branded templates using Resend and React Email.

## ✨ Features

- **Remotive Logistics Orange Branding**: All emails feature the signature orange color (#FF6B2C)
- **Professional Templates**: Welcome emails, quote emails, password resets
- **Mobile Responsive**: Beautiful on all devices
- **Email Analytics**: Track opens, clicks, and delivery with Resend
- **Dashboard Integration**: Send emails directly from the UI
- **Developer-Friendly**: React components for easy customization

## 📁 File Structure

```
lib/email/
├── resend-service.ts          # Resend API integration
└── templates/
    ├── mj-cargo-base.tsx      # Base template (orange branding)
    ├── welcome-email.tsx      # Welcome new team members
    ├── quote-email.tsx        # Send quotes to customers
    └── password-reset.tsx     # Password reset emails

app/api/email/
├── send/route.ts              # Send email API endpoint
└── test/route.ts              # Test email configuration

app/[lang]/(dashboard)/
└── email-center/page.tsx      # Email dashboard UI

components/email/
└── email-sender.tsx           # Email form component
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
pnpm add resend @react-email/components
```

### Step 2: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for free account (3,000 emails/month included)
3. Verify your email address
4. Complete onboarding

### Step 3: Get API Key

1. Go to Resend dashboard: [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it: `Remotive Logistics SalesDash`
4. Copy the API key (starts with `re_`)

### Step 4: Add to Environment Variables

**Local Development (.env.local):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="Remotive Logistics <noreply@yourdomain.com>"
```

**Vercel Production:**
```bash
vercel env add RESEND_API_KEY
# Paste your API key when prompted

vercel env add RESEND_FROM_EMAIL
# Enter: Remotive Logistics <noreply@yourdomain.com>
```

### Step 5: Domain Verification (Optional but Recommended)

**For testing**, you can use Resend's default sender:
- `onboarding@resend.dev` (no verification needed)

**For production**, verify your domain:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain: `remotive.com` (or your actual domain)
4. Add DNS records provided by Resend:
   - **SPF**: TXT record for email authentication
   - **DKIM**: TXT record for email signing
   - **DMARC**: TXT record for email policy

5. Wait 24-48 hours for DNS propagation
6. Update `RESEND_FROM_EMAIL` to use your domain:
   ```bash
   RESEND_FROM_EMAIL="Remotive Logistics <noreply@remotivelogistics.com>"
   ```

### Step 6: Test Email Service

1. Navigate to: `/en/email-center`
2. Click "Send Test Email" button
3. Check your inbox (and spam folder)
4. Verify the email has Remotive Logistics orange branding

Or use API directly:
```bash
curl https://salesdash-ts.vercel.app/api/email/test?to=your-email@example.com
```

## 📧 Email Templates

### 1. Welcome Email
**Use case**: Onboard new team members

**Features**:
- Personalized greeting
- Employee number and role display
- Dashboard access button
- Quick start checklist

**Usage**:
```typescript
import { sendWelcomeEmail } from '@/lib/email/resend-service';

await sendWelcomeEmail(
  'newuser@example.com',
  'John Doe',
  'Sales Representative',
  'REP123456'
);
```

### 2. Quote Email
**Use case**: Send pricing quotes to customers

**Features**:
- Unit description and price
- Multiple payment options mention
- View Quote button
- Rep contact info

**Usage**:
```typescript
import { sendQuoteEmail } from '@/lib/email/resend-service';

await sendQuoteEmail(
  'customer@example.com',    // Customer email
  'Jane Smith',              // Customer name
  'Bob Johnson',             // Rep name
  '7x16 TA Enclosed',        // Unit description
  8500,                      // Unit price
  'https://salesdash.com/quote/abc123',  // Quote link
  'bob@remotivelogistics.com'          // Rep email (optional, for reply-to)
);
```

### 3. Password Reset Email
**Use case**: Forgot password flow

**Features**:
- Secure reset link
- Expiration timer
- Security warnings
- One-time use token

**Usage**:
```typescript
import { sendPasswordResetEmail } from '@/lib/email/resend-service';

await sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'https://salesdash.com/reset/token123',
  60  // Expires in 60 minutes
);
```

## 🎨 Customizing Templates

All templates extend the base Remotive Logistics template. To customize:

### Edit Base Template
Location: `lib/email/templates/mj-cargo-base.tsx`

**Change colors**:
```typescript
const header = {
  backgroundColor: '#FF6B2C',  // Remotive Logistics orange
  // Change to your color
};

const button = {
  backgroundColor: '#FF6B2C',
  // Change to your color
};
```

**Update company info**:
```typescript
<Text style={footerTextStyle}>
  📍 Your Location • 📞 (555) 123-4567 • 📧 info@remotivelogistics.com
</Text>
```

### Create New Template

1. Copy an existing template:
```bash
cp lib/email/templates/quote-email.tsx lib/email/templates/my-template.tsx
```

2. Modify the template content
3. Export function from `resend-service.ts`
4. Add to email-center UI

## 🔌 Dashboard Integration

### Send Email from Dashboard

Navigate to: `/en/email-center`

**Features**:
- Tabbed interface for different email types
- Form validation
- Success/error feedback
- Test email button
- Configuration status

### Send Email Programmatically

```typescript
// In any server component or API route
import { sendQuoteEmail } from '@/lib/email/resend-service';

export async function POST(req: Request) {
  await sendQuoteEmail(
    customerEmail,
    customerName,
    repName,
    unitDescription,
    unitPrice,
    quoteLink
  );

  return Response.json({ success: true });
}
```

### Send Email from Client Component

```typescript
"use client";

async function handleSendQuote() {
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'quote',
      data: {
        customerEmail: 'customer@example.com',
        customerName: 'Jane Smith',
        repName: 'Bob Johnson',
        unitDescription: '7x16 TA Enclosed',
        unitPrice: 8500,
        quoteLink: 'https://salesdash.com/quote/abc123',
      },
    }),
  });

  const result = await response.json();
  console.log('Email sent:', result.id);
}
```

## 📊 Email Analytics

Resend provides built-in analytics:

1. Go to [resend.com/emails](https://resend.com/emails)
2. View all sent emails
3. Track:
   - ✅ Delivery status
   - 📧 Opens (when customer opens email)
   - 🔗 Clicks (when customer clicks links)
   - ❌ Bounces and errors
   - 📅 Send time and delivery time

### Add Tags for Better Tracking

Tags are automatically added to emails:
```typescript
// In resend-service.ts
tags: [
  { name: 'category', value: 'quote' },
  { name: 'rep', value: repName },
]
```

Filter emails by tags in Resend dashboard.

## 🛡️ Security Best Practices

1. **Never commit API keys**
   - Use `.env.local` (already in `.gitignore`)
   - Use Vercel environment variables for production

2. **Verify sender domain**
   - Prevents emails from going to spam
   - Builds trust with customers

3. **Rate limiting**
   - Resend free tier: 3,000 emails/month
   - 100 emails/day limit
   - For higher volume, upgrade plan

4. **Email validation**
   - Always validate email addresses before sending
   - Handle bounces and unsubscribes

## 🐛 Troubleshooting

### Emails Not Sending

**Check configuration**:
```bash
# Test endpoint will show detailed error
curl https://salesdash-ts.vercel.app/api/email/test
```

**Common issues**:
1. ❌ API key not set → Add `RESEND_API_KEY` to environment
2. ❌ Invalid sender email → Use verified domain or `onboarding@resend.dev`
3. ❌ Missing dependencies → Run `pnpm install`
4. ❌ Rate limit exceeded → Wait 24 hours or upgrade plan

### Emails Going to Spam

1. **Verify your domain** (see Step 5 above)
2. **Add SPF/DKIM/DMARC records**
3. **Use professional sender name**: `Remotive Logistics <noreply@remotivelogistics.com>`
4. **Avoid spam trigger words** in subject/body
5. **Include unsubscribe link** for marketing emails

### Template Not Rendering

1. **Check React Email components** are imported:
   ```typescript
   import { Html, Body, Container, Text } from '@react-email/components';
   ```

2. **Verify template exports default function**:
   ```typescript
   export default function MyTemplate() { ... }
   ```

3. **Test template rendering**:
   ```typescript
   import { render } from '@react-email/components';
   const html = render(<MyTemplate />);
   console.log(html);
   ```

## 📈 Usage Monitoring

**Free Tier Limits**:
- 3,000 emails/month
- 100 emails/day
- Unlimited API requests

**Check usage**:
1. Go to [resend.com/overview](https://resend.com/overview)
2. View monthly email count
3. See remaining quota

**Upgrade if needed**:
- Pro: $20/month → 50,000 emails
- Business: Custom pricing

## 🔗 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Components](https://react.email/docs/components)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Get Resend API key
3. ✅ Add to environment variables
4. ✅ Send test email
5. ✅ Verify domain (for production)
6. ✅ Customize templates with your branding
7. ✅ Integrate into your workflows

---

**Need help?** Check the troubleshooting section or contact the development team.

**Want custom templates?** Edit files in `lib/email/templates/`
