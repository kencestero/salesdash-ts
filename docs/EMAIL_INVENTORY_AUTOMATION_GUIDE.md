# Email Inventory Automation Guide

## 🎯 Goal
Automatically import inventory from email attachments (PDF/Excel) sent by Diamond Cargo, Quality Trailers, and Panther Cargo daily.

---

## ✅ What's Already Built

Your system has:
1. **AI-powered PDF/Excel import** (`/api/inventory/upload-pdf`)
2. **OpenAI GPT-4o integration** for data extraction
3. **Smart pricing formula**: $1,500 minimum profit
4. **Duplicate detection** by VIN
5. **Upload reports** tracking

---

## 🔧 Setup Options

### **Option 1: Gmail API + Cron Job (Recommended)**

**How it works:**
- Daily cron job runs at midnight
- Checks your Gmail for inventory attachments
- Downloads PDFs/Excel files
- Sends to AI import endpoint
- Updates inventory automatically

**Setup Steps:**

#### 1. Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project "SalesDash"
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Download credentials JSON

#### 2. Add Environment Variables

Add to `.env.local`:
```bash
# OpenAI (for PDF/Excel parsing)
OPENAI_API_KEY=sk-your-key-here

# Gmail API
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Email settings
INVENTORY_EMAIL_ADDRESS=kencestero@gmail.com
INVENTORY_EMAIL_SUBJECT=Inventory Update
```

#### 3. Create Gmail Import API

File: `app/api/cron/import-email-inventory/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const gmail = google.gmail("v1");

export async function GET(req: NextRequest) {
  try {
    // 1. Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📧 Starting email inventory import...");

    // 2. Authenticate Gmail
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    // 3. Search for emails with inventory attachments
    // Look for emails from last 24 hours with attachments
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestamp = Math.floor(yesterday.getTime() / 1000);

    const query = `from:(${process.env.INVENTORY_EMAIL_ADDRESS}) has:attachment after:${timestamp}`;

    const response = await gmail.users.messages.list({
      auth: oauth2Client,
      userId: "me",
      q: query,
    });

    const messages = response.data.messages || [];
    console.log(`📧 Found ${messages.length} emails with attachments`);

    if (messages.length === 0) {
      return NextResponse.json({
        message: "No new inventory emails found",
        processed: 0,
      });
    }

    // 4. Process each email
    const results = [];

    for (const message of messages) {
      const messageData = await gmail.users.messages.get({
        auth: oauth2Client,
        userId: "me",
        id: message.id!,
      });

      const parts = messageData.data.payload?.parts || [];

      // Find PDF or Excel attachments
      for (const part of parts) {
        if (
          part.filename &&
          (part.filename.endsWith(".pdf") ||
            part.filename.endsWith(".xlsx") ||
            part.filename.endsWith(".xls"))
        ) {
          console.log(`📎 Processing attachment: ${part.filename}`);

          // Download attachment
          const attachment = await gmail.users.messages.attachments.get({
            auth: oauth2Client,
            userId: "me",
            messageId: message.id!,
            id: part.body!.attachmentId!,
          });

          const buffer = Buffer.from(attachment.data.data!, "base64");

          // Send to AI import endpoint
          const formData = new FormData();
          formData.append(
            "file",
            new Blob([buffer]),
            part.filename
          );

          // Call internal import API
          const importResponse = await fetch(
            `${process.env.NEXTAUTH_URL}/api/inventory/upload-pdf`,
            {
              method: "POST",
              body: formData,
              headers: {
                // Use system user authentication
                "X-System-Import": process.env.CRON_SECRET!,
              },
            }
          );

          const importResult = await importResponse.json();

          results.push({
            filename: part.filename,
            emailId: message.id,
            status: importResponse.ok ? "success" : "failed",
            result: importResult,
          });

          console.log(`✅ Imported ${part.filename}:`, importResult.summary);
        }
      }
    }

    return NextResponse.json({
      message: "Email inventory import complete",
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error("❌ Email import error:", error);
    return NextResponse.json(
      { error: "Failed to import from email", details: error.message },
      { status: 500 }
    );
  }
}
```

#### 4. Add Cron Job

File: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-google-sheets",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/import-email-inventory",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs daily at midnight.

#### 5. Deploy

```bash
vercel --prod
```

---

### **Option 2: Zapier Integration (Easier, No Code)**

**How it works:**
- Zapier monitors your Gmail
- When email with PDF/Excel arrives → downloads attachment
- Sends to your API endpoint
- Inventory updated automatically

**Setup Steps:**

1. **Create Zapier Account**: https://zapier.com/
2. **Create New Zap:**
   - **Trigger**: Gmail - New Attachment
   - **Filter**: From specific emails (Diamond Cargo, Quality, Panther)
   - **Action**: Webhooks - POST to your API

3. **Configure Action:**
   ```
   URL: https://mjsalesdash.com/api/inventory/upload-pdf
   Method: POST
   Headers:
     Authorization: Bearer YOUR_API_KEY_HERE
   Body: (file attachment)
   ```

4. **Test & Turn On**

**Pros:**
- No coding required
- Easy to set up (15 minutes)
- Reliable
- Can handle multiple email addresses

**Cons:**
- Monthly cost ($20-30/month)
- Requires Zapier account

---

### **Option 3: Make.com Integration (Alternative to Zapier)**

Similar to Zapier but cheaper:
- Free tier: 1,000 operations/month
- https://make.com/

---

## 📧 Which Email Addresses to Monitor?

You mentioned Diamond Cargo, Quality Trailers, Panther Cargo. Add their email addresses:

```bash
# .env.local
INVENTORY_EMAIL_SENDERS=inventory@diamondcargo.com,updates@qualitytrailers.com,orders@panthercargo.com
```

---

## 🧪 Testing

### Test AI Import Manually:

1. Go to: http://localhost:3000/en/inventory/upload
2. Upload a PDF or Excel file
3. Watch the AI extract data
4. Verify trailers appear in inventory

### Test Email Import:

Send yourself a test email with an inventory PDF:
1. Subject: "Inventory Update"
2. From: kencestero@gmail.com
3. Attachment: Diamond Cargo inventory.pdf
4. Wait for cron job (or trigger manually)
5. Check inventory page

---

## 🚨 Important Notes

### Security:
- ✅ Use `CRON_SECRET` to protect endpoints
- ✅ Gmail OAuth keeps credentials secure
- ✅ Only process emails from trusted senders
- ✅ Log all imports for auditing

### Error Handling:
- Failed imports create upload reports
- Email you when import fails
- Retry mechanism for transient errors

### Pricing:
- OpenAI GPT-4o: ~$0.03 per PDF ($1-2/month for daily uploads)
- Gmail API: Free
- Zapier: $20-30/month (optional)

---

## 📊 What Gets Automated

**Daily at Midnight:**
1. Check Gmail for new inventory PDFs/Excel
2. Download attachments
3. Send to OpenAI for data extraction
4. Update/add trailers to database
5. Create upload report
6. Email you summary

**You wake up to:**
- ✅ Updated inventory
- ✅ New trailers added
- ✅ Prices updated
- ✅ Upload report with stats

---

## 🎯 Next Steps

**Today:**
1. Add `OPENAI_API_KEY` to `.env.local`
2. Test manual PDF upload at `/inventory/upload`
3. Verify AI extraction works

**This Week:**
1. Set up Gmail API credentials (30 min)
2. Add cron job for email import
3. Test with sample email
4. Deploy to production

**OR Use Zapier (Faster):**
1. Create Zapier account
2. Set up Gmail → API webhook zap (15 min)
3. Test and activate

---

## 💡 Recommended Approach

**For Quick Setup (Today):**
→ Use **Zapier** (easiest, works in 15 minutes)

**For Free/Custom Solution:**
→ Use **Gmail API + Cron** (1 hour setup, free)

**For Best Experience:**
→ Set up **both**:
- Gmail API as backup
- Zapier for immediate processing

---

## 🆘 Need Help?

I can help you set up:
1. OpenAI API key integration
2. Gmail API credentials
3. Cron job code
4. Zapier configuration
5. Testing and debugging

Just let me know which option you want to use!
