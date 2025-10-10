# 🔑 SECRET ROTATION CHECKLIST

✅ **Git History Cleaned** - Secret files removed from GitHub!
✅ **AUTH_SECRET Rotated** - New value generated and saved to `.env.local`

---

## 📝 What You Need to Do Next

### ⚠️ CRITICAL - Do These 3 Steps Now:

---

## 🗄️ STEP 1: Rotate DATABASE_URL (Prisma)

**Time needed:** 5 minutes

1. **Go to Prisma Cloud:**
   - Open: https://cloud.prisma.io
   - Login with your account

2. **Find your project:**
   - Look for "salesdash" or your project name
   - Click on it

3. **Reset the connection string:**
   - Go to **Settings** → **Connection Strings**
   - Click **"Reset Connection String"** or **"Generate New"**
   - Copy the new URL (starts with `postgres://` or `prisma+postgres://`)

4. **Update your .env.local file:**
   - Open: `.env.local` (in your project folder)
   - Find line 23: `DATABASE_URL="PASTE_NEW_DATABASE_URL_HERE"`
   - Replace `PASTE_NEW_DATABASE_URL_HERE` with the URL you just copied
   - Save the file

5. **Test it works:**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```
   If you see "✓ Database connected" - you're good!

---

## 🔐 STEP 2: Rotate Google OAuth Secret

**Time needed:** 3 minutes

1. **Go to Google Cloud Console:**
   - Open: https://console.cloud.google.com/apis/credentials
   - Select your project: "mj-cargo-dashboard" (or similar)

2. **Find your OAuth Client:**
   - Look for: `133458757266-82d6h79gv2g4ntr0n5chl13vfsmfip8f`
   - Click on it

3. **Reset the secret:**
   - Look for a button like **"Reset Secret"** or **"Regenerate Secret"**
   - Click it
   - Copy the new secret (starts with `GOCSPX-`)

4. **Update your .env.local file:**
   - Open: `.env.local`
   - Find line 37: `AUTH_GOOGLE_SECRET="PASTE_NEW_GOOGLE_SECRET_HERE"`
   - Replace `PASTE_NEW_GOOGLE_SECRET_HERE` with the secret you just copied
   - Save the file

---

## 🔑 STEP 3: Rotate Google Service Account Key

**Time needed:** 5 minutes

1. **Go to Google Cloud IAM:**
   - Open: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Select your project

2. **Find your service account:**
   - Look for: `mj-cargo-dashboard-service-acc@mj-cargo-dashboard.iam.gserviceaccount.com`
   - Click on it

3. **Delete the old key:**
   - Go to **"Keys"** tab
   - Find any existing keys
   - Click the **3 dots** → **Delete**

4. **Create a new key:**
   - Click **"Add Key"** → **"Create new key"**
   - Choose **JSON** format
   - Click **"Create"**
   - A file will download (something like `mj-cargo-dashboard-xxx.json`)

5. **Extract the private key:**
   - Open the downloaded JSON file in Notepad
   - Find the line that says `"private_key": "-----BEGIN PRIVATE KEY-----...`
   - Copy EVERYTHING between the quotes (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - Make sure to keep the `\n` characters - they're important!

6. **Update your .env.local file:**
   - Open: `.env.local`
   - Find line 49: `GOOGLE_PRIVATE_KEY="PASTE_NEW_PRIVATE_KEY_HERE"`
   - Replace `PASTE_NEW_PRIVATE_KEY_HERE` with the private key you just copied
   - Save the file

---

## ✅ After You Complete Steps 1-3:

**Test locally:**
```bash
pnpm dev
```
Go to http://localhost:3000 and try to login with Google.

If it works, you're ready for the next step! **Tell me when you're done** and I'll help you update Vercel.

---

## 🚀 STEP 4: Update Vercel (I'll Help You With This)

Once the above 3 steps are done, let me know and I'll guide you through updating Vercel's environment variables.

---

## 📌 Quick Reference

| Secret | Status | Where to Find |
|--------|--------|---------------|
| ✅ AUTH_SECRET | DONE | Already updated |
| ⚠️ DATABASE_URL | TODO | https://cloud.prisma.io |
| ⚠️ AUTH_GOOGLE_SECRET | TODO | https://console.cloud.google.com/apis/credentials |
| ⚠️ GOOGLE_PRIVATE_KEY | TODO | https://console.cloud.google.com/iam-admin/serviceaccounts |

---

## ❓ Need Help?

- **Can't find Prisma Cloud?** Email their support or check your email for the invite link
- **Don't have Google Cloud access?** Ask the project owner to give you access
- **Something not working?** Tell me what error you see and I'll help!

---

**Current file:** [.env.local](.env.local) has placeholders for you to fill in.

🤖 Your progress will be saved automatically when you edit `.env.local`
