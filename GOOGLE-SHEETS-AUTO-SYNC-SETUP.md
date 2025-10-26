# Google Sheets Auto-Sync Setup Guide

## 🎯 What This Does

Automatically syncs leads from your Google Sheets CRM to SalesDash database **every hour**.

**Your Sheet:** https://docs.google.com/spreadsheets/d/1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA/

---

## ✅ What's Already Built

- ✅ Google Sheets API client (`lib/google-sheets.ts`)
- ✅ Cron endpoint (`/api/cron/sync-sheets`)
- ✅ Vercel Cron schedule (every hour)
- ✅ Handles separate First/Last name columns (D & E)
- ✅ Auto-detects duplicates (by phone/email)
- ✅ Updates existing leads with new notes

---

## 📋 Column Mapping (17 Columns)

| Column | Google Sheets | SalesDash Field |
|--------|---------------|-----------------|
| A | Timestamp | `createdAt` |
| B | Sales Rep | `salesRepName` |
| C | Customer Names | ~~Skipped (backup)~~ |
| **D** | **First Name** | **`firstName`** ✅ |
| **E** | **Last Name** | **`lastName`** ✅ |
| F | Phone | `phone` |
| G | Trailer Size | `trailerSize` |
| H | Assigned Manager | `assignedToName` |
| I | Stock Number | `stockNumber` |
| J | Applied | `applied` |
| K | Date Applied | `dateApplied` |
| L | Cash/Finance/RTO | `financingType` |
| M | Manager Notes | `managerNotes` |
| N | Rep Notes | `repNotes` |
| O | Address | `street` |
| P | Zip Code | `zipcode` |
| Q | State | `state` |

---

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "MJ Cargo CRM Sync"
3. Enable **Google Sheets API**
4. Create Service Account:
   - Name: `salesdash-sheets-sync`
   - Role: **Editor** (or Viewer if read-only)
5. Create JSON key and download it

### Step 2: Share Your Google Sheet

1. Open your Google Sheet
2. Click **Share** button
3. Paste service account email (from JSON file):
   ```
   salesdash-sheets-sync@your-project.iam.gserviceaccount.com
   ```
4. Give **Viewer** permission (read-only is enough)
5. Click **Send**

### Step 3: Add Environment Variables

Add to your `.env` file (and Vercel):

```bash
# Google Sheets Service Account
GOOGLE_SHEETS_CLIENT_EMAIL="salesdash-sheets-sync@your-project.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

# Cron Security (generate random string)
CRON_SECRET="your-random-secret-key-here"
```

**How to get the private key:**
Open the JSON file you downloaded and copy the `private_key` value (including the `-----BEGIN PRIVATE KEY-----` part).

### Step 4: Add to Vercel

```bash
# Add environment variables
vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
vercel env add GOOGLE_SHEETS_PRIVATE_KEY
vercel env add CRON_SECRET

# Deploy
vercel --prod
```

Or via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select "Production" environment
4. Redeploy

---

## ⏱️ Cron Schedule

**Frequency:** Every hour at :00 minutes
**Schedule:** `0 * * * *` (cron expression)

**Examples:**
- 12:00 PM
- 1:00 PM
- 2:00 PM
- etc.

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-sheets",
      "schedule": "0 * * * *"  // Every hour
      // "schedule": "*/30 * * * *"  // Every 30 minutes
      // "schedule": "0 */3 * * *"  // Every 3 hours
    }
  ]
}
```

---

## 🧪 Testing

### Test Locally

You can't test cron jobs locally, but you can test the endpoint:

```bash
# In your terminal
curl http://localhost:3000/api/cron/sync-sheets \
  -H "Authorization: Bearer your-cron-secret"
```

### Test on Vercel

After deployment, check the Vercel logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click **Logs**
4. Filter by `/api/cron/sync-sheets`

You'll see output like:
```
🔄 Starting Google Sheets CRM sync...
📊 Found 693 leads in Google Sheet
✅ Created: John Doe (555-1234)
✏️  Updated: Jane Smith (555-5678)
⏭️  Duplicates Skipped: 685
✅ Google Sheets CRM Sync Complete!
```

---

## 📊 Sync Behavior

### New Leads
If a lead doesn't exist in the database (by phone OR email):
- ✅ Creates new Customer record
- ✅ Uses separate First/Last name from columns D & E
- ✅ Tags with `google_sheets`

### Existing Leads
If a lead already exists:
- ✅ Updates manager notes if changed
- ✅ Updates rep notes if changed
- ✅ Updates applied status if changed
- ✅ Skips if no changes detected

### Duplicate Detection
Checks for existing customers by:
- Phone number match
- OR email match

---

## 🔒 Security

### Cron Secret
The `CRON_SECRET` prevents unauthorized access to your cron endpoint.

Without it, anyone could trigger the sync by visiting:
```
https://your-app.vercel.app/api/cron/sync-sheets
```

With it, they need the secret:
```bash
curl https://your-app.vercel.app/api/cron/sync-sheets \
  -H "Authorization: Bearer your-secret"
```

Vercel automatically includes this header when running scheduled cron jobs.

---

## 📈 Expected Results

### After First Sync
- **693 leads** (or however many you have) imported
- ✅ All fields mapped correctly
- ✅ Separate first/last names
- ✅ Manager notes + Rep notes preserved

### After Subsequent Syncs
- ✅ Only new leads created
- ✅ Changed leads updated
- ✅ Duplicates skipped (fast)

---

## 🐛 Troubleshooting

### Error: "Missing Google Sheets credentials"
- Make sure `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY` are set
- Check that private key has `\n` characters (newlines)

### Error: "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email
- Check that service account has at least Viewer permission

### Error: "Unauthorized"
- Make sure `CRON_SECRET` matches in .env and Vercel
- Check that you're sending `Authorization: Bearer <secret>` header

### No Leads Imported
- Check that sheet name is "Form Responses 1" (or update `SHEET_NAME` in `lib/google-sheets.ts`)
- Verify columns A-Q have data
- Check Vercel logs for errors

---

## 🎉 Success Metrics

Once working, you should see:
- ✅ 693+ leads in SalesDash CRM
- ✅ Hourly syncs in Vercel logs
- ✅ New Google Sheet submissions auto-imported within 1 hour
- ✅ Changes to notes/status synced automatically

---

## 📚 File Reference

**Created Files:**
- `lib/google-sheets.ts` - Google Sheets API client
- `app/api/cron/sync-sheets/route.ts` - Sync endpoint
- `vercel.json` - Cron schedule configuration
- `.env.template` - Environment variable template

---

**Next:** Test the sync, then move to Phase 2 (Python Inventory Import)! 🚀
