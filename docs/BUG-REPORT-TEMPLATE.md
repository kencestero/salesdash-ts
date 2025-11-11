# 🐛 Bug Report Template

Use this template to report any bugs found during QA testing or production use.

---

## Bug ID: [AUTO-INCREMENT]

**Reported By:** [Your Name]
**Date:** [YYYY-MM-DD]
**Environment:** [Production / Staging / Local]
**URL:** [Page where bug occurred]

---

## 🔴 Severity Level

Select ONE:

- [ ] **🚨 BLOCKER** - Breaks core functionality, launch blocker, fix ASAP
- [ ] **⚠️ CRITICAL** - Major feature broken, high priority fix
- [ ] **🟡 HIGH** - Important but not blocking, fix before launch if possible
- [ ] **🟢 MEDIUM** - Minor issue, fix if time allows
- [ ] **⚪ LOW** - Cosmetic issue, post-launch fix

---

## 📝 Bug Description

**What happened?**
[Clear, concise description of the bug]

**What should have happened?**
[Expected behavior]

**Impact on users:**
[Who is affected? How many users?]

---

## 🔁 Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. [Continue until bug occurs]

**Can you reproduce this consistently?**
- [ ] Yes (every time)
- [ ] Sometimes (intermittent)
- [ ] No (only happened once)

---

## 📸 Screenshots / Videos

**Attach screenshots or screen recordings:**

- Screenshot 1: [Description]
- Screenshot 2: [Description]
- Video: [Link to Loom/recording]

**Console errors (if applicable):**
```
[Paste any console errors from browser DevTools]
```

**Network errors (if applicable):**
```
[Paste any failed API requests from Network tab]
```

---

## 🖥️ Environment Details

**Browser:** [Chrome 120 / Safari 17 / Firefox 121 / etc.]
**OS:** [Windows 11 / macOS 14 / iOS 17 / Android 14]
**Device:** [Desktop / iPhone 15 / Galaxy S23 / iPad Pro]
**Screen Size:** [1920x1080 / 390x844 / etc.]

**Logged in as:**
- [ ] Owner
- [ ] Director
- [ ] Manager
- [ ] Salesperson
- [ ] Not logged in (public page)

**User Account Details:**
- Email: [user@example.com]
- Rep Code: [REP482756]
- Role: [salesperson]

---

## 🔍 Additional Context

**What were you trying to do?**
[What task were you performing when the bug occurred?]

**Did this work before?**
- [ ] Yes (this is a regression)
- [ ] No (this never worked)
- [ ] Unknown

**Related features or pages:**
[List any other pages/features that might be affected]

---

## ✅ Fix Assignment

**Assigned to:** [Claude / Kenneth / Team Member]
**Priority:** [Critical / High / Medium / Low]
**Target Fix Date:** [YYYY-MM-DD]

**Proposed Solution:**
[Initial thoughts on how to fix this]

---

## 📋 Testing Checklist (After Fix)

- [ ] Bug fixed in local environment
- [ ] Code committed and pushed to GitHub
- [ ] Deployed to production
- [ ] Verified fix on production site
- [ ] Tested on original device/browser where bug occurred
- [ ] Regression tested (didn't break anything else)
- [ ] Documented in release notes (if applicable)

---

## 📝 Notes

[Any additional information, workarounds, or related issues]

---

**Status:**
- [ ] 🔴 **OPEN** - Bug confirmed, not yet fixed
- [ ] 🟡 **IN PROGRESS** - Currently being worked on
- [ ] 🟢 **FIXED** - Fix deployed, pending verification
- [ ] ✅ **CLOSED** - Verified fixed and working
- [ ] ⏸️ **DEFERRED** - Will fix post-launch

---

## Example Bug Report

---

## Bug ID: BUG-001

**Reported By:** Kenneth
**Date:** 2025-10-27
**Environment:** Production
**URL:** https://mjsalesdash.com/en/sales-tools/request

---

## 🔴 Severity Level

- [x] **🚨 BLOCKER** - Breaks core functionality, launch blocker, fix ASAP

---

## 📝 Bug Description

**What happened?**
When submitting a request, the form shows "Success" toast but the email is never sent to the manager. The request appears in the inbox with "FAILED" status.

**What should have happened?**
Email should be sent to manager's email address with request details, and status should show "SENT".

**Impact on users:**
All sales reps submitting requests will not notify their managers. Managers will not receive any request notifications.

---

## 🔁 Steps to Reproduce

1. Login as sales rep account (testclaude@mjsalesdash.com)
2. Navigate to `/sales-tools/request`
3. Fill out form:
   - Manufacturer: Diamond Cargo
   - Customer Name: John Smith
   - Email: john@example.com
   - Phone: 555-123-4567
   - Purpose: Quote Request
   - Message: "Test message"
4. Click "Submit Request"
5. Check inbox - status shows "FAILED"
6. Check manager email - no email received

**Can you reproduce this consistently?**
- [x] Yes (every time)

---

## 📸 Screenshots / Videos

**Screenshot 1:** Request inbox showing FAILED status (attached)
**Screenshot 2:** Browser console showing error (attached)

**Console errors:**
```
POST https://mjsalesdash.com/api/sales-tools/request 500 (Internal Server Error)
Error: Resend API key not configured
```

**Network errors:**
```
Status: 500 Internal Server Error
Response: {"error": "Failed to send email", "details": "RESEND_API_KEY is not set"}
```

---

## 🖥️ Environment Details

**Browser:** Chrome 120
**OS:** Windows 11
**Device:** Desktop
**Screen Size:** 1920x1080

**Logged in as:**
- [x] Salesperson

**User Account Details:**
- Email: testclaude@mjsalesdash.com
- Rep Code: REP482756
- Role: salesperson

---

## 🔍 Additional Context

**What were you trying to do?**
Testing request submission flow during QA testing.

**Did this work before?**
- [ ] No (this never worked)

**Related features or pages:**
- Request inbox (shows FAILED status)
- Manager email notifications (not sending)

---

## ✅ Fix Assignment

**Assigned to:** Claude
**Priority:** Critical (Launch Blocker)
**Target Fix Date:** 2025-10-27 (TODAY)

**Proposed Solution:**
Check Vercel environment variables - RESEND_API_KEY might not be set in production. Add env var via `vercel env add RESEND_API_KEY`.

---

## 📋 Testing Checklist (After Fix)

- [ ] Bug fixed in local environment
- [ ] Code committed and pushed to GitHub
- [ ] Deployed to production
- [ ] Verified fix on production site
- [ ] Tested on original device/browser where bug occurred
- [ ] Regression tested (didn't break anything else)
- [ ] Documented in release notes (if applicable)

---

## 📝 Notes

This is a critical launch blocker. Without email notifications, the entire request workflow is broken.

---

**Status:**
- [x] 🔴 **OPEN** - Bug confirmed, not yet fixed
