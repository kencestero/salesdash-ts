# SalesDash Implementation Checklist 🚀

## ✅ PRIORITY #1: Google Sheets CRM Integration
**Goal:** Replace Outseta with FREE Google Sheets-based CRM

### Phase 1.1: Google Sheets Setup
- [ ] Create "MJ Cargo CRM" Google Sheet with tabs:
  - [ ] `Leads` - New potential customers
  - [ ] `Customers` - Converted leads
  - [ ] `Activities` - Sales activities log
  - [ ] `Inventory` - Link to existing inventory sheet
- [ ] Share sheet with service account: `mj-cargo-dashboard-service-acc@mj-cargo-dashboard.iam.gserviceaccount.com`
- [ ] Set up column structure (I'll provide template)

### Phase 1.2: Backend API Routes
- [ ] Create `/app/api/crm/leads/route.ts` - List & create leads
- [ ] Create `/app/api/crm/leads/[id]/route.ts` - Update & delete leads
- [ ] Create `/app/api/crm/customers/route.ts` - Customer management
- [ ] Create `/app/api/crm/activities/route.ts` - Log sales activities
- [ ] Create `/app/api/crm/sync/route.ts` - Sync with Google Sheets

### Phase 1.3: Frontend CRM Dashboard
- [ ] Build `/app/[lang]/(dashboard)/crm/leads/page.tsx` - Leads table
- [ ] Build `/app/[lang]/(dashboard)/crm/customers/page.tsx` - Customers table
- [ ] Build `/app/[lang]/(dashboard)/crm/pipeline/page.tsx` - Visual pipeline
- [ ] Add lead creation form
- [ ] Add lead status updates (New → Contacted → Qualified → Won/Lost)
- [ ] Add activity logging (calls, emails, meetings)

### Phase 1.4: Google Apps Script Integration
- [ ] Update existing Apps Script to handle CRM operations
- [ ] Add webhook for real-time updates
- [ ] Test bi-directional sync

**Estimated Time:** 2-3 hours
**Status:** Ready to start NOW

---

## ✅ PRIORITY #2: Clean Mock Data & Fix Profile Display

### Task 4: Clear Mock Notifications ✅ (DOING NOW)
- [x] Empty fake notifications array
- [ ] Connect to real notification system (Firebase or Prisma)
- [ ] Show real user alerts

### Task 8: Username System
**Answer to your question:** Names come from **Gmail** (Google OAuth)!

When users sign in with Google:
```javascript
// From Google OAuth automatically:
session.user.name = "Kenneth Cestero Campos"  // From Gmail
session.user.email = "kencestero@gmail.com"   // From Gmail
session.user.image = "https://..."            // From Gmail profile pic
```

**Username Options:**
- [ ] **Option A:** Auto-generate from email: `@kencestero` (from kencestero@gmail.com)
- [ ] **Option B:** Let users customize in Settings page
- [ ] **Option C:** Use full name from Gmail as-is

**Decision:** Which do you prefer?

### Task 10: Replace Mock Profile Data
- [ ] Update header to show real user name (from Google)
- [ ] Remove hardcoded "Jennyfer Franking"
- [ ] Remove fake follower counts (24.5K/22.5K)
- [ ] Connect "Information" panel to UserProfile table
- [ ] Show real joining date from database
- [ ] Pull real user photo from Google OAuth

**Status:** Ready after Task 4

---

## ✅ PRIORITY #3: Role Management System

### Task 5: Manual Role Assignment (Manager Dashboard)

**You asked: "Can managers give roles through dashboard or backend?"**

**Answer:** YES! Best approach:

**Backend Setup:**
1. Add to `UserProfile` table (already exists):
```prisma
model UserProfile {
  role String @default("salesperson")
  // "owner", "manager", "salesperson"
}
```

2. Create API route: `/app/api/admin/users/[id]/role/route.ts`
   - Only accessible by owners/managers
   - Update user role in database

**Frontend Dashboard:**
1. Create page: `/app/[lang]/(dashboard)/admin/users/page.tsx`
   - Table of all users
   - Dropdown to change role
   - Only visible to owners/managers

**Who can assign roles:**
- ✅ **Owners** (in OWNERS env var) → Can assign ANY role
- ✅ **Managers** (in MANAGERS env var) → Can assign "salesperson" only
- ❌ **Salesperson** → Cannot assign roles

**ENV vars location:**
- In Vercel dashboard: Project Settings → Environment Variables
- Locally: `.env.local` file

**Current values:**
```
OWNERS=kencestero@gmail.com,mjcargotrailers@gmail.com,Mightneedoil@gmail.com
MANAGERS=brianjtrailers@gmail.com,danmjtrailers@gmail.com
```

**Workflow:**
1. User signs in with Google → Auto-assigned "salesperson"
2. If email in OWNERS → Auto-assigned "owner"
3. If email in MANAGERS → Auto-assigned "manager"
4. Owners can change anyone's role via dashboard
5. Managers can promote salespeople to manager

**Tasks:**
- [ ] Add role check on signin (auto-assign from env vars)
- [ ] Create `/admin/users` page (table + role dropdown)
- [ ] Add permission middleware
- [ ] Create role update API endpoint
- [ ] Add role badges in user list

**Status:** Ready to build

---

## ✅ PRIORITY #4: Activity Tracking System

### Task 9: Make Activity Timeline Functional

**You said: "I thought Prisma was for this? Tracking"**

**Answer:** YES! Prisma is PERFECT for this. Here's the plan:

### Step 1: Add Activity Model to Database
```prisma
model Activity {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "profile_updated", "lead_created", "deal_won"
  title     String   // "User Photo Changed"
  message   String   // "Jane Doe changed their avatar photo"
  metadata  Json?    // Extra data: { photoUrl: "..." }
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

### Step 2: Track Events Automatically
Every action creates an activity:
- User updates profile → Log activity
- Salesperson creates lead → Log activity
- Deal is won → Log activity
- Task completed → Log activity

### Step 3: Display Real Activities
Replace fake timeline with real database queries:
```typescript
// Get recent activities
const activities = await prisma.activity.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

**Tasks:**
- [ ] Add Activity model to Prisma schema
- [ ] Run database migration
- [ ] Create helper function: `logActivity(userId, type, title, message)`
- [ ] Hook into user actions (profile updates, CRM actions, etc.)
- [ ] Update activity timeline component to query database
- [ ] Add real-time updates (optional)

**Status:** Ready to implement

---

## 📋 MASTER CHECKLIST - Execution Order

### ✅ PHASE 1: Clean & Connect (Do First)
- [x] Clear mock notifications ← **DOING NOW**
- [ ] Connect profile to Google OAuth data
- [ ] Add username generation from email
- [ ] Remove "Jennyfer Franking" everywhere

**Time:** 30 minutes

---

### 🚀 PHASE 2: Google Sheets CRM (PRIORITY #1 GOAL)
- [ ] Set up Google Sheets structure
- [ ] Build CRM API routes
- [ ] Create Leads dashboard page
- [ ] Create Customers dashboard page
- [ ] Add lead creation form
- [ ] Add activity logging
- [ ] Test Google Sheets sync
- [ ] Add visual pipeline view

**Time:** 2-3 hours

---

### 👥 PHASE 3: Role Management Dashboard
- [ ] Add auto-role assignment on signin
- [ ] Create `/admin/users` page
- [ ] Add role dropdown (Owner/Manager/Salesperson)
- [ ] Add permission checks
- [ ] Create role update API
- [ ] Add role badges in UI

**Time:** 1-2 hours

---

### 📊 PHASE 4: Activity Tracking (Prisma)
- [ ] Add Activity model to schema
- [ ] Run Prisma migration
- [ ] Create `logActivity()` helper
- [ ] Hook into user actions
- [ ] Update activity timeline component
- [ ] Show real recent activities

**Time:** 1 hour

---

### 🎨 PHASE 5: Profile Data (Fix Priority #10)
- [ ] Replace all mock user info
- [ ] Connect to UserProfile table
- [ ] Show real joining date
- [ ] Pull Google profile photo
- [ ] Update skills from database
- [ ] Connect connections to real users
- [ ] Link projects to CRM deals

**Time:** 1-2 hours

---

## 🎯 TOTAL ESTIMATED TIME: 5-9 hours

---

## 🤖 BONUS: "Jennyfer" Bot Idea

**Your idea:** "Dress her with MJ Cargo logo and call her bot"

Love this! Here's how:
- [ ] Create MJ Cargo avatar image
- [ ] Add chatbot component
- [ ] Use Jennyfer as helpful sales assistant
- [ ] Answer common questions
- [ ] Guide new users through dashboard
- [ ] Suggest leads based on activity

**Want me to build this?** Could be fun!

---

## 🚦 READY TO START?

**I'm starting with Task 4 (clearing mock notifications) RIGHT NOW.**

**After that, which should I tackle?**
1. **Google Sheets CRM** (Your #1 priority) 🥇
2. **Role Management Dashboard** (So managers can assign roles)
3. **Activity Tracking** (Make timeline functional)

**Or should I do them in this order? (Recommended)**
1. Clear mock data ✅ (30 min)
2. Build Google Sheets CRM 🥇 (2-3 hrs)
3. Role management dashboard 👥 (1-2 hrs)
4. Activity tracking 📊 (1 hr)
5. Fix profile data 🎨 (1-2 hrs)

**Let me know and I'll execute!** 🚀
