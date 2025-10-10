# 🚨 URGENT: Credential Rotation Guide

**STATUS:** Secrets were exposed in git history on commit `1db9164`
**FILES:** `.env.production.test` and `scripts/verify-user.js`
**ACTION TAKEN:** Files removed from git history, force-pushed to GitHub
**NEXT STEPS:** You MUST rotate ALL exposed credentials immediately

---

## ⚠️ Exposed Credentials (CRITICAL)

The following secrets were publicly exposed and MUST be rotated:

### 1. ❌ DATABASE_URL (CRITICAL - ROTATE IMMEDIATELY)
```
postgresql://neondb_owner:npg_ligVGFAqh10N@ep-snowy-leaf...
```

**Risk:** Full database access - anyone can read/write/delete all data
**Action Required:** Change database password NOW

#### How to Rotate:

**Go to Neon Dashboard:**
1. Visit https://console.neon.tech
2. Select your project
3. Go to Settings → Reset Password
4. Generate new password
5. Update `DATABASE_URL` in:
   - Vercel environment variables
   - Local `.env` file (if you have one)

**Update Vercel:**
```bash
# Add new DATABASE_URL
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste new connection string when prompted

# Redeploy
vercel --prod
```

---

### 2. ❌ AUTH_SECRET (CRITICAL - ROTATE IMMEDIATELY)
```
eMcMldxxmmjHT27Aq2pMjIppApf5kNhmH5AJi9izjuc=
```

**Risk:** Session hijacking, authentication bypass
**Action Required:** Generate new secret

#### How to Rotate:

```bash
# Generate new secret
openssl rand -base64 32

# Update in Vercel
vercel env rm AUTH_SECRET production
vercel env add AUTH_SECRET production
# Paste new value

# This will log out all users - that's expected and safe
```

---

### 3. ❌ GOOGLE_PRIVATE_KEY (CRITICAL - ROTATE IMMEDIATELY)
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASC...
```

**Risk:** Full access to Google Services (Sheets, etc.)
**Action Required:** Revoke and create new service account key

####

 How to Rotate:

**Go to Google Cloud Console:**
1. Visit https://console.cloud.google.com
2. Go to IAM & Admin → Service Accounts
3. Find `mj-cargo-dashboard-service-acc@...`
4. Click on it → Keys tab
5. **DELETE the old key** (important!)
6. Click "Add Key" → "Create new key" → JSON
7. Download the JSON file

**Extract the private key:**
```bash
# The downloaded JSON has this format:
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

**Update Vercel:**
```bash
vercel env rm GOOGLE_PRIVATE_KEY production
vercel env add GOOGLE_PRIVATE_KEY production
# Paste the FULL private_key value (with \n characters)

vercel env rm GOOGLE_CLIENT_EMAIL production
vercel env add GOOGLE_CLIENT_EMAIL production
# Paste the client_email value
```

---

### 4. ❌ OUTSETA_API_KEY & OUTSETA_API_SECRET (HIGH PRIORITY)
```
API_KEY: 5965a00b-6e5b-4c91-9ea4-2b244843a940
API_SECRET: d6dcb4e9bf71944bee1933be802d6867
```

**Risk:** Access to Outseta account, customer data
**Action Required:** Regenerate API credentials

#### How to Rotate:

**Go to Outseta Dashboard:**
1. Visit https://mj-cargo-trailers.outseta.com
2. Go to Settings → API
3. Click "Regenerate API Key"
4. Copy new API Key and Secret

**Update Vercel:**
```bash
vercel env rm OUTSETA_API_KEY production
vercel env add OUTSETA_API_KEY production

vercel env rm OUTSETA_API_SECRET production
vercel env add OUTSETA_API_SECRET production
```

---

### 5. ⚠️ FIREBASE Credentials (MEDIUM - Public OK, but rotate if concerned)
```
FIREBASE_API_KEY: AIzaSyBXsjW24xZW4uOhwmOhl2Y4LW5DdiwCKEo
PROJECT_ID: mj-cargo-dashboard-chat
```

**Risk:** LOW - These are meant to be public (NEXT_PUBLIC_)
**Note:** Firebase security relies on Firestore rules, not API key secrecy

#### If you want to rotate anyway:

1. Go to https://console.firebase.google.com
2. Select project
3. Project Settings → General
4. Web Apps → Delete old app → Add new app
5. Copy new config
6. Update all `NEXT_PUBLIC_FIREBASE_*` vars in Vercel

---

### 6. ⚠️ VERCEL_OIDC_TOKEN (LOW - Auto-rotates)
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...
```

**Risk:** LOW - This token auto-expires and regenerates
**Action:** No action needed - Vercel handles this automatically

---

### 7. ⚠️ Other Exposed Values (Review)

These were also exposed but are lower risk:
- `APPS_SCRIPT_URL` - If sensitive, regenerate in Google Apps Script
- `PLASMIC_PUBLIC_TOKEN` - Public by design, but can rotate if concerned
- `INVENTORY_CSV` - Google Sheets URL, change sharing settings if needed
- `INVITE_CODE` & `SIGNUP_CODE` - Change these to new values

---

## ✅ Quick Rotation Checklist

Use this checklist to track your progress:

- [ ] **DATABASE_URL** - Reset password in Neon
- [ ] **AUTH_SECRET** - Generate new with `openssl rand -base64 32`
- [ ] **GOOGLE_PRIVATE_KEY** - Delete old key, create new in GCP
- [ ] **GOOGLE_CLIENT_EMAIL** - Update from new service account JSON
- [ ] **OUTSETA_API_KEY** - Regenerate in Outseta dashboard
- [ ] **OUTSETA_API_SECRET** - Regenerate in Outseta dashboard
- [ ] **FIREBASE_*** (Optional) - Create new Firebase web app
- [ ] **APPS_SCRIPT_URL** (If sensitive) - Redeploy script
- [ ] **INVITE_CODE** - Change to new value
- [ ] **SIGNUP_CODE** - Change to new value
- [ ] **Redeploy to Vercel** - `vercel --prod`
- [ ] **Test the application** - Make sure everything works

---

## 🛡️ Security Best Practices (Going Forward)

### DO:
✅ Always use environment variables for secrets
✅ Keep `.env` files in `.gitignore` (already done)
✅ Use Vercel dashboard to manage production secrets
✅ Rotate credentials regularly (every 90 days recommended)
✅ Use different credentials for dev/staging/production
✅ Enable 2FA on all service accounts

### DON'T:
❌ Commit any `.env` files to git
❌ Put secrets in code comments
❌ Share credentials in Slack/Discord/email
❌ Use production credentials locally
❌ Create test scripts with hardcoded credentials

---

## 🔍 How to Verify Secrets Are Removed

**Check git history is clean:**
```bash
# Search for the exposed database password
git log -S "npg_ligVGFAqh10N" --all
# Should return NO results

# Search for files
git log --all --full-history -- .env.production.test
# Should show removal commits only
```

**Check GitHub:**
1. Go to https://github.com/kencestero/salesdash-ts
2. Use GitHub search: `npg_ligVGFAqh10N`
3. Should find ZERO results

**Check GitGuardian:**
- Wait 10-15 minutes
- Check email for "incident resolved" notification
- Or visit GitGuardian dashboard to verify alerts are closed

---

## 📞 Need Help?

If you encounter issues during rotation:

1. **Database connection fails:**
   - Double-check the new DATABASE_URL format
   - Ensure Neon database is running
   - Verify the password has no special characters that need escaping

2. **Auth not working:**
   - Clear all cookies/sessions
   - Verify AUTH_SECRET is base64 encoded
   - Check NEXTAUTH_URL matches your domain

3. **Google Sheets integration broken:**
   - Verify new GOOGLE_PRIVATE_KEY includes all `\n` characters
   - Check service account email is correct
   - Ensure service account still has access to the sheet

4. **Still seeing GitGuardian alerts:**
   - Wait 30 minutes (scanning takes time)
   - Force-refresh GitGuardian page
   - Contact GitGuardian support if alerts persist after 24 hours

---

## ⏱️ Time Estimate

- Database password: 5 minutes
- AUTH_SECRET: 2 minutes
- Google Service Account: 10 minutes
- Outseta API: 5 minutes
- Vercel updates: 5 minutes
- Testing: 10 minutes

**Total: ~40 minutes**

---

## 🎯 Priority Order

If you're short on time, rotate in this order:

1. **DATABASE_URL** (5 min) ← Do this FIRST
2. **AUTH_SECRET** (2 min)
3. **GOOGLE_PRIVATE_KEY** (10 min)
4. **OUTSETA_API_KEY/SECRET** (5 min)
5. Others (optional)

---

**⚠️ IMPORTANT:** Do not delay rotation. Even though files are removed from git, they may have been scraped by bots or cached by services.

**Status:** ✅ Git history cleaned
**Next:** 🔄 Rotate credentials (use checklist above)
**Then:** ✅ Monitor GitGuardian for resolution

---

**Questions?** This is a security incident - prioritize this over other work.
