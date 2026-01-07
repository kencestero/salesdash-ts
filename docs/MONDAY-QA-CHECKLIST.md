# 🚨 MONDAY QA CHECKLIST — Pre-Launch Testing

**Goal:** Validate all critical paths before Tuesday launch with 35+ users.

**Testing Environment:** https://mjsalesdash.com (Production)

**Test Accounts Needed:**
- 1 Owner account (Kenneth)
- 1 Manager account (test manager)
- 2 Sales Rep accounts (test reps)
- 1 OAuth test account (Google/GitHub)

---

## ✅ AUTHENTICATION FLOW

### Email Signup Flow
- [ ] Navigate to `/auth/join`
- [ ] Enter valid join code
- [ ] Fill out signup form (name, email, password, select manager)
- [ ] Submit form → should show "Check your email" message
- [ ] Check inbox for verification email from `noreply@mjsalesdash.com`
- [ ] Click verification link → should redirect to login
- [ ] Login with new credentials → should redirect to dashboard
- [ ] Verify user profile shows correct role, repCode, manager assignment

### OAuth Signup Flow (Google)
- [ ] Navigate to `/auth/join`
- [ ] Enter valid join code
- [ ] Click "Continue with Google"
- [ ] Complete Google OAuth flow
- [ ] Should redirect to dashboard (or complete-signup if needed)
- [ ] Verify profile shows correct info and repCode assigned

### OAuth Signup Flow (GitHub)
- [ ] Same steps as Google OAuth
- [ ] Verify GitHub account creation works

### Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Login with email/password → redirects to dashboard
- [ ] Logout → redirects to login
- [ ] Login with OAuth → redirects to dashboard

### Session Timeout
- [ ] Login and remain idle for 30 minutes
- [ ] Should auto-logout and redirect to login page
- [ ] Verify "Session timed out" message displays

---

## ✅ PROFILE PAGE

### Profile Display
- [ ] Navigate to `/profile` from sidebar
- [ ] Verify displays: name, email, repCode, role, accountStatus
- [ ] Verify profile picture shows first initial
- [ ] Verify repCode displays in orange (#E96114)

### Profile Editing
- [ ] Change name in input field
- [ ] Click "Save Changes" button
- [ ] Verify loading spinner displays
- [ ] Verify success toast appears
- [ ] Refresh page → name change persists
- [ ] Try saving empty name → should show error toast
- [ ] Verify read-only fields (email, repCode) cannot be edited

---

## ✅ REQUEST SUBMISSION FLOW

### Submit New Request (Sales Rep)
- [ ] Login as sales rep
- [ ] Navigate to `/sales-tools/request`
- [ ] Fill out request form:
  - Select manufacturer (Diamond, Quality, Panther Cargo)
  - Enter name, email, phone
  - Select purpose (Quote Request, Inventory Check, Custom Build)
  - Enter message
- [ ] Click "Submit Request"
- [ ] Verify success toast appears
- [ ] Verify redirect to inbox

### Request Inbox (Sales Rep View)
- [ ] Navigate to `/sales-tools/request/inbox`
- [ ] Verify submitted request appears in list
- [ ] Verify displays: status badge (PENDING/SENT/FAILED), timestamp (relative), manufacturer, purpose
- [ ] Click request card → opens thread view
- [ ] Verify thread shows: full details, customer info, message, status badge
- [ ] Wait 3 seconds → verify real-time polling updates (if status changes)
- [ ] Verify timestamps update (e.g., "2 minutes ago" → "3 minutes ago")

### Manager Email Notification
- [ ] Check manager's email inbox
- [ ] Verify received email from `request@mjsalesdash.com`
- [ ] Verify email contains:
  - Rep name and repCode
  - Customer name, email, phone
  - Manufacturer and purpose
  - Full message
  - Timestamp
- [ ] Verify email subject: "New Request from {RepName}"
- [ ] Check if reply-to thread works (if manager replies to email)

---

## ✅ MANAGER DASHBOARD

### Manager Request View
- [ ] Login as manager account
- [ ] Navigate to requests/inbox (if accessible to managers)
- [ ] Verify can see all requests from assigned reps
- [ ] Verify cannot see requests from other managers' reps
- [ ] Test filtering/sorting (if available)

### Owner/Director View
- [ ] Login as owner or director
- [ ] Verify can see ALL requests from entire team
- [ ] Verify role-based permissions working correctly

---

## ✅ CHAT SYSTEM

### Chat Thread List
- [ ] Navigate to `/chat`
- [ ] Verify displays list of chat threads
- [ ] Verify shows: participant names, last message preview, timestamp (relative)
- [ ] Wait 3 seconds → verify real-time polling updates
- [ ] Click thread → opens message list

### Chat Messages
- [ ] Open chat thread
- [ ] Verify displays all messages in order
- [ ] Verify shows: sender name, message content, timestamp (relative)
- [ ] Send new message
- [ ] Verify message appears immediately
- [ ] Wait 3 seconds → verify real-time polling updates
- [ ] Open same thread in another browser → verify both update

### Chat Creation
- [ ] Create new chat thread (if feature exists)
- [ ] Verify can search/select participants
- [ ] Send first message
- [ ] Verify thread appears in list

---

## ✅ USER MANAGEMENT (Admin Only)

### User List
- [ ] Login as owner or director
- [ ] Navigate to `/user-management`
- [ ] Verify displays all users with: name, email, role, repCode, status
- [ ] Verify can filter by role
- [ ] Verify can search by name/email

### User Actions
- [ ] Click user → opens user detail view
- [ ] Verify can edit user role
- [ ] Verify can toggle manager availability (`isAvailableAsManager`)
- [ ] Verify can ban/unban user
- [ ] Verify can delete user (soft delete with `isActive: false`)
- [ ] Test permissions: sales rep should NOT access user management

---

## ✅ REP CODE SYSTEM

### Rep Code Display
- [ ] Login as sales rep
- [ ] Verify dashboard shows RepCodeCard component
- [ ] Verify displays full repCode (e.g., "REP482756")
- [ ] Verify "Copy Link" button copies credit app URL
- [ ] Click "Copy Link" → verify confetti celebration modal appears
- [ ] Verify copied link format: `https://remotivetrailers.com/credit-application/{repCode}`

### Public Credit Application
- [ ] Open credit app link in incognito browser (no auth)
- [ ] Verify page loads without login required
- [ ] Verify displays rep name banner at top
- [ ] Fill out credit application form
- [ ] Submit form
- [ ] Verify submission success message
- [ ] Check database → verify `creditApplication.userId` matches rep's user ID

### Freelancer Rep Code
- [ ] Login as freelancer account (check "I DON'T KNOW YET" during signup)
- [ ] Verify repCode is "REP000000" (hardcoded for freelancers)
- [ ] Verify credit app link still works with REP000000

---

## ✅ NAVIGATION & SIDEBAR

### Sidebar Menu
- [ ] Verify sidebar displays correctly on all pages
- [ ] Verify menu items show correct icons
- [ ] Verify active page highlight works
- [ ] Test collapsible sidebar (if feature exists)
- [ ] Verify role-based menu items (e.g., User Management only for owners/directors)

### Menu Items Test
- [ ] Dashboard → loads successfully
- [ ] CRM → loads successfully
- [ ] Calendar → loads successfully
- [ ] Inventory → loads successfully
- [ ] Chat → loads successfully
- [ ] Sales Tools → Request → loads successfully
- [ ] User Management → loads successfully (admin only)
- [ ] Profile → loads successfully

---

## 📱 MOBILE RESPONSIVE TESTING

### iPhone Testing (iOS Safari)
- [ ] Test signup flow on iPhone
- [ ] Test login flow
- [ ] Test request submission (form usability)
- [ ] Test request inbox (card layout, scrolling)
- [ ] Test chat (message list, input field)
- [ ] Test sidebar navigation (hamburger menu)
- [ ] Test profile page
- [ ] Verify buttons are tappable (min 44x44px touch target)
- [ ] Verify no horizontal scroll issues
- [ ] Test landscape orientation

### Android Testing (Chrome Mobile)
- [ ] Repeat all iPhone tests on Android device
- [ ] Verify back button behavior
- [ ] Test keyboard behavior (form inputs)
- [ ] Verify toast notifications visible

### Tablet Testing (iPad/Android Tablet)
- [ ] Test layout at 768px+ width
- [ ] Verify sidebar behavior
- [ ] Test all critical flows

### Mobile-Specific Issues
- [ ] Verify z-index issues (dialogs, dropdowns)
- [ ] Test scroll behavior (fixed headers, sticky elements)
- [ ] Verify images load correctly
- [ ] Test touch gestures (swipe, tap, long-press if applicable)

---

## ⚡ PERFORMANCE TESTING

### Page Load Times
- [ ] Measure dashboard load time (should be <3s)
- [ ] Measure request inbox load time
- [ ] Measure chat load time
- [ ] Check Vercel Analytics for Core Web Vitals

### Real-Time Updates
- [ ] Verify request inbox polls every 3 seconds (check Network tab)
- [ ] Verify chat polls every 3 seconds
- [ ] Verify no memory leaks (check Memory tab after 5 minutes)
- [ ] Verify polling stops on page unmount (navigate away)

### Database Performance
- [ ] Check Neon dashboard for slow queries
- [ ] Verify no N+1 query issues
- [ ] Check connection pool usage

---

## 🔒 SECURITY TESTING

### Authentication Security
- [ ] Try accessing `/dashboard` without login → should redirect to `/auth/login`
- [ ] Try accessing admin routes as sales rep → should return 403
- [ ] Verify JWT tokens expire correctly
- [ ] Test CSRF protection (if applicable)

### API Endpoint Security
- [ ] Try calling `/api/admin/*` endpoints without auth → should return 401
- [ ] Try calling admin endpoints as non-admin → should return 403
- [ ] Verify sensitive data not exposed in API responses

### OAuth Security
- [ ] Verify OAuth signup blocked without join code
- [ ] Verify existing users can login (no join code required)
- [ ] Test OAuth with invalid state parameter

---

## 🐛 EDGE CASES & ERROR HANDLING

### Error Scenarios
- [ ] Submit request with missing required fields → should show validation errors
- [ ] Try signup with already-used email → should show error
- [ ] Try login with wrong password → should show error
- [ ] Test network failure scenarios (disconnect internet during request)
- [ ] Test concurrent edits (two users editing same record)

### Boundary Testing
- [ ] Submit request with very long message (10,000 characters)
- [ ] Upload profile image with huge file size (if feature exists)
- [ ] Test with 0 requests in inbox (empty state)
- [ ] Test with 100+ requests in inbox (pagination)

### Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)

---

## 📊 DATA VALIDATION

### Database Integrity
- [ ] Check users have correct `repCode` format (REP + 6 digits)
- [ ] Check all users have `UserProfile` record
- [ ] Check all requests have `userId` assigned correctly
- [ ] Check no duplicate repCodes in database
- [ ] Check manager assignments are valid (managerId exists)

### Email Logs
- [ ] Check Resend dashboard for email delivery status
- [ ] Verify no bounced emails
- [ ] Verify email threading works (In-Reply-To headers)

---

## 🚀 GO-LIVE READINESS

### Pre-Launch Checklist
- [ ] All critical bugs fixed
- [ ] Mobile responsive issues resolved
- [ ] Performance acceptable (page loads <3s)
- [ ] Security vulnerabilities addressed
- [ ] Error handling graceful (no crashes)
- [ ] Real-time updates working
- [ ] Email notifications sending correctly

### Documentation Ready
- [ ] REP-ONBOARDING.md complete and accurate
- [ ] MANAGER-ONBOARDING.md complete and accurate
- [ ] Support email/Slack channel set up (if applicable)

### Deployment Checklist
- [ ] Environment variables set in Vercel
- [ ] Database migrations complete
- [ ] Cron jobs configured (Google Sheets sync at 8am daily)
- [ ] Domain configured (mjsalesdash.com)
- [ ] SSL certificate valid
- [ ] Vercel Analytics enabled

### Communication Plan
- [ ] Send onboarding docs to all 35+ users
- [ ] Schedule launch announcement email
- [ ] Prepare support contact info
- [ ] Set up monitoring alerts (if applicable)

---

## 🔥 CRITICAL BUGS (FOUND DURING QA)

### High Priority
- [ ] **Bug:** [Description]
  - **Impact:** [Who/what affected]
  - **Fix:** [Solution]
  - **Status:** [Fixed/In Progress/Blocked]

### Medium Priority
- [ ] **Bug:** [Description]
  - **Impact:** [Who/what affected]
  - **Fix:** [Solution]
  - **Status:** [Fixed/In Progress/Blocked]

### Low Priority (Post-Launch)
- [ ] **Bug:** [Description]
  - **Impact:** [Who/what affected]
  - **Fix:** [Solution]
  - **Status:** [Deferred]

---

## ✅ FINAL SIGN-OFF

- [ ] Kenneth (Owner) - Tested and approved
- [ ] Test Manager Account - Verified manager flows
- [ ] Test Sales Rep Account - Verified rep flows
- [ ] Mobile Testing Complete
- [ ] All critical bugs fixed
- [ ] **GO/NO-GO:** Ready for Tuesday launch

---

**Last Updated:** [Timestamp]
**QA Lead:** Claude + Kenneth
**Launch Date:** Tuesday (24 hours from now)
