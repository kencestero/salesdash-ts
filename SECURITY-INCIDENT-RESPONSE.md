# 🚨 SECURITY INCIDENT RESPONSE - SECRET ROTATION GUIDE

**Status:** Files removed from tracking ✅ | History cleanup REQUIRED ⚠️ | Secrets need rotation 🔴

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### Priority 1: Purge Git History (DO THIS FIRST)

The files have been removed from the current commit, but **they still exist in git history** and are publicly accessible. You MUST purge the history.

#### Option A: BFG Repo-Cleaner (RECOMMENDED - Fast & Safe)

```bash
# 1. Download BFG
# Visit: https://rtyley.github.io/bfg-repo-cleaner/
# Or with Homebrew: brew install bfg

# 2. Create a fresh clone (mirror)
cd ..
git clone --mirror https://github.com/kencestero/salesdash-ts.git salesdash-ts-mirror
cd salesdash-ts-mirror

# 3. Run BFG to delete files from history
java -jar bfg.jar --delete-files .env
java -jar bfg.jar --delete-files settings.local.json
java -jar bfg.jar --delete-folders backups

# 4. Clean up and push
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push to remote (THIS REWRITES GITHUB HISTORY)
git push --force

# 6. Return to your working directory
cd ../salesdash-ts
git fetch origin
git reset --hard origin/feat/access-control
```

#### Option B: git filter-branch (Slower but built-in)

```bash
# WARNING: This will rewrite all history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env .claude/settings.local.json' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (rewrites GitHub history)
git push --force --all origin
git push --force --tags origin
```

#### ⚠️ After History Cleanup

**All collaborators MUST re-clone the repository:**

```bash
cd ..
rm -rf salesdash-ts
git clone https://github.com/kencestero/salesdash-ts.git
```

---

## 🔴 Priority 2: Rotate ALL Secrets

### 1. DATABASE_URL (Prisma Database) - CRITICAL

**Exposed Value:**
```
postgres://0262a38506b0803203301073b4004e18cf99a5e754a0c2b2310dc267587b4626:sk_rosR7yihda0HV8l54QTvS@db.prisma.io:5432/postgres
```

**Action:**
1. Visit [Prisma Data Platform](https://cloud.prisma.io)
2. Go to your project → Settings → Connections
3. **Revoke/Delete** the old connection string
4. **Generate new** connection string with new credentials
5. Update all environments:

```bash
# Update local .env.local
echo 'DATABASE_URL="NEW_DATABASE_URL_HERE"' > .env.local

# Update Vercel (all environments)
vercel env rm DATABASE_URL production
vercel env rm DATABASE_URL preview
vercel env rm DATABASE_URL development

vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

---

### 2. AUTH_SECRET (NextAuth) - CRITICAL

**Exposed Value:**
```
b684ddbe9217a5264e267186671a8cdf9f9cead47b1a23dc7c34f5d75b933d97
```

**Action:**
```bash
# Generate new secret
NEW_AUTH_SECRET=$(openssl rand -base64 32)
echo "AUTH_SECRET=\"$NEW_AUTH_SECRET\""

# Add to .env.local
echo "AUTH_SECRET=\"$NEW_AUTH_SECRET\"" >> .env.local

# Update Vercel
vercel env rm AUTH_SECRET production preview development
vercel env add AUTH_SECRET production
vercel env add AUTH_SECRET preview
vercel env add AUTH_SECRET development
```

---

### 3. AUTH_GOOGLE_SECRET (Google OAuth) - CRITICAL

**Exposed Values:**
- `.env.local`: `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`
- `.env.production`: `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`

**Action:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `133458757266-82d6h79gv2g4ntr0n5chl13vfsmfip8f`
3. Click **Reset Secret** or **Regenerate Secret**
4. Copy the new secret

```bash
# Update local
echo 'AUTH_GOOGLE_SECRET="NEW_GOOGLE_SECRET"' >> .env.local

# Update Vercel
vercel env rm AUTH_GOOGLE_SECRET production preview development
vercel env add AUTH_GOOGLE_SECRET production
vercel env add AUTH_GOOGLE_SECRET preview
vercel env add AUTH_GOOGLE_SECRET development
```

---

### 4. GOOGLE_PRIVATE_KEY (Service Account) - CRITICAL

**Exposed:** Full RSA private key in backups and `.env.production`

**Action:**
1. Visit [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Find service account: `mj-cargo-dashboard-service-acc@mj-cargo-dashboard.iam.gserviceaccount.com`
3. Click **Keys** tab
4. **Delete** the old key
5. Create new key → JSON format
6. Extract private key from JSON

```bash
# The new key will be in the downloaded JSON file
# Copy the "private_key" field value to .env.local

# Update Vercel
vercel env rm GOOGLE_PRIVATE_KEY production preview development
vercel env add GOOGLE_PRIVATE_KEY production
# Paste the key when prompted
```

---

### 5. Prisma Accelerate API Key - CRITICAL

**Exposed Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19yb3NSN3lpaGRhMEhWOGw1NFFUdlMiLCJhcGlfa2V5IjoiMDFLNlBSNDA4MjZXSlZEQzhNUVZHUDgyS0UiLCJ0ZW5hbnRfaWQiOiIwMjYyYTM4NTA2YjA4MDMyMDMzMDEwNzNiNDAwNGUxOGNmOTlhNWU3NTRhMGMyYjIzMTBkYzI2NzU4N2I0NjI2IiwiaW50ZXJuYWxfc2VjcmV0IjoiMzdjM2UyN2ItN2JmZC00NzQ3LWE2MDgtZDAxYzg0YjMxN2VlIn0.g0N89i6S_z7Iez9_sRyZaoX03qYywkRJ3tDrBiPqZ74
```

**Action:**
1. Visit [Prisma Accelerate Dashboard](https://console.prisma.io/accelerate)
2. Revoke the old API key
3. Generate new API key
4. Update `DATABASE_PRISMA_DATABASE_URL` everywhere

---

### 6. OUTSETA_API_SECRET & OUTSETA_API_KEY - HIGH

**Exposed Values:**
- API Key: `5965a00b-6e5b-4c91-9ea4-2b244843a940`
- API Secret: `d6dcb4e9bf71944bee1933be802d6867`

**Action:**
1. Visit [Outseta Dashboard](https://mj-cargo-trailers.outseta.com)
2. Go to Settings → API Keys
3. Revoke old keys
4. Generate new keys
5. Update `.env.local` and Vercel

---

### 7. Firebase Keys - MEDIUM (Public keys but good practice)

**Action:**
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Add Firebase to your web app
3. **Rotate API key** (optional but recommended)
4. Update all `NEXT_PUBLIC_FIREBASE_*` variables

---

### 8. Other Secrets to Consider

| Secret | Risk Level | Action |
|--------|-----------|--------|
| `VERCEL_OIDC_TOKEN` | Medium | Expires automatically, monitor Vercel logs |
| `PLASMIC_PUBLIC_TOKEN` | Low | Public token, rotate if concerned |
| `INVITE_CODE` / `SIGNUP_CODE` | Medium | Change to new values |
| `LEADS_WEBHOOK_KEY` | Medium | Regenerate if webhook is active |

---

## ✅ Verification Checklist

After rotation, verify:

```bash
# 1. Test database connection
pnpm prisma db push

# 2. Test authentication locally
pnpm dev
# Try Google login

# 3. Deploy to Vercel
vercel deploy --prod

# 4. Test production deployment
# Visit your production URL and test login

# 5. Confirm old secrets are revoked
# Try connecting with old DATABASE_URL - should fail
```

---

## 🔒 Post-Incident Hardening

### 1. Enable Vercel Environment Variable Encryption

All your Vercel vars are already encrypted ✅

### 2. Set Up Secret Rotation Schedule

```
Every 90 days:
- [ ] Rotate DATABASE_URL
- [ ] Rotate AUTH_SECRET
- [ ] Rotate AUTH_GOOGLE_SECRET
- [ ] Review and rotate API keys
```

### 3. Monitor for Leaks

- [ ] Set up GitHub secret scanning alerts
- [ ] Use [GitGuardian](https://www.gitguardian.com/) or [TruffleHog](https://github.com/trufflesecurity/truffleHog)
- [ ] Review Vercel deployment logs regularly

### 4. Team Education

- [ ] Share this guide with all contributors
- [ ] Ensure everyone understands `.gitignore` and `.env` best practices
- [ ] Test pre-commit hooks are working

---

## 📞 Support Resources

- Prisma Support: https://www.prisma.io/docs/orm/more/help-and-troubleshooting
- Google Cloud Console: https://console.cloud.google.com
- Vercel Support: https://vercel.com/help
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning

---

## 📝 Incident Timeline

- **2025-10-07**: Secrets discovered in `.claude/settings.local.json` and backup files
- **2025-10-09**: Files removed from tracking, `.gitignore` updated
- **Status**: History cleanup PENDING | Secret rotation PENDING

**Next Steps:**
1. Run BFG or git filter-branch (see above)
2. Rotate all critical secrets
3. Verify all systems operational
4. Mark incident as resolved

---

🤖 Generated with Claude Code
