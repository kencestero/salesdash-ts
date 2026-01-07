# Google Sheets CRM Integration Setup

## Overview
This guide will help you connect your Remotive Logistics Sales Dashboard to your Google Sheets CRM system, enabling real-time data sync between your dashboard and your existing Google Sheets.

---

## Step 1: Google Cloud Project Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Create Project"**
3. Name it: **"Remotive Logistics CRM Integration"**
4. Click **Create**

### 1.2 Enable Google Sheets API
1. In your project, go to **"APIs & Services" → "Library"**
2. Search for **"Google Sheets API"**
3. Click **"Enable"**

### 1.3 Create Service Account
1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "Service Account"**
3. Name: **"salesdash-crm-sync"**
4. Description: **"Remotive Logistics Sales Dashboard CRM Sync"**
5. Click **"Create and Continue"**
6. Role: Select **"Editor"** (or create custom role)
7. Click **"Done"**

### 1.4 Generate Service Account Key
1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key" → "Create New Key"**
4. Select **"JSON"**
5. Click **"Create"**
6. **Save this JSON file securely** (you'll need it!)

---

## Step 2: Share Google Sheet with Service Account

1. Open your Google Sheets CRM
2. Click **"Share"** button
3. Paste the service account email (looks like: `salesdash-crm-sync@project-name.iam.gserviceaccount.com`)
4. Give **"Editor"** permission
5. Click **"Send"**

**Repeat for ALL sheets you want to sync:**
- Customer database
- Deal pipeline
- Inventory tracker
- Credit applications
- etc.

---

## Step 3: Install Dependencies

```bash
pnpm add googleapis
```

---

## Step 4: Add Environment Variables

Add to `.env.local`:

```bash
# Google Sheets CRM Integration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="<YOUR_PRIVATE_KEY_FROM_JSON_FILE>"

# Sheet IDs (get from URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit)
GOOGLE_SHEET_CUSTOMERS_ID=your_customer_sheet_id
GOOGLE_SHEET_DEALS_ID=your_deals_sheet_id
GOOGLE_SHEET_INVENTORY_ID=your_inventory_sheet_id
```

**How to find Sheet ID:**
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/`**`1A2B3C4D5E6F7G8H9I`**`/edit`
- The long string is your Sheet ID

---

## Step 5: Google Sheets Structure

### Customer Sheet Example

| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| **ID** | **Name** | **Email** | **Phone** | **Status** | **Created** | **Notes** |
| 1 | John Doe | john@example.com | 555-1234 | Active | 2025-01-15 | Interested in 6x12 |
| 2 | Jane Smith | jane@example.com | 555-5678 | Lead | 2025-01-16 | Called about pricing |

### Deal Sheet Example

| Column A | Column B | Column C | Column D | Column E | Column F | Column G |
|----------|----------|----------|----------|----------|----------|----------|
| **Deal ID** | **Customer Name** | **Trailer** | **Price** | **Stage** | **Rep** | **Notes** |
| D001 | John Doe | 6x12 SA | $6,300 | Quote Sent | REP#A1B2C3 | Sent RTO quote |
| D002 | Jane Smith | 7x14 TA | $9,500 | Negotiating | REP#D4E5F6 | Wants discount |

### Inventory Sheet Example

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| **Unit ID** | **Type** | **Cost** | **Sale Price** | **Status** | **Location** |
| U001 | 6x12 SA | $4,900 | $6,300 | Available | Lot A |
| U002 | 7x14 TA | $7,800 | $9,500 | Reserved | Lot B |

---

## Step 6: Code Implementation

The integration code will be created in:
- `lib/google-sheets.ts` - Core Google Sheets utility
- `app/api/crm/sync/route.ts` - API endpoint to trigger sync
- `app/api/crm/customers/route.ts` - Customer CRUD operations
- `app/api/crm/deals/route.ts` - Deal CRUD operations

---

## Step 7: Security Best Practices

✅ **DO:**
- Store service account key securely (never commit to git)
- Use environment variables for credentials
- Limit service account permissions to minimum required
- Enable 2FA on your Google account
- Regularly rotate service account keys

❌ **DON'T:**
- Commit `.env.local` to version control
- Share service account keys publicly
- Give service account more permissions than needed
- Hardcode credentials in code

---

## Step 8: Testing

### Test API Connection
Create test endpoint: `app/api/test-sheets/route.ts`

```typescript
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_CUSTOMERS_ID,
      range: 'Sheet1!A1:G10', // Adjust to your sheet name and range
    });

    return NextResponse.json({
      success: true,
      data: response.data.values
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error
    }, { status: 500 });
  }
}
```

Visit `/api/test-sheets` to test connection.

---

## Step 9: Sync Strategies

### Strategy 1: Real-Time Sync (Recommended for small datasets)
- Every action updates both database AND Google Sheets
- Immediate consistency
- Works great for <10,000 rows

### Strategy 2: Scheduled Sync (Recommended for large datasets)
- Cron job runs every 5-15 minutes
- Syncs changes from Google Sheets → Database
- More efficient for large data

### Strategy 3: Hybrid
- Critical data (customers, deals) = Real-time
- Reference data (inventory) = Scheduled sync

---

## Step 10: Vercel Deployment

Add environment variables to Vercel:

```bash
vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
vercel env add GOOGLE_SHEETS_PRIVATE_KEY
vercel env add GOOGLE_SHEET_CUSTOMERS_ID
vercel env add GOOGLE_SHEET_DEALS_ID
vercel env add GOOGLE_SHEET_INVENTORY_ID
```

Or via Vercel Dashboard: Project Settings → Environment Variables

---

## Troubleshooting

### "The caller does not have permission"
- Make sure you shared the sheet with the service account email
- Check that service account has "Editor" permission

### "Invalid credentials"
- Verify `GOOGLE_SHEETS_PRIVATE_KEY` has `\n` characters properly formatted
- Check that `GOOGLE_SHEETS_CLIENT_EMAIL` matches service account

### "Spreadsheet not found"
- Verify Sheet ID is correct
- Make sure service account has access to the sheet

### Rate Limits
- Google Sheets API: 100 requests per 100 seconds per user
- Use batch operations when possible
- Implement caching for frequently accessed data

---

## Next Steps

1. ✅ Complete Google Cloud setup
2. ✅ Share sheets with service account
3. ✅ Add environment variables
4. ✅ Test connection with `/api/test-sheets`
5. ✅ Build CRM features
6. ✅ Deploy to production

---

## Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)

---

**Ready to build your high-end CRM!** 🚀
