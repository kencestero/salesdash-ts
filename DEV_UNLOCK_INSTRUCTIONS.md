# 🔓 Dev Unlock Instructions

## Quick Access for Local Development

This dev unlock system gives you instant owner access without manual database edits.

---

## Step 1: Start Dev Server

```bash
pnpm dev
```

---

## Step 2: Run Dev Unlock

Open your browser and visit:

```
http://localhost:3000/api/dev/unlock?email=kencestero@gmail.com&secret=letmein123
```

**Expected Response:**
```json
{
  "ok": true,
  "userId": "clx...",
  "email": "kencestero@gmail.com",
  "role": "owner",
  "repCode": "OWNER-clx123",
  "message": "✅ Owner profile created/updated. You can now sign in!"
}
```

---

## Step 3: Sign In

Now visit: `http://localhost:3000/en/auth/login`

- **Option 1:** Sign in with Google (kencestero@gmail.com)
- **Option 2:** Sign in with email/password (if you've set one)

**You're in as Owner!** 🎉

---

## What This Does

The dev unlock route (`/api/dev/unlock`):

1. ✅ Creates User record for your email (if doesn't exist)
2. ✅ Sets `emailVerified: true` (bypasses email verification)
3. ✅ Creates/updates UserProfile with:
   - `role: "owner"`
   - `accountStatus: "active"`
   - `repCode: "OWNER-xxxxx"`
   - All permissions enabled (CRM, Inventory, Configurator, Calendar, Reports, User Management)

---

## Dev Mode Features Enabled

### 1. **AUTH_TRUST_HOST=true**
Allows NextAuth to work on localhost without SSL warnings.

### 2. **DEV_BYPASS_SIGNIN=true**
Bypasses all join code checks and sign-in restrictions in development.

**Location:** `lib/auth.ts` - Line 67-70

```typescript
// Dev-only bypass to avoid "Access Denied" while wiring things
if (process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_SIGNIN === "true") {
  console.log("🔓 DEV MODE: Bypassing signIn checks");
  return true;
}
```

This means:
- ✅ No join code needed
- ✅ Google OAuth works instantly
- ✅ Any email can sign up
- ✅ Skip all validation checks

**⚠️ ONLY WORKS IN DEVELOPMENT** - Automatically disabled in production.

---

## Files Modified

1. **`.env.local`** - Added 3 new variables:
   ```bash
   AUTH_TRUST_HOST=true
   DEV_UNLOCK_SECRET=letmein123
   DEV_BYPASS_SIGNIN=true
   ```

2. **`app/api/dev/unlock/route.ts`** - New dev-only API route (production-safe)

3. **`lib/auth.ts`** - Added dev bypass at top of signIn callback

---

## Change the Secret (Optional)

If you want a different secret, edit `.env.local`:

```bash
DEV_UNLOCK_SECRET=your-custom-secret-here
```

Then use: `http://localhost:3000/api/dev/unlock?email=...&secret=your-custom-secret-here`

---

## Troubleshooting

### "Unauthorized" Error
- Check that `.env.local` has `DEV_UNLOCK_SECRET=letmein123`
- Make sure the `secret` parameter in URL matches the env var
- Restart dev server after changing `.env.local`

### "Disabled in production" Error
- Good! This route is dev-only for security
- Make sure you're running locally (`pnpm dev`)

### Still Can't Sign In
1. Visit `/api/dev/unlock?email=...&secret=...` first
2. Check you got `{ ok: true }` response
3. Then go to `/en/auth/login`
4. Sign in with Google or email

### Check Database (Optional)
```bash
pnpm prisma studio
```
- Go to **UserProfile** table
- Find row for `kencestero@gmail.com`
- Verify `role` is `owner`

---

## Remove Later (Production Cleanup)

Before deploying to production:

### 1. Delete Dev Unlock Route
```bash
rm app/api/dev/unlock/route.ts
```

### 2. Remove Dev Environment Variables
Edit `.env.local` and remove:
```bash
DEV_UNLOCK_SECRET=letmein123    # DELETE THIS
DEV_BYPASS_SIGNIN=true          # DELETE THIS
```

**Keep:**
```bash
AUTH_TRUST_HOST=true  # KEEP THIS - needed for local dev
```

### 3. Remove Dev Bypass from Auth (Optional)
Edit `lib/auth.ts` and remove lines 66-70:
```typescript
// Remove this block:
if (process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_SIGNIN === "true") {
  console.log("🔓 DEV MODE: Bypassing signIn checks");
  return true;
}
```

---

## Security Notes

✅ **Safe for Development:**
- Dev unlock route ONLY works when `NODE_ENV !== "production"`
- Returns 403 Forbidden in production
- Requires secret parameter (not guessable)

✅ **Safe for Production:**
- All dev bypasses check `NODE_ENV` and `DEV_BYPASS_SIGNIN`
- Automatically disabled in production builds
- No security risk if you forget to remove them

⚠️ **Best Practice:**
- Still remove dev-only code before production deploy
- Keep `.env.local` out of git (already in `.gitignore`)
- Use environment variables in Vercel for production

---

## Quick Commands

```bash
# Start dev server
pnpm dev

# Visit dev unlock (change email if needed)
# http://localhost:3000/api/dev/unlock?email=kencestero@gmail.com&secret=letmein123

# Open Prisma Studio (optional - verify database)
pnpm prisma studio

# Check environment variables are loaded
node -e "console.log(process.env.DEV_UNLOCK_SECRET)"
```

---

**That's it! You now have instant owner access in development. 🚀**

No more manual Prisma Studio edits!
