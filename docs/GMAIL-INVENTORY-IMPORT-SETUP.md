# Gmail Inventory Import - Setup & Maintenance Guide

## Overview

Automated cron job that checks Gmail for inventory emails from manufacturers, downloads PDF/Excel attachments, and imports them into the inventory system using AI parsing.

## Cron Schedule

| Schedule | UTC Time | EST Time | Description |
|----------|----------|----------|-------------|
| `0 16 * * *` | 4:00 PM | 11:00 AM | First daily run |
| `0 21 * * *` | 9:00 PM | 4:00 PM | Second daily run |

**Configuration File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/import-email-inventory",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/import-email-inventory",
      "schedule": "0 21 * * *"
    }
  ]
}
```

## Endpoint

**API Route:** `/api/cron/import-email-inventory`
**File:** `app/api/cron/import-email-inventory/route.ts`

## Gmail Account

**Email:** kencestero@gmail.com (receives manufacturer inventory emails)

## Approved Email Senders

Configured in `INVENTORY_EMAIL_SENDERS` environment variable (comma-separated):
- `lee@diamondcargomfg.com` - Diamond Cargo
- `open-stock-notifications@googlegroups.com` - Open stock notifications
- `iliana@panthercargollc.com` - Panther Cargo

Leave empty to import from ALL emails with attachments.

## Environment Variables

### Required for Production (Vercel)

| Variable | Description |
|----------|-------------|
| `GMAIL_CLIENT_ID` | Google OAuth Client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth Client Secret |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token for Gmail API access |
| `CRON_SECRET` | Secret for authenticating cron requests |
| `INVENTORY_EMAIL_SENDERS` | Comma-separated list of approved sender emails |
| `OPENAI_API_KEY` | For AI-powered inventory parsing |

---

## How to Update Credentials

### 1. Google Cloud Console

**Link:** https://console.cloud.google.com/apis/credentials

**Project:** Remotive Logistics Dashboard
**OAuth Client:** SalesDash Gmail Import

#### To Create New Client Secret:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on "SalesDash Gmail Import" under OAuth 2.0 Client IDs
3. Under "Client secrets", click "+ ADD SECRET"
4. Copy the new secret immediately (won't be shown again)
5. Update in `.env.local` and Vercel

### 2. Generate New Refresh Token

**Link:** https://developers.google.com/oauthplayground

#### Steps:
1. Click gear icon (⚙️) in top right
2. Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. Close settings

5. In left panel "Step 1", find and select:
   - `https://www.googleapis.com/auth/gmail.readonly`

6. Click "Authorize APIs"
7. Sign in with **kencestero@gmail.com** (the account receiving manufacturer emails)
8. Allow access

9. In "Step 2", click "Exchange authorization code for tokens"
10. Copy the `refresh_token` value

11. Update in `.env.local` and Vercel

### 3. Update Vercel Environment Variables

**Link:** https://vercel.com/kencestero-7874s-projects/remotive-logistics/settings/environment-variables

#### Via CLI:
```bash
# List current env vars
npx vercel env ls

# Add/update a variable
echo "your-value-here" | npx vercel env add VARIABLE_NAME production

# Remove a variable (if needed)
npx vercel env rm VARIABLE_NAME production
```

#### Via Dashboard:
1. Go to Vercel Dashboard → remotive-logistics → Settings → Environment Variables
2. Find the variable to update
3. Click edit (pencil icon)
4. Paste new value
5. Save

### 4. Redeploy After Changes

```bash
npx vercel --prod
```

---

## Troubleshooting

### Cron Not Running
1. Check Vercel Dashboard → Logs for cron execution
2. Verify `CRON_SECRET` matches in Vercel env vars
3. Check Vercel plan supports cron frequency (Hobby = daily only)

### Gmail Auth Errors

#### "invalid_grant" Error
- Refresh token expired or revoked
- Solution: Generate new refresh token via OAuth Playground

#### "invalid_client" Error
- Client secret is wrong or changed
- Solution: Create new client secret in Google Cloud Console

#### "redirect_uri_mismatch" Error
- OAuth Playground not in authorized redirect URIs
- Solution: Add `https://developers.google.com/oauthplayground` to Authorized redirect URIs in Google Cloud Console

### No Emails Found
1. Check `INVENTORY_EMAIL_SENDERS` has correct email addresses
2. Verify emails arrived in last 24 hours
3. Check emails have PDF/Excel/CSV attachments

---

## File Locations

| File | Purpose |
|------|---------|
| `app/api/cron/import-email-inventory/route.ts` | Cron job endpoint |
| `app/api/inventory/upload/route.ts` | Inventory upload handler |
| `vercel.json` | Cron schedule configuration |
| `.env.local` | Local environment variables |
| `docs/GMAIL-INVENTORY-IMPORT-SETUP.md` | This documentation |

---

## Quick Reference Links

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **OAuth Playground:** https://developers.google.com/oauthplayground
- **Vercel Dashboard:** https://vercel.com/kencestero-7874s-projects/remotive-logistics
- **Vercel Env Vars:** https://vercel.com/kencestero-7874s-projects/remotive-logistics/settings/environment-variables
- **Vercel Cron Docs:** https://vercel.com/docs/cron-jobs

---

*Last Updated: January 2025*
