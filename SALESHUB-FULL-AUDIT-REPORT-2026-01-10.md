# SalesHub Full System Audit Report
**Date:** January 10, 2026
**Audit Type:** Comprehensive Multi-Agent Sweep
**Purpose:** Identify and fix "years-long" consistency issues

---

## Executive Summary

Five parallel agent tracks analyzed the entire CRM codebase. Key findings:

| Track | Status | Critical Issues | High Issues | Medium Issues |
|-------|--------|-----------------|-------------|---------------|
| 1. Permissions & Security | Complete | **3** | 2 | 0 |
| 2. Settings Enforcement | Complete | **2** | 0 | 0 |
| 3. Chat & Messages | Complete | 0 | 2 | 3 |
| 4. Analytics Mockups | Complete | 0 | **4** | 4 |
| 5. Data Integrity & UX | Complete | **2** | 4 | 5 |

**Total Issues Found:** 7 Critical, 12 High, 12 Medium

---

## P0 - CRITICAL SECURITY ISSUES (Fix Immediately)

### P0-1: Quick-Action Email Bypass (SECURITY)
**File:** `app/api/crm/quick-actions/email/route.ts` (lines 42-48)
**Issue:** NO visibility check - any user can email ANY customer
**Risk:** Data breach, unauthorized customer contact
**Fix:**
```typescript
// After line 48, add customer access verification
const role = user.profile?.role || "salesperson";
const isCRMAdmin = user.profile?.canAdminCRM ?? false;

if (!["owner", "director"].includes(role) && !isCRMAdmin) {
  if (role === "salesperson" && customer.assignedToId !== user.id) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  if (role === "manager") {
    const teamMembers = await getTeamMemberIds(user.id);
    if (!teamMembers.includes(customer.assignedToId || "") && customer.managerId !== user.id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
  }
}
```

### P0-2: Quick-Action SMS Bypass (SECURITY)
**File:** `app/api/crm/quick-actions/sms/route.ts` (lines 54-60)
**Issue:** Same as email - no visibility check
**Fix:** Apply identical visibility check as P0-1

### P0-3: Export Data Leak (SECURITY)
**File:** `app/api/crm/bulk-actions/export/route.ts` (lines 46-72)
**Issue:** Export bypasses permission filter - salesperson can export ALL company data
**Fix:**
```typescript
const customers = await prisma.customer.findMany({
  where: {
    id: { in: customerIds },
    ...applyPermissionFilter(context),  // ADD THIS
  },
  select: { ... }
});
```

### P0-4: Hardcoded userRole="owner" in UI (UX/SECURITY)
**File:** `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx` (lines 1076, 1091)
**Issue:** UI always passes `userRole="owner"` to components - salespeople see buttons they can't use
**Fix:** Fetch actual user role from session and pass to components

### P0-5: PATCH Customer Bypasses Settings Validation
**File:** `app/api/crm/customers/[id]/route.ts` (line 162)
**Issue:** Direct PATCH to change status bypasses all CRM settings rules
**Fix:** Add `validateStatusChange()` call when `body.status` is present

### P0-6: POST Create Customer Bypasses Settings Validation
**File:** `app/api/crm/customers/route.ts` (line 485)
**Issue:** Creating customer with non-default status bypasses validation
**Fix:** Add `validateStatusChange()` when status != "new"

### P0-7: Generic Email Thread Creation Without Access Check
**File:** `app/api/crm/email/route.ts` (lines 37-89)
**Issue:** Creates message thread for arbitrary customers without verifying access
**Fix:** Add customer access verification before thread creation

---

## P1 - HIGH PRIORITY ISSUES (Fix This Sprint)

### P1-1: teamMemberIds Never Populated in UI
**File:** `components/crm/assignment-section.tsx` (line 69)
**Issue:** Manager's team members not fetched - filter always empty
**Fix:** Fetch team members from API or pass from parent

### P1-2: Delete Button Always Visible
**File:** `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx` (lines 633-640)
**Issue:** Delete button shown to all users, API rejects non-admins
**Fix:** Add role check before rendering delete button

### P1-3: lastContactedAt Not Updated on Activities
**File:** `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx` (lines 324-491)
**Issue:** Activity logging doesn't update customer timestamp
**Fix:** Call refresh after activity creation or update API

### P1-4: Status Endpoint Lacks Explicit Visibility Check
**File:** `app/api/crm/customers/[id]/status/route.ts` (lines 41-43)
**Issue:** Relies on implicit check - should be explicit for defense-in-depth
**Fix:** Add explicit visibility check before processing

### P1-5: Mock Chat Data File Should Be Removed
**File:** `app/api/chat/data.ts` (all 263 lines)
**Issue:** Hardcoded fake users and conversations from template
**Fix:** Delete file, move types to proper location

### P1-6: Push Notifications - Dead Code
**File:** `lib/push-notifications.ts` (all 188 lines)
**Issue:** Implemented but never integrated, no service worker
**Fix:** Remove file or complete implementation

### P1-7: Reports Area Cards - Hardcoded Data
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/reports-area.tsx`
**Issue:** Sessions, Page Views, Duration all hardcoded static values
**Fix:** Create `/api/analytics/sessions` or remove component

### P1-8: User Device Report - Mock Data
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/user-device-report.tsx`
**Issue:** Device breakdown is hardcoded
**Fix:** Add device tracking or remove component

### P1-9: Top Ten Referrals - Mock Data
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/top-ten.tsx`
**Issue:** Social media referrals hardcoded
**Fix:** Add referrer tracking or remove component

### P1-10: Country Map - Mock Data
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/country-map.tsx`
**Issue:** Geographic data hardcoded
**Fix:** Add GeoIP tracking or remove component

---

## P2 - MEDIUM PRIORITY (Fix When Possible)

### P2-1: No VIN Format Validation
**File:** `app/api/crm/customers/[id]/route.ts` (lines 104-107)
**Issue:** VIN accepts any string, should be 17 alphanumeric
**Fix:** Add VIN format regex validation

### P2-2: Email/Phone Not Re-validated on PATCH
**File:** `app/api/crm/customers/[id]/route.ts`
**Issue:** PATCH accepts invalid email/phone formats
**Fix:** Add validation on PATCH similar to POST

### P2-3: Profile Status Fields Hardcoded
**File:** `app/api/chat/profile-data/route.ts` (lines 19-21)
**Issue:** Bio, role, status always hardcoded
**Fix:** Fetch from UserProfile

### P2-4: TODO Comment Outdated
**File:** `app/[lang]/(dashboard)/(apps)/chat/chat-config.ts` (line 48)
**Issue:** Says "TODO: Create DELETE endpoint" but endpoint exists
**Fix:** Remove outdated comment

### P2-5: Top Pages Table - Mock Data
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/top-page.tsx`
**Issue:** Uses mock data file
**Fix:** Add page tracking or remove

### P2-6: Users Data Chart - Hardcoded Timeseries
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/users-stat/users-data-chart.tsx`
**Issue:** Chart data is static array
**Fix:** Connect to real data

### P2-7: Duplicate Merge Missing Per-Customer Verification
**File:** `app/api/crm/duplicates/merge/route.ts`
**Issue:** Role check exists but no per-customer access verification
**Fix:** Verify both customers are accessible before merge

### P2-8: Bulk Status Exit on First Error
**File:** `app/api/crm/bulk-actions/status/route.ts`
**Issue:** Stops on first permission error instead of collecting all
**Fix:** Already fixed - validates all before updating

### P2-9: Form Pre-flight Permission Checks
**File:** `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx` (lines 244-276)
**Issue:** No client-side permission check before PATCH
**Fix:** Add permission check before API call

### P2-10: Temperature vs Status Field Confusion
**File:** Multiple files
**Issue:** "Temperature" used to represent status in some places
**Fix:** Standardize naming across codebase

### P2-11: Data.ts Mock File in Dashboard
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/data.ts`
**Issue:** 21 hardcoded page entries
**Fix:** Remove or replace with real data

### P2-12: Users Data Table Receives Hardcoded Props
**File:** `app/[lang]/(dashboard)/(home)/dashboard/components/users-stat/users-data-table.tsx`
**Issue:** Country breakdown is hardcoded in parent
**Fix:** Connect to real analytics

---

## PR Plan: Split Into Small PRs

### PR 1: Security - Quick Action Permission Fixes
**Files:**
- `app/api/crm/quick-actions/email/route.ts`
- `app/api/crm/quick-actions/sms/route.ts`
- `app/api/crm/bulk-actions/export/route.ts`
- `app/api/crm/email/route.ts`

**Acceptance Criteria:**
- [ ] Salesperson cannot email customers not assigned to them (returns 404)
- [ ] Salesperson cannot SMS customers not assigned to them (returns 404)
- [ ] Export only includes customers user has access to
- [ ] Thread creation verifies customer access

**QA Steps:**
1. Login as salesperson, try to send email to another rep's customer → should fail
2. Login as manager, try to export all customers → should only get team's customers

---

### PR 2: Security - Settings Enforcement in PATCH/POST
**Files:**
- `app/api/crm/customers/[id]/route.ts`
- `app/api/crm/customers/route.ts`

**Acceptance Criteria:**
- [ ] PATCH with status change validates against CRM settings
- [ ] POST with non-default status validates against CRM settings
- [ ] Error messages match single status endpoint

**QA Steps:**
1. Try PATCH to mark as "won" without stock number → should fail with settings error
2. Try POST create with status "qualified" without trailer details → should fail

---

### PR 3: UX - Fix Hardcoded User Role
**Files:**
- `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx`
- `components/crm/lead-status-manager.tsx`
- `components/crm/assignment-section.tsx`

**Acceptance Criteria:**
- [ ] User role fetched from session
- [ ] Components receive actual user role
- [ ] Salespeople don't see reassignment options
- [ ] Delete button hidden for non-admins

**QA Steps:**
1. Login as salesperson → assignment section should be read-only
2. Login as manager → should only see team in assignment dropdown
3. Login as salesperson → delete button should be hidden

---

### PR 4: UX - Fix Assignment Section Team Loading
**Files:**
- `components/crm/assignment-section.tsx`

**Acceptance Criteria:**
- [ ] Manager's team members populated correctly
- [ ] Dropdown shows only accessible reps
- [ ] Filter logic works correctly

**QA Steps:**
1. Login as manager → assignment dropdown shows only team members
2. Try to assign outside team → should not be possible (not in dropdown)

---

### PR 5: Cleanup - Remove Mock/Dead Code
**Files to DELETE:**
- `app/api/chat/data.ts`
- `lib/push-notifications.ts`
- `app/[lang]/(dashboard)/(home)/dashboard/components/data.ts`

**Files to MODIFY:**
- `app/[lang]/(dashboard)/(apps)/chat/chat-config.ts` (remove TODO comment)
- `app/api/chat/profile-data/route.ts` (fix hardcoded values)

**Acceptance Criteria:**
- [ ] No mock data files remain
- [ ] No dead code files remain
- [ ] Types moved to proper location
- [ ] Chat still works after cleanup

**QA Steps:**
1. Navigate to chat → should still load contacts
2. Send a message → should still work
3. Check console for import errors → none

---

### PR 6: Analytics - Replace or Remove Mock Widgets
**Option A: Remove Mock Widgets**
**Files:**
- `app/[lang]/(dashboard)/(home)/dashboard/page-view.tsx` (remove imports)
- DELETE: `reports-area.tsx`, `user-device-report.tsx`, `top-ten.tsx`, `country-map.tsx`, `top-page.tsx`, `users-data-chart.tsx`, `users-data-table.tsx`

**Option B: Implement Real Analytics**
**Files to CREATE:**
- `app/api/analytics/sessions/route.ts`
- `app/api/analytics/devices/route.ts`
- `app/api/analytics/referrers/route.ts`

**Acceptance Criteria (Option A):**
- [ ] Dashboard loads without mock widgets
- [ ] Real CRM dashboard remains functional

**Acceptance Criteria (Option B):**
- [ ] Sessions endpoint returns real data
- [ ] Device endpoint returns real data
- [ ] Widgets update dynamically

**QA Steps:**
1. Load dashboard → no errors
2. Check network tab → no failed API calls
3. Widgets show real or no data (not hardcoded)

---

### PR 7: Data Integrity - Timestamp Updates
**Files:**
- `app/api/crm/activities/route.ts`
- `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx`

**Acceptance Criteria:**
- [ ] Creating activity updates customer.lastContactedAt
- [ ] Creating activity updates customer.lastActivityAt
- [ ] UI refreshes to show updated timestamps

**QA Steps:**
1. Log a call for customer → lastContactedAt should update
2. Check customer detail page → shows new timestamp

---

### PR 8: Validation - VIN and Form Fields
**Files:**
- `app/api/crm/customers/[id]/route.ts`
- `lib/validation.ts`

**Acceptance Criteria:**
- [ ] VIN validated as 17 alphanumeric characters
- [ ] Email format validated on PATCH
- [ ] Phone format validated on PATCH
- [ ] Clear error messages returned

**QA Steps:**
1. Try PATCH with invalid VIN → should fail
2. Try PATCH with invalid email → should fail
3. Try PATCH with valid data → should succeed

---

## Files Safe to Delete

| File | Reason | Dependencies |
|------|--------|--------------|
| `app/api/chat/data.ts` | Mock data, unused | Types need to move |
| `lib/push-notifications.ts` | Dead code, never wired | None |
| `app/[lang]/(dashboard)/(home)/dashboard/components/data.ts` | Mock data | Used by top-page.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/reports-area.tsx` | Hardcoded data | Remove from page-view.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/user-device-report.tsx` | Hardcoded data | Remove from page-view.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/top-ten.tsx` | Hardcoded data | Remove from page-view.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/country-map.tsx` | Hardcoded data | Remove from page-view.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/top-page.tsx` | Uses mock data.ts | Remove from page-view.tsx |
| `app/[lang]/(dashboard)/(home)/dashboard/components/users-stat/users-data-chart.tsx` | Hardcoded data | Remove from users-stat |
| `app/[lang]/(dashboard)/(home)/dashboard/components/users-stat/users-data-table.tsx` | Hardcoded data | Remove from users-stat |

---

## Working Features (No Changes Needed)

These are **real, working, well-implemented**:

1. **CRM Dashboard** (`/api/crm/dashboard`) - Real metrics, proper filtering
2. **Sales Report** (`/api/reports/sales`) - Real deal data, CSV export
3. **Activity Analytics** (`/api/analytics/activities`) - Real activity tracking
4. **Daily Users** (`/api/analytics/daily-users`) - Real user counts
5. **Reports Snapshot** (`/api/analytics/reports-snapshot`) - Real trending data
6. **CRM Message Threads** - Full CRUD with permissions
7. **Customer Reply Portal** - Rate limiting, notifications working
8. **Internal Team Chat** - PostgreSQL-based, real messages
9. **Notification System** - Multi-channel, working preferences
10. **Permission System** (`lib/crm-permissions.ts`) - Well-designed helpers

---

## Summary

**Immediate Action (P0):** 7 security/UX issues need fixing now
- 3 API endpoints bypass permissions
- 2 settings validation gaps
- 1 hardcoded role causing all UI issues
- 1 email thread access issue

**This Sprint (P1):** 10 high-priority issues
- UI permission fixes
- Mock data cleanup
- Dead code removal

**Later (P2):** 12 medium issues
- Validation improvements
- Field naming cleanup
- Minor fixes

**Estimated Total Effort:** 16-24 hours of development across 8 PRs
