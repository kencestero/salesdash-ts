# SalesDash Setup & Configuration Guide

## Quick Answers to Your Questions

### 1. **Why are profiles still in Mock-up mode?**

**Answer:** The user profile pages are hardcoded with mock data in the template components. The real user data from your database (via NextAuth/Prisma) is NOT being pulled into the profile display components.

**Affected Files:**
- `components/partials/header/profile-info.tsx` - Line 56: hardcoded `@uxuidesigner`
- `app/[lang]/(dashboard)/user-profile/components/header.tsx` - Lines 33-51: hardcoded "Jennyfer Franking", "24.5K Followers", etc.
- `app/[lang]/(dashboard)/user-profile/overview/user-info.tsx` - Lines 13-39: hardcoded user information
- `components/partials/header/notification-data.ts` - Lines 10-121: ALL fake notification data

**Status:** ❌ NOT connected to real database

---

### 2. **Can you clear mock data so new users don't see fake profiles?**

**Answer:** YES! I'll create updated components that pull from your Prisma database instead of showing mock data.

**What needs to be done:**
- ✅ I can update profile components to use real session data
- ✅ I can clear fake notifications
- ✅ I can connect user info to Prisma `UserProfile` model
- ✅ I can make activity feeds dynamic

---

### 3. **Is Chat working properly or does it need Vercel?**

**Answer:** Chat is configured and WILL work both locally and on Vercel.

**Current Setup:**
- ✅ Firebase Firestore configured (`lib/firebase.ts`)
- ✅ Chat API routes created (`app/api/chat/**`)
- ✅ Firebase credentials in environment variables
- ✅ Works on both localhost:3000 AND Vercel

**How it works:**
- Messages are stored in Firebase Firestore (real-time database)
- User list comes from Prisma PostgreSQL database
- Works anywhere your environment variables are set

**Status:** ✅ SHOULD be functional (Firebase credentials are set)

---

### 4. **Can you clear mock notifications and other mock-ups?**

**Answer:** YES! The following need to be cleaned:

**Mock Data Files to Clear/Update:**
1. ✅ `components/partials/header/notification-data.ts` - Fake notifications
2. ✅ `app/[lang]/(dashboard)/user-profile/components/header.tsx` - Fake profile header
3. ✅ `app/[lang]/(dashboard)/user-profile/overview/*` - All fake user info
4. ✅ `components/partials/header/profile-info.tsx` - Hardcoded username

---

### 5. **How do we give people roles when they join?**

**Answer:** You have THREE options:

**Option A: Automatic Role Assignment (Recommended)**
```typescript
// In lib/auth.ts callbacks
async signIn({ user }) {
  // Check if user is in OWNERS or MANAGERS env vars
  const owners = process.env.OWNERS?.split(',') || [];
  const managers = process.env.MANAGERS?.split(',') || [];

  if (owners.includes(user.email)) {
    // Create UserProfile with role: "owner"
  } else if (managers.includes(user.email)) {
    // Create UserProfile with role: "manager"
  } else {
    // Create UserProfile with role: "salesperson"
  }
}
```

**Option B: Manual Admin Dashboard**
- Create an admin page at `/admin/users`
- Owners can change roles manually
- Add dropdown: Salesperson → Manager → Owner

**Option C: Self-Selection on First Login**
- Show role selection screen on first login
- You approve/reject from admin panel

**Current Database Schema** (already exists):
```prisma
model UserProfile {
  role String @default("salesperson") // "owner", "manager", "salesperson"
  member Boolean @default(false)
}
```

**Status:** ⚠️ Database is ready, but AUTO-ASSIGNMENT not implemented yet

---

### 6. **Is there a manual/instructions book?**

**Answer:** NO comprehensive manual exists yet, BUT:

**What you have:**
- ✅ This document (SALESDASH-SETUP-GUIDE.md)
- ✅ README.md (basic Next.js setup)
- ✅ Prisma schema documentation
- ✅ NextAuth.js docs (https://next-auth.js.org)

**What I can create for you:**
- ✅ User onboarding guide
- ✅ Admin dashboard manual
- ✅ Role management guide
- ✅ Chat setup guide
- ✅ CRM integration guide

---

### 7. **How to create a CRM using SalesDash + Google Sheets instead of Outseta?**

**Answer:** YES! You already have the infrastructure:

**Current Setup:**
- ✅ `APPS_SCRIPT_URL` in your .env (Google Apps Script endpoint)
- ✅ `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` (Service Account)
- ✅ `INVENTORY_CSV` pointing to Google Sheet

**How to Build CRM with Google Sheets:**

**Step 1: Create Google Sheet Structure**
```
Sheet 1: "Leads"
- Columns: Name, Email, Phone, Source, Status, Assigned To, Created Date

Sheet 2: "Customers"
- Columns: Name, Email, Phone, Purchase History, LTV, Last Contact

Sheet 3: "Activities"
- Columns: Lead ID, Activity Type, Notes, Date, Salesperson
```

**Step 2: Create API Routes** (I can help you build these)
```typescript
// app/api/crm/leads/route.ts
// - GET: Fetch all leads from Google Sheet
// - POST: Add new lead to Google Sheet

// app/api/crm/leads/[id]/route.ts
// - PUT: Update lead status
// - DELETE: Archive lead

// app/api/crm/activities/route.ts
// - POST: Log activity (call, email, meeting)
```

**Step 3: Use Google Apps Script**
```javascript
// In your Google Apps Script (already deployed at APPS_SCRIPT_URL)
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID');
  const data = JSON.parse(e.postData.contents);

  // Add lead to sheet
  // Return confirmation
}
```

**Benefits vs Outseta:**
- ✅ FREE (no monthly fees)
- ✅ Real-time sync with Google Sheets
- ✅ Easy for non-technical team members
- ✅ Export/import capabilities
- ❌ No built-in payment processing
- ❌ Manual webhook setup needed

**Status:** ⚠️ Infrastructure exists, needs implementation

---

### 8. **How to change @KennethCest usernames? Best Practices**

**Answer:** The username `@uxuidesigner` is HARDCODED. Here's how to fix it:

**Option A: Add username field to database** (Recommended)
```prisma
// Add to prisma/schema.prisma
model UserProfile {
  id       String @id
  username String @unique  // New field
  // ... rest of fields
}
```

Then update `components/partials/header/profile-info.tsx`:
```typescript
// Instead of hardcoded @uxuidesigner
<Link href="/dashboard">
  @{userProfile?.username || session?.user?.email?.split('@')[0]}
</Link>
```

**Option B: Auto-generate from email**
```typescript
// For kencestero@gmail.com → @kencestero
const username = session.user.email.split('@')[0];
```

**Option C: Let users set custom username**
- Add username field in `/user-profile/settings`
- Validate uniqueness
- Allow changes (with rate limiting)

**Best Practices:**
- ✅ Allow 3-20 characters
- ✅ Only letters, numbers, underscores
- ✅ Must be unique
- ✅ Case-insensitive storage
- ✅ Display with @ prefix

**Current Status:** ❌ Hardcoded to `@uxuidesigner` on line 56 of `profile-info.tsx`

---

### 9. **Will the activity bar be functional when users register?**

**Answer:** NOT YET - it's showing mock data.

**Current Status:**
- ❌ Activity timeline shows hardcoded events
- ❌ "Recent Activity" in user profile is fake
- ❌ Not connected to real user actions

**What needs to be built:**
```prisma
// Add to schema.prisma
model Activity {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "photo_change", "video_added", "task_completed"
  message   String
  metadata  Json?    // Store additional data
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

**Then track activities:**
- User uploads photo → Create activity
- User completes task → Create activity
- User updates profile → Create activity

**Status:** ⚠️ Template UI exists, but NO real activity tracking

---

### 10. **Will Overview be functional when hosting on Vercel?**

**Answer:** PARTIALLY functional:

**What WILL work on Vercel:**
- ✅ Authentication (Google OAuth)
- ✅ Database queries (Prisma + PostgreSQL)
- ✅ Chat (Firebase Firestore)
- ✅ Session management
- ✅ All API routes

**What WON'T work (showing mock data):**
- ❌ User profile info (hardcoded "Jennyfer Franking")
- ❌ Follower/Following counts (hardcoded 24.5K/22.5K)
- ❌ Portfolio items (fake images)
- ❌ Skills section (hardcoded)
- ❌ Connections list (fake users)
- ❌ Projects table (mock data)
- ❌ Recent activity (fake events)

**What needs to happen:**
All those mock components need to be replaced with database queries using Prisma.

---

## What Should I Do First?

I recommend this order:

### Phase 1: Clean Mock Data (CRITICAL)
1. ✅ Remove fake notifications
2. ✅ Connect profile header to real user data
3. ✅ Update username to use real email/custom field
4. ✅ Clear fake user info

### Phase 2: Role Management
1. ✅ Implement auto-role assignment based on OWNERS/MANAGERS env vars
2. ✅ Create admin dashboard for manual role changes
3. ✅ Add role-based permissions

### Phase 3: CRM with Google Sheets
1. ✅ Set up Google Sheets structure
2. ✅ Create API routes for leads
3. ✅ Build lead management UI
4. ✅ Add activity logging

### Phase 4: Activity Tracking
1. ✅ Add Activity model to Prisma
2. ✅ Track user actions
3. ✅ Display real activity timeline

---

## Want Me to Start Fixing These Issues?

I can immediately:
1. **Clean all mock data** and replace with real database queries
2. **Set up automatic role assignment** for new users
3. **Create CRM with Google Sheets integration**
4. **Add username customization**
5. **Build activity tracking system**

**Which would you like me to tackle first?**

---

## Environment Variables Status

### ✅ Already Configured:
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- DATABASE_URL (Prisma PostgreSQL)
- FIREBASE_* (All chat credentials)
- OWNERS (kencestero@gmail.com, mjcargotrailers@gmail.com)
- MANAGERS (brianjtrailers@gmail.com, danmjtrailers@gmail.com)
- INVITE_CODE (MY-CODE-2025)

### ⚠️ Currently Using (Can Replace):
- OUTSETA_API_KEY
- OUTSETA_API_SECRET
- OUTSETA_BASE_URL

---

**Ready to make SalesDash production-ready?** Let me know which issue to fix first!
