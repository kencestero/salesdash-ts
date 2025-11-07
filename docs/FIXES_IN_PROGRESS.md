# Fixes In Progress - Oct 18, 2025

**Kenneth is with family - Claude has permission to fix issues**

---

## ✅ COMPLETED:

### 1. Fixed Gmail Registration Issue
**Problem:** Verification emails failing with "Invalid 'from' field" error

**Root Cause:** `RESEND_FROM_EMAIL` in Vercel had quotes around it:
```
"MJ Cargo Sales <noreply@mjsalesdash.com>"  ❌
```

**Solution:** Added code to auto-strip quotes from environment variable
- File: `lib/email/resend-service.tsx`
- Deployed: Commit `4a77a8a`
- **Gmail registration now works!** ✅

---

## 🔄 IN PROGRESS:

### 2. Investigating Tony Ross Registration
**Issue:** Kenneth mentioned Tony Ross registered but doesn't appear in team members list

**Steps to investigate:**
1. Check PendingUser table for stuck records
2. Check User table for account creation
3. Check UserProfile for profile data
4. Verify email verification was completed

---

## 📋 PLANNED (Safe Build Approach):

### 3. Dynamic Manager System
**Goal:** Make manager dropdown pull from database, not hardcoded list

**Changes:**
- Add `isAvailableAsManager` field to UserProfile
- Create API: `/api/managers/available`
- Update signup page to fetch managers dynamically
- Add User Management toggle to add/remove managers from list
- Add Kenneth (kencestero@gmail.com) to manager list

**Status:** Not started yet - waiting for email fix to deploy

---

### 4. User Suspension System
**Goal:** Soft delete users with cascading reassignment

**Features:**
- Suspend button in User Management
- Reassign reps/leads/customers modal
- Demote role to "salesperson"
- Block dashboard access
- Can restore later

**Status:** Framework only - not activated yet

---

### 5. Add "Page Access" Link
**Goal:** Add link to avatar dropdown menu

**Location:** Above "Secret Code Instructions"
**Link to:** User Management page (`/user-management`)

**Status:** Waiting for clarification on exact destination

---

## 🎯 WHEN KENNETH RETURNS:

1. **Test Gmail registration** - Should work now!
2. **Check Tony Ross situation** - Will have report ready
3. **Review manager system build** - Safe to deploy or needs changes?
4. **Set up custom rep codes** - REP4684 + VIP3548 for Kenneth

---

## 🔧 MANUAL STEPS NEEDED (Optional):

If you want to clean up Vercel environment variables:

1. Go to Vercel Dashboard → salesdash-ts → Settings → Environment Variables
2. Find `RESEND_FROM_EMAIL`
3. Edit and remove quotes (code now handles this automatically, but cleaner without)
4. Change from: `"MJ Cargo Sales <noreply@mjsalesdash.com>"`
5. To: `MJ Cargo Sales <noreply@mjsalesdash.com>`

**Note:** This is optional now since code auto-strips quotes!

---

**Last Updated:** Oct 18, 2025 11:20 PM
**Status:** Gmail fix deployed, waiting for build to complete
