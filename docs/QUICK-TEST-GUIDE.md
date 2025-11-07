# ⚡ QUICK TEST GUIDE — 30-Minute Launch Validation

**Production URL:** https://mjsalesdash.com
**Goal:** Validate all critical flows before Tuesday launch (35+ users)
**Time Required:** 30 minutes

---

## ✅ 1. 🔐 Authentication (5 min)

### Email Signup Flow
1. Navigate to https://mjsalesdash.com/en/auth/join
2. Enter join code (get from Kenneth)
3. Fill form:
   - Name: "Test Rep 1"
   - Email: testrepXXXX@example.com (use unique email)
   - Password: Test1234!
   - Select manager from dropdown
4. Submit → should see "Check your email" message
5. Check email for verification link
6. Click link → redirects to login
7. Login → redirects to dashboard
8. **✅ PASS:** Dashboard loads with sidebar and RepCodeCard

### Google OAuth Flow
1. Click "Continue with Google" on signup page
2. Complete Google OAuth
3. **✅ PASS:** Redirects to dashboard with profile created

### Login/Logout
1. Logout from dashboard
2. Login with email/password
3. **✅ PASS:** Redirects back to dashboard

---

## ✅ 2. 📝 Request Submission (3 min)

### Submit Request (as Sales Rep)
1. Navigate to `/sales-tools/request` from sidebar
2. Fill out form:
   - **Manufacturer:** Diamond Cargo
   - **Customer Name:** John Smith
   - **Email:** john@example.com
   - **Phone:** 555-123-4567
   - **Purpose:** Quote Request
   - **Message:** "Looking for a 7x16 tandem axle trailer"
3. Click "Submit Request"
4. **✅ PASS:**
   - Success toast appears
   - Redirects to `/sales-tools/requests/inbox`

---

## ✅ 3. 📥 Request Inbox (Rep View) (5 min)

### View Submitted Request
1. Navigate to `/sales-tools/requests/inbox`
2. **✅ PASS:** Request appears in list with:
   - Status badge (PENDING → SENT after email sent)
   - Relative timestamp ("2 minutes ago")
   - Manufacturer name (Diamond Cargo)
   - Purpose badge (Quote Request)
3. Click request card → opens thread view
4. **✅ PASS:** Thread shows:
   - Full customer details (name, email, phone)
   - Message content
   - Status badge
   - Timestamp

### Test Real-Time Polling
1. Keep inbox open for 3+ seconds
2. Watch for status badge color changes (if email sends)
3. **✅ PASS:** Page auto-updates without refresh

---

## ✅ 4. 🧑‍💼 Manager Dashboard (5 min)

### Check Manager Email Notification
1. Login to manager's email inbox (manager assigned during signup)
2. Check for email from `request@mjsalesdash.com`
3. **✅ PASS:** Email contains:
   - Subject: "New Request from Test Rep 1"
   - Rep name and repCode
   - Customer info (John Smith, john@example.com, 555-123-4567)
   - Manufacturer (Diamond Cargo)
   - Purpose (Quote Request)
   - Full message
   - Timestamp

### Test Manager View (if manager login available)
1. Login as manager account
2. Navigate to requests inbox
3. **✅ PASS:** Can see requests from assigned reps
4. **Owner/Director Test:** Should see ALL requests from entire team

---

## ✅ 5. 🧑‍🎓 Profile Page (3 min)

### View Profile
1. Navigate to `/profile` from sidebar
2. **✅ PASS:** Displays:
   - Name (editable input field)
   - Email (read-only)
   - Rep Code (read-only, orange color)
   - Role (read-only)
   - Account Status (read-only)
   - Profile picture placeholder (first initial)

### Edit Name
1. Change name in input field (e.g., "Test Rep 1 Updated")
2. Click "Save Changes" button
3. **✅ PASS:**
   - Loading spinner appears
   - Success toast: "Profile updated successfully!"
4. Refresh page (F5)
5. **✅ PASS:** Name change persists

### Test Validation
1. Clear name field (empty)
2. Click "Save Changes"
3. **✅ PASS:** Error toast: "Name cannot be empty"

---

## ✅ 6. 💬 Chat System (4 min)

### View Chat Threads
1. Navigate to `/chat` from sidebar
2. **✅ PASS:** Displays list of chat threads with:
   - Participant names
   - Last message preview
   - Relative timestamp ("5 minutes ago")

### Open Chat Thread
1. Click any chat thread
2. **✅ PASS:** Message list loads with:
   - All messages in order
   - Sender names
   - Message content
   - Relative timestamps

### Send Message
1. Type message in input field
2. Click Send button
3. **✅ PASS:** Message appears immediately in thread

### Test Real-Time Polling
1. Keep chat open for 3+ seconds
2. **✅ PASS:** Page auto-updates (check Network tab for polling)

---

## ✅ 7. 📱 Mobile Responsiveness (5 min)

### iPhone Testing (iOS Safari)
1. Open https://mjsalesdash.com on iPhone
2. Login with test account
3. **✅ PASS - Navigation:**
   - Sidebar menu accessible (hamburger icon)
   - All menu items tappable
   - No horizontal scroll

4. **✅ PASS - Request Submission:**
   - Navigate to `/sales-tools/request`
   - Form fields properly sized
   - Keyboard doesn't break layout
   - Submit button tappable (min 44x44px)

5. **✅ PASS - Request Inbox:**
   - Cards display correctly
   - Scrolling smooth
   - Status badges visible
   - Timestamps readable

6. **✅ PASS - Profile Page:**
   - Name input field accessible
   - Save button tappable
   - Toast notifications visible
   - No text cutoff

### Android Testing (Chrome Mobile)
1. Repeat all iPhone tests on Android device
2. **✅ PASS:** All features work identically

### Tablet Testing (iPad/Android Tablet)
1. Test layout at 768px+ width
2. **✅ PASS:**
   - Sidebar visible by default
   - Cards display in grid (if applicable)
   - No layout breaks

---

## 🔥 CRITICAL BUGS CHECKLIST

If you encounter these, **STOP AND REPORT IMMEDIATELY:**

### 🚨 CRITICAL (Launch Blocker)
- [ ] Cannot login (authentication broken)
- [ ] Cannot submit request (form broken)
- [ ] Dashboard crashes on load
- [ ] Manager email notifications not sending
- [ ] Request inbox not loading
- [ ] Profile page crashes

### ⚠️ HIGH PRIORITY (Fix Before Launch)
- [ ] Mobile layout broken (horizontal scroll)
- [ ] Buttons not clickable on mobile
- [ ] Real-time polling not working
- [ ] Toast notifications not appearing
- [ ] Form validation not working
- [ ] Rep code not displaying

### 🟡 MEDIUM PRIORITY (Fix if Time Allows)
- [ ] Timestamps not updating
- [ ] Status badges wrong color
- [ ] Chat messages not sending
- [ ] Profile image placeholder missing
- [ ] Sidebar menu items misaligned

### ✅ LOW PRIORITY (Post-Launch)
- [ ] Minor UI alignment issues
- [ ] Text color contrast issues
- [ ] Loading spinners too fast/slow
- [ ] Typos or copy improvements

---

## 📊 PASS/FAIL CRITERIA

### ✅ READY TO LAUNCH IF:
- All authentication flows work (email + OAuth)
- Request submission + inbox functional
- Manager email notifications sending
- Profile page loads and saves
- Mobile responsive (no major layout breaks)
- No critical bugs found

### 🚨 DO NOT LAUNCH IF:
- Authentication broken (users cannot login)
- Request submission broken (core feature failure)
- Manager notifications not sending (kills workflow)
- Dashboard crashes on load
- Mobile completely broken (50%+ of users on mobile)

---

## 🎯 TESTING PRIORITIES

**If Short on Time, Test in This Order:**

1. **Authentication** (MUST TEST) - Users need to login
2. **Request Submission** (MUST TEST) - Core feature
3. **Manager Notifications** (MUST TEST) - Critical workflow
4. **Mobile Login + Submit** (MUST TEST) - 50% of users
5. Profile Page (SHOULD TEST) - New feature
6. Chat System (SHOULD TEST) - Secondary feature
7. Request Inbox Polling (NICE TO TEST) - Enhancement

---

## ✅ FINAL SIGN-OFF

**Tested By:** _______________ (Kenneth)
**Date:** _______________
**Time Spent:** _______________ minutes

**Overall Status:**
- [ ] ✅ **PASS** - Ready to launch Tuesday
- [ ] ⚠️ **CONDITIONAL PASS** - Minor bugs, launch with monitoring
- [ ] 🚨 **FAIL** - Critical bugs found, DO NOT LAUNCH

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

**Bugs Found:** (List any issues discovered)
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Action Items Before Launch:**
- [ ] Fix critical bugs (if any)
- [ ] Send onboarding docs to 35+ users
- [ ] Set up support Slack/email
- [ ] Schedule launch announcement

---

**🚀 LET'S SHIP THIS! 💥**

**Questions or bugs?** Report immediately and I'll fix before Tuesday launch.
