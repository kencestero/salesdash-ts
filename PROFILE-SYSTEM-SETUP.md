# Profile System Setup Guide

## ✅ Completed

### 1. Database Schema
- Added `avatarUrl` and `coverUrl` fields to UserProfile model
- Synced to database with `npx prisma db push`

### 2. UploadThing Integration
- Installed packages: `uploadthing`, `@uploadthing/react`
- Created `/lib/uploadthing.ts` - React helpers
- Created `/app/api/uploadthing/core.ts` - File router with:
  - `avatarUploader`: 1:1 aspect, 4MB max
  - `coverUploader`: 16:9 aspect, 8MB max
- Created `/app/api/uploadthing/route.ts` - API endpoint

### 3. Server Actions
- Created `/app/(profile)/actions.ts` with:
  - `updateProfile()` - Save profile data
  - `getProfile()` - Fetch user profile

### 4. Profile Page
- Created `/app/[lang]/profile/page.tsx`
- Features:
  - Facebook-style cover image upload (16:9)
  - Avatar upload (1:1, circular)
  - Form fields: firstName, lastName, preferredName, phone, zipcode, city, about
  - Live preview of uploaded images
  - Authentication guard (redirects to login if not authenticated)
  - DashTail theme with rounded-2xl cards
  - Toast notifications for success/error

### 5. Navigation
- Profile link already exists in header dropdown at `/profile` ✅

### 6. Cleanup
- Removed duplicate profile page at `(dashboard)/profile`
- Removed abandoned photo request pages
- Cleaned up MCP config errors (removed fireshare)

---

## 🔧 Required Setup (User Action Needed)

### Step 1: Get UploadThing API Keys

1. Go to https://uploadthing.com
2. Sign up or log in
3. Create a new app
4. Copy your API keys

### Step 2: Add to .env.local

Add these lines to your `.env.local` file:

```bash
# UploadThing (for profile avatar/cover uploads)
UPLOADTHING_SECRET=your_secret_here
UPLOADTHING_APP_ID=your_app_id_here
```

### Step 3: Restart Dev Server

```bash
pnpm dev
```

### Step 4: Test Profile Page

1. Navigate to http://localhost:3000/profile
2. Upload avatar image (should show in circular frame)
3. Upload cover image (should show as banner)
4. Fill in form fields
5. Click "Save Profile"
6. Verify toast notification appears
7. Refresh page - data should persist

---

## 📝 Google Sheets CRM Integration (Separate Task)

### Files Created:
- `/lib/crm-integration.ts` - Client function to submit leads

### Apps Script Code Provided:
Complete webhook code with:
- `doPost()` - Receives leads and appends to BOTH sheets
- `backfillNames()` - Splits "Customer Name" into First/Last
- `testWebhook()` - Test function
- `ensureHeader()` - Validates headers

### Sheet IDs:
- Original: `1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA`
- Duplicate: `1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8`
- Tab: `Leads`

### Next Steps:
1. Open Google Sheets
2. Extensions → Apps Script
3. Paste the Apps Script code (provided separately)
4. Run `backfillNames()` to split customer names
5. Run `testWebhook()` to verify functionality
6. Deploy as Web App (Execute as: Me, Access: Anyone)
7. Copy Web App URL
8. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CRM_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

---

## 🎯 Current Status

**Profile System:** ✅ Code complete - Waiting for UploadThing keys
**CRM Integration:** ✅ Code complete - Waiting for Apps Script deployment

**Ready to test once you:**
1. Add UploadThing keys to `.env.local`
2. Deploy Google Sheets Apps Script
3. Add webhook URL to `.env.local`

---

## 📂 File Structure

```
app/
├── [lang]/
│   └── profile/
│       └── page.tsx                    # Profile page UI
├── (profile)/
│   └── actions.ts                      # Server actions
└── api/
    └── uploadthing/
        ├── core.ts                      # File router config
        └── route.ts                     # API endpoint

lib/
├── uploadthing.ts                       # React helpers
└── crm-integration.ts                   # CRM client function

prisma/
└── schema.prisma                        # UserProfile with avatarUrl/coverUrl
```

---

## 🐛 Known Issues

None - all cleanup completed!

**Previous issues resolved:**
- ✅ Duplicate profile pages removed
- ✅ MCP fireshare connection errors fixed
- ✅ Abandoned photo request pages cleaned up
- ✅ Route conflicts resolved

---

**Last Updated:** 2025-01-29
**Status:** Ready for testing once API keys are added
