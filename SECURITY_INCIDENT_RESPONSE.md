# 🚨 URGENT: Credential Rotation Guide

**STATUS:** Secrets were exposed in git history on commit `1db9164`
**FILES:** `.env.production.test` and `scripts/verify-user.js`
**ACTION TAKEN:** Files removed from git history, force-pushed to GitHub
**NEXT STEPS:** You MUST rotate ALL exposed credentials immediately

---

## ⚠️ Exposed Credentials (CRITICAL)

The following secrets were publicly exposed and MUST be rotated:

### 1. ❌ DATABASE_URL (CRITICAL - ROTATE IMMEDIATELY)

**What was exposed:** PostgreSQL connection string with password
**Risk:** Full database access - anyone can read/write/delete all data
**Action Required:** Change database password NOW

#### How to Rotate:

**Go to Neon Dashboard:**
1. Visit https://console.neon.tech
2. Select your project: `salesdash-ts` or similar
3. Go to Settings → Database → Reset Password
4. Generate new password
5. Copy the new DATABASE_URL connection string

**Update Vercel:**
```bash
# Remove old value
vercel env rm DATABASE_URL production

# Add new value
vercel env add DATABASE_URL production
# Paste new connection string when prompted

# Redeploy
vercel --prod
```

---

### 2. ❌ AUTH_SECRET (CRITICAL - ROTATE IMMEDIATELY)

**What was exposed:** NextAuth session encryption key
**Risk:** Session hijacking, authentication bypass
**Action Required:** Generate new secret

#### How to Rotate:

```bash
# Generate new secret (32 characters, base64 encoded)
openssl rand -base64 32

# Update in Vercel
vercel env rm AUTH_SECRET production
vercel env add AUTH_SECRET production
# Paste the output from openssl command above

# Note: This will log out all users - that's expected and safe
```

---

### 3. ❌ GOOGLE_PRIVATE_KEY (CRITICAL - ROTATE IMMEDIATELY)

**What was exposed:** Google Cloud service account private key
**Risk:** Full access to Google Services (Sheets, Drive, etc.)
**Action Required:** Revoke old key and create new service account key

#### How to Rotate:

**Go to Google Cloud Console:**
1. Visit https://console.cloud.google.com
2. Go to IAM & Admin → Service Accounts
3. Find your service account (likely `mj-cargo-dashboard-service-acc@...`)
4. Click on it → Keys tab
5. **DELETE the old key** (very important!)
6. Click "Add Key" → "Create new key" → JSON
7. Download the JSON file

**Extract the private key from the JSON:**
The downloaded file contains:
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com"
}
```

**Update Vercel:**
```bash
vercel env rm GOOGLE_PRIVATE_KEY production
vercel env add GOOGLE_PRIVATE_KEY production
# Paste the FULL private_key value (include \n characters)

vercel env rm GOOGLE_CLIENT_EMAIL production
vercel env add GOOGLE_CLIENT_EMAIL production
# Paste the client_email value
```

---

### 4. ❌ OUTSETA_API_KEY & OUTSETA_API_SECRET (HIGH PRIORITY)

**What was exposed:** Outseta API credentials
**Risk:** Access to Outseta account, customer data, billing
**Action Required:** Regenerate API credentials

#### How to Rotate:

**Go to Outseta Dashboard:**
1. Visit your Outseta account (check OUTSETA_BASE_URL for the domain)
2. Go to Settings → API or Integrations
3. Click "Regenerate API Key" or similar
4. Copy new API Key and Secret

**Update Vercel:**
```bash
vercel env rm OUTSETA_API_KEY production
vercel env add OUTSETA_API_KEY production
# Paste new API key

vercel env rm OUTSETA_API_SECRET production
vercel env add OUTSETA_API_SECRET production
# Paste new API secret
```

---

### 5. ⚠️ FIREBASE Credentials (MEDIUM - Public is OK, but can rotate)

**What was exposed:** Firebase API keys and project IDs
**Risk:** LOW - These are designed to be public (`NEXT_PUBLIC_*`)
**Note:** Firebase security relies on Firestore rules, not API key secrecy

#### If you want to rotate anyway:

1. Go to https://console.firebase.google.com
2. Select your project
3. Project Settings → General
4. Under "Your apps" → Web apps → Delete old app
5. Click "Add app" → Web
6. Register new app and copy new config
7. Update all `NEXT_PUBLIC_FIREBASE_*` vars in Vercel

**Variables to update:**
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

---

### 6. ⚠️ VERCEL_OIDC_TOKEN (LOW - Auto-rotates)

**What was exposed:** Vercel deployment token
**Risk:** LOW - This token auto-expires and regenerates
**Action:** No action needed - Vercel handles this automatically

---

### 7. ⚠️ Other Exposed Values (Review and Update)

These were also exposed but are lower risk:
- **APPS_SCRIPT_URL** - If sensitive, redeploy script with new URL
- **PLASMIC_PUBLIC_TOKEN** - Public by design, can rotate in Plasmic dashboard
- **INVENTORY_CSV** - Google Sheets URL, change sharing settings if needed
- **INVITE_CODE** - Change to a new random code
- **SIGNUP_CODE** - Change to a new value

---

## ✅ Quick Rotation Checklist

Use this to track your progress:

- [ ] **DATABASE_URL** - Reset password in Neon Dashboard
- [ ] **AUTH_SECRET** - Generate new with `openssl rand -base64 32`
- [ ] **GOOGLE_PRIVATE_KEY** - Delete old key, create new in Google Cloud
- [ ] **GOOGLE_CLIENT_EMAIL** - Update from new service account JSON
- [ ] **OUTSETA_API_KEY** - Regenerate in Outseta dashboard
- [ ] **OUTSETA_API_SECRET** - Regenerate in Outseta dashboard
- [ ] **FIREBASE_*** (Optional) - Create new Firebase web app
- [ ] **APPS_SCRIPT_URL** (If sensitive) - Redeploy Google Apps Script
- [ ] **INVITE_CODE** - Change to new random value
- [ ] **SIGNUP_CODE** - Change to new random value
- [ ] **Update all values in Vercel** - Use `vercel env` commands
- [ ] **Redeploy to Vercel** - Run `vercel --prod`
- [ ] **Test the application** - Make sure auth and DB work

---

## 🛡️ Security Best Practices (Going Forward)

### DO:
✅ Always use environment variables for secrets
✅ Keep `.env*` files in `.gitignore` (already configured)
✅ Use Vercel dashboard to manage production secrets
✅ Rotate credentials regularly (every 90 days)
✅ Use different credentials for dev/staging/production
✅ Enable 2FA on all service accounts

### DON'T:
❌ Commit any `.env` files to git
❌ Put secrets in documentation files
❌ Share credentials in Slack/Discord/email
❌ Use production credentials locally
❌ Create test/debug scripts with hardcoded credentials

---

## 🔍 How to Verify Git History is Clean

```bash
# Search for database username (should return nothing)
git log -S "neondb_owner" --all

# Search for removed files (should only show deletion commits)
git log --all --full-history -- .env.production.test

# Check GitHub repository
# Visit: https://github.com/kencestero/salesdash-ts
# Search for "postgresql://" - should find ZERO results
```

---

## 📞 Troubleshooting

### Database connection fails after rotation:
- Double-check the new DATABASE_URL format is correct
- Ensure Neon database is active (not paused)
- Verify no typos in the connection string
- Check that the password has no special characters needing escaping

### Auth not working after rotation:
- Clear browser cookies/sessions
- Verify AUTH_SECRET is exactly what openssl generated
- Check NEXTAUTH_URL matches your Vercel domain
- Try logging out and back in

### Google Sheets integration broken:
- Verify GOOGLE_PRIVATE_KEY includes `\n` newline characters
- Check GOOGLE_CLIENT_EMAIL matches the new service account
- Ensure service account still has "Editor" access to the spreadsheet
- Wait 5-10 minutes for Google to propagate new keys

### GitGuardian alerts still showing:
- Wait 30-60 minutes (scanning/indexing takes time)
- Force-refresh the GitGuardian dashboard
- Verify git history is actually clean (see commands above)
- Contact GitGuardian support if alerts persist after 24 hours

---

## ⏱️ Time Estimate

- Database password: 5 minutes
- AUTH_SECRET: 2 minutes
- Google Service Account: 10 minutes
- Outseta API: 5 minutes
- Update Vercel environment variables: 5 minutes
- Redeploy and test: 10 minutes

**Total: ~40 minutes**

---

## 🎯 Priority Order

If you're short on time, rotate in this order:

1. **DATABASE_URL** (5 min) ← MOST CRITICAL
2. **AUTH_SECRET** (2 min)
3. **GOOGLE_PRIVATE_KEY** (10 min)
4. **OUTSETA_API_KEY/SECRET** (5 min)
5. Everything else (optional, lower risk)

---

## 📋 What Was Done to Remediate

✅ Removed `.env.production.test` from git history
✅ Removed `scripts/verify-user.js` from git history
✅ Force-pushed cleaned history to GitHub
✅ Updated `.gitignore` to prevent future accidents
✅ Created this rotation guide

**Next:** You must rotate the exposed credentials (see checklist above)

---

**⚠️ IMPORTANT:** Do not delay rotation. Secrets were public for several hours and may have been cached by web scrapers or security scanners.

---

**Questions?** This is a security incident - prioritize credential rotation over other work. The application will continue working until you rotate, but the old credentials are compromised.
