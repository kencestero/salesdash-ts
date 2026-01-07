# Gmail API Setup Guide - Step by Step

## ✅ Why Gmail API > Zapier

- **FREE** (no monthly fees)
- **Unlimited** emails
- **More control** (custom logic)
- **Private** (your data stays secure)
- **Reliable** (direct integration)

---

## 🎯 What We're Building

**Automated Email Inventory Import:**
1. Daily cron job checks Gmail
2. Finds emails with PDF/Excel attachments
3. Downloads inventory files
4. Sends to AI for data extraction
5. Updates inventory automatically

**You wake up to updated inventory every day!** 📦

---

## 🔧 Setup Steps (30 minutes)

### **Step 1: Google Cloud Console Setup**

#### 1.1 Create Project

**Go to:** https://console.cloud.google.com/

1. Click **project dropdown** (top left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Project name: **SalesDash**
4. Click **"CREATE"**
5. Wait 10 seconds for project to be created
6. **Select the project** from dropdown

---

#### 1.2 Enable Gmail API

**Go to:** https://console.cloud.google.com/apis/library/gmail.googleapis.com

1. Make sure **"SalesDash"** project is selected (top left)
2. Click **"ENABLE"** button
3. Wait for confirmation (takes 5-10 seconds)

---

#### 1.3 Configure OAuth Consent Screen

**Go to:** https://console.cloud.google.com/apis/credentials/consent

1. Click **"OAuth consent screen"** (left sidebar)
2. User Type: Select **"External"**
3. Click **"CREATE"**

**Fill in App Information:**
- App name: **SalesDash**
- User support email: **kencestero@gmail.com**
- Developer contact: **kencestero@gmail.com**
- Click **"SAVE AND CONTINUE"**

**Scopes:**
- Click **"ADD OR REMOVE SCOPES"**
- Filter: type "gmail"
- Check these boxes:
  - ✅ `.../auth/gmail.readonly`
  - ✅ `.../auth/gmail.modify`
- Click **"UPDATE"**
- Click **"SAVE AND CONTINUE"**

**Test Users:**
- Click **"+ ADD USERS"**
- Enter: **kencestero@gmail.com**
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**
- Click **"BACK TO DASHBOARD"**

---

#### 1.4 Create OAuth Credentials

**Go to:** https://console.cloud.google.com/apis/credentials

1. Click **"+ CREATE CREDENTIALS"** (top)
2. Select **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **SalesDash Gmail Import**

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- Add: `http://localhost:3000/api/auth/gmail/callback`
- Click **"+ ADD URI"** again
- Add: `https://mjsalesdash.com/api/auth/gmail/callback`

5. Click **"CREATE"**

**SAVE THESE VALUES** (you'll need them):
- ✅ **Client ID** (looks like: 123456789-abc.apps.googleusercontent.com)
- ✅ **Client Secret** (looks like: GOCSPX-abc123def456)

---

### **Step 2: Add Credentials to .env.local**

Open: `c:\Users\kence\salesdash-ts\.env.local`

Add these lines:

```bash
# Gmail API (for email inventory import)
GMAIL_CLIENT_ID=your-client-id-here
GMAIL_CLIENT_SECRET=your-client-secret-here
GMAIL_REFRESH_TOKEN=will-get-this-in-next-step
```

**Replace:**
- `your-client-id-here` with your actual Client ID
- `your-client-secret-here` with your actual Client Secret

**Save the file.**

---

### **Step 3: Get Refresh Token**

Run the authorization script:

```bash
npx tsx scripts/gmail-auth-setup.ts
```

**What happens:**
1. Script shows you a URL
2. Copy and paste URL into browser
3. Google asks you to authorize SalesDash
4. Click **"Allow"**
5. You'll be redirected to a URL with `?code=...`
6. Copy the code from the URL
7. Paste it into the terminal
8. Script gives you a **REFRESH TOKEN**

**Copy the refresh token** and add to `.env.local`:

```bash
GMAIL_REFRESH_TOKEN=your-refresh-token-here
```

---

### **Step 4: Create Gmail Import API**

Create file: `app/api/cron/import-email-inventory/route.ts`

I'll do this for you - just confirm you're ready!

---

### **Step 5: Add Cron Job**

Edit: `vercel.json`

Add the new cron job:

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

This runs **daily at midnight**.

---

### **Step 6: Test Locally**

```bash
# Start dev server
pnpm dev

# In another terminal, test the cron endpoint
curl http://localhost:3000/api/cron/import-email-inventory -H "Authorization: Bearer remotive-sheets-sync-secure-key-2025"
```

---

### **Step 7: Deploy to Production**

```bash
vercel --prod
```

Done! 🎉

---

## 📧 Email Configuration

### Which Emails to Monitor?

Add to `.env.local`:

```bash
# Email senders to import from
INVENTORY_EMAIL_SENDERS=inventory@diamondcargo.com,updates@qualitytrailers.com,orders@panthercargo.com
```

The cron job will only process emails from these addresses.

---

## 🧪 Testing

### Test 1: Send Yourself a Test Email

1. Email yourself from **kencestero@gmail.com**
2. Subject: **"Inventory Update"**
3. Attach a **PDF or Excel** inventory file
4. Wait 1 minute

### Test 2: Run Cron Manually

```bash
curl https://mjsalesdash.com/api/cron/import-email-inventory \
  -H "Authorization: Bearer remotive-sheets-sync-secure-key-2025"
```

### Test 3: Check Inventory

Go to: https://mjsalesdash.com/en/inventory

Verify new trailers appeared!

---

## 🔒 Security

- ✅ Refresh token stored securely in `.env.local`
- ✅ Never exposed to client-side code
- ✅ Cron endpoint protected with secret
- ✅ Only processes emails from approved senders
- ✅ All imports logged in database

---

## 🐛 Troubleshooting

### "Invalid credentials" error

**Fix:** Make sure all 3 values are in `.env.local`:
- GMAIL_CLIENT_ID
- GMAIL_CLIENT_SECRET
- GMAIL_REFRESH_TOKEN

### "No refresh token" when running script

**Fix:**
1. Go to: https://myaccount.google.com/permissions
2. Find **"SalesDash"** and **Remove access**
3. Run script again: `npx tsx scripts/gmail-auth-setup.ts`

### Cron job not running

**Fix:** Check Vercel dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **"Cron Jobs"** tab
4. Verify job is enabled
5. Check execution logs

### "No emails found"

**Check:**
- Email has attachment (PDF/Excel)
- Email is from last 24 hours
- Email is from approved sender
- Gmail authorization is still valid

---

## 📊 What Gets Imported

**Supported File Types:**
- ✅ PDF (invoices, price lists)
- ✅ Excel (.xlsx, .xls)
- ✅ CSV

**Supported Manufacturers:**
- ✅ Diamond Cargo
- ✅ Quality Trailers
- ✅ Panther Cargo
- ✅ Custom (any manufacturer)

**Auto-Extracted Data:**
- VIN
- Stock Number
- Model
- Year
- Dimensions (length, width, height)
- Cost
- Calculated Price ($1,500 min profit)
- Features
- Status

---

## 💰 Cost

**Gmail API:** FREE ✅
**OpenAI GPT-4o:** ~$0.03 per file (~$1-2/month for daily uploads)

**Total:** ~$2/month (vs $30/month for Zapier)

---

## 📈 Next Steps

After setup works:
1. Monitor first week of imports
2. Adjust email filters if needed
3. Add more sender email addresses
4. Set up error notifications
5. Add backup/rollback functionality

---

## 🆘 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Check Vercel deployment logs
3. Check browser console (F12)
4. Ask me for help!

---

**Ready to start? Let's go through the steps together!** 🚀

First: Go to https://console.cloud.google.com/ and create the project.
