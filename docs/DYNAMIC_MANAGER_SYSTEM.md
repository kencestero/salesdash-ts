# Dynamic Manager System - Implementation Guide

**Created:** October 18, 2025
**Status:** Phase 3 Complete (Signup Page Dynamic)
**Owner:** Kenneth Cestero

---

## 🎯 Project Vision

Transform the static, hardcoded manager assignment system into a **dynamic, database-driven manager ecosystem**.

### Goals:
- ✅ Managers appear in signup dropdown based on database flags (not hardcoded)
- ✅ Owners/Directors control who appears as available managers
- 🔄 User suspension/removal cascades properly (reassign reps/leads/customers)
- 📋 Kenneth has custom rep codes (REP4684 + VIP3548)

---

## ✅ PHASE 1: DATABASE FOUNDATION (COMPLETE)

### Schema Changes:
```prisma
model UserProfile {
  // ... existing fields ...

  // NEW FIELDS:
  isAvailableAsManager Boolean @default(false)  // Can appear in manager dropdown?
  isActive            Boolean @default(true)    // Account active status (for soft-delete)
}
```

### Migration:
```bash
DATABASE_URL="..." npx prisma db push
```

**Status:** ✅ Complete
**Commit:** `bcaec84`

---

## ✅ PHASE 2: API ENDPOINTS (COMPLETE)

### 1. GET /api/managers/available (Public)

**Purpose:** Returns dynamic manager list for signup page
**File:** `app/api/managers/available/route.ts`

**Query Logic:**
```sql
WHERE role IN ('owner', 'director', 'manager')
  AND isAvailableAsManager = true
  AND isActive = true
ORDER BY role ASC, name ASC
```

**Response:**
```json
{
  "success": true,
  "managers": [
    {
      "id": "user_xyz",
      "name": "Kenneth Cestero",
      "role": "owner",
      "email": "kencestero@gmail.com"
    }
  ],
  "count": 1
}
```

### 2. PATCH /api/admin/users/[id]/toggle-manager (Protected)

**Purpose:** Toggle manager availability
**File:** `app/api/admin/users/[id]/toggle-manager/route.ts`
**Auth:** Requires role IN ('owner', 'director')

**Body:**
```json
{
  "isAvailableAsManager": true | false
}
```

**Validation:**
- Target user must have role: owner, director, or manager
- Only owners/directors can call this endpoint

**Status:** ✅ Complete
**Commit:** `bcaec84`

---

## ✅ PHASE 3: SIGNUP PAGE UPDATE (COMPLETE)

### File: `app/[lang]/auth/join/page.tsx`

### Changes Made:
- ❌ **Removed:** Hardcoded manager array (lines 40-48)
- ✅ **Added:** Dynamic fetch via `useEffect`
- ✅ **Added:** Loading state during fetch
- ✅ **Added:** Role display in dropdown (e.g., "Kenneth Cestero (owner)")
- ✅ **Added:** Empty state handling

### Before:
```tsx
const managers = [
  { id: "manager1", name: "Alex Johnson" },
  // ... hardcoded list
];
```

### After:
```tsx
const [managers, setManagers] = useState([]);
const [loadingManagers, setLoadingManagers] = useState(false);

useEffect(() => {
  async function fetchManagers() {
    const res = await fetch("/api/managers/available");
    const data = await res.json();
    setManagers(data.managers || []);
  }
  fetchManagers();
}, []);
```

**Status:** ✅ Complete
**Commit:** `bcaec84`

---

## 🔄 PHASE 4: USER MANAGEMENT UI (IN PROGRESS)

### Goal:
Add "Manager Settings" section to User Management page

### Features:
- View who is currently available as a manager
- Toggle manager availability with a switch
- See how many reps each manager has assigned

### Wireframe:
```
┌─────────────────────────────────────────┐
│ 📋 Manager Assignment Settings          │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Kenneth Cestero (Owner) [0 reps]     │
│   [Toggle Switch: ON]                   │
│                                         │
│ ✗ Sarah Martinez (Manager) [0 reps]    │
│   [Toggle Switch: OFF]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Status:** 🔄 Next to implement

---

## 📋 PHASE 5: USER SUSPENSION SYSTEM (PLANNED)

### Workflow:

**Step 1: Check Dependencies**
```sql
-- Count assigned reps
SELECT COUNT(*) FROM UserProfile WHERE managerId = ?

-- Count leads
SELECT COUNT(*) FROM Customer WHERE assignedRep = ?
```

**Step 2: Confirmation Modal**
```
⚠️ Suspend User: Sarah Martinez

This will affect:
  • 12 assigned reps
  • 45 CRM leads
  • 23 customers

Reassign to: [Select Manager ▼]

[Cancel] [Confirm Suspension]
```

**Step 3: Cascade Updates**
```sql
-- Reassign reps
UPDATE UserProfile
SET managerId = [newManagerId]
WHERE managerId = [oldManagerId]

-- Reassign leads
UPDATE Customer
SET assignedRep = [newManagerId]
WHERE assignedRep = [oldManagerId]

-- Soft delete user
UPDATE UserProfile
SET isActive = false,
    isAvailableAsManager = false,
    accountStatus = 'suspended'
WHERE userId = [oldManagerId]
```

**Status:** 📋 Design phase

---

## 👤 PHASE 6: KENNETH'S CUSTOM SETUP (PLANNED)

### Requirements:
- Email: kencestero@gmail.com
- Rep Code 1: REP4684
- Rep Code 2: VIP3548 (special)
- Role: Owner
- isAvailableAsManager: true

### Outstanding Questions:
1. **Two rep codes - how?**
   - One account with both codes?
   - Two separate accounts?
   - **⏳ Awaiting decision**

2. **What is VIP3548 used for?**
   - **⏳ Needs clarification**

**Status:** ⏳ Waiting for requirements

---

## 🎨 PHASE 7: AVATAR DROPDOWN - "PAGE ACCESS" LINK (PLANNED)

### Goal:
Add "Page Access" link to avatar dropdown, above "Secret Code Instructions"

### File: `components/partials/header/profile-info.tsx`

### Current Menu:
- Settings
- Messages
- Profile
- Dashboard
- **🆕 Page Access** ← Add here
- Secret Code Instructions
- FAQ
- Pricing
- Sign Out

### Question:
**Where should "Page Access" link to?**
- User Management page?
- Different page?
- **⏳ Awaiting destination**

**Status:** ⏳ Awaiting clarification

---

## 🧪 PHASE 8: TESTING (PLANNED)

### Test Scenarios:

1. **Manager Dropdown:**
   - [ ] Signup page loads managers dynamically
   - [ ] Only shows `isAvailableAsManager = true`
   - [ ] Displays role in parentheses
   - [ ] Shows loading state

2. **Toggle Manager:**
   - [ ] Owner toggles manager availability
   - [ ] Database updates correctly
   - [ ] Signup page reflects change
   - [ ] Non-admins blocked from endpoint

3. **User Suspension:**
   - [ ] Dependency count shown
   - [ ] Reassignment works
   - [ ] User marked inactive
   - [ ] Removed from manager dropdown

4. **Kenneth's Account:**
   - [ ] Custom rep codes assigned
   - [ ] Shows as available manager
   - [ ] Role is "owner"

**Status:** Not started

---

## 📚 Technical Decisions

### Decision 1: Database Approach
**Answer:** Boolean flags in UserProfile (simple, clean)

### Decision 2: Build Strategy
**Answer:** SAFE - Take time to do it right, not rushed

### Decision 3: User Removal
**Answer:** Soft delete (mark inactive, keep in database)

### Decision 4: Pending Rep Access
**Answer:** Full access initially, add restrictions later

---

## 🚀 Deployment Log

| Commit | Phase | Description | Status |
|--------|-------|-------------|--------|
| `bcaec84` | 1-3 | Database + API + Signup | ✅ Deployed |
| TBD | 4 | User Management UI | 🔄 Next |
| TBD | 5 | Suspension System | 📋 Planned |
| TBD | 6 | Kenneth Setup | ⏳ Blocked |
| TBD | 7 | Avatar Dropdown | ⏳ Blocked |

---

## 📝 Session Notes

**Working Session:** October 18, 2025
- Kenneth with family during implementation
- Given permission to work autonomously
- Safe approach > speed
- Documentation-first strategy

**Next When Kenneth Returns:**
1. Review progress
2. Answer pending questions (rep codes, Page Access destination)
3. Test Gmail registration fix
4. Check Tony Ross registration issue
5. Approve User Management UI design

---

**Last Updated:** October 18, 2025 12:20 AM
**Current Phase:** 4 (User Management UI)
**Blockers:** None
