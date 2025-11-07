# SalesDash Phase 1 - Complete Feature Specification

**Last Updated:** 2025-11-05
**Status:** 30-40% Complete
**Branch:** `fix/mvp-pass`

---

## 🎯 Phase 1 Goals

Build a fully functional sales management system with:
1. Working CRM with lead management
2. Finance Calculator with quote tracking
3. Live Inventory with Excel/PDF upload
4. User Management with role-based permissions
5. Internal team communication (Chat)
6. Rep tracking and analytics

---

## 📊 Current Status by Feature Area

### ✅ = Working | ⚠️ = Partially Working | ❌ = Not Built

---

## 1. CRM (Customer Relationship Management)

**Current Status:** ⚠️ 30% Complete

### ✅ What Works:
- View customer list
- View individual customer profile
- Add notes to customers
- Delete customers
- Create Quote button (creates quote record, shows toast)

### ❌ What's Missing:

#### 1.1 Lead Creation & Import
- [ ] Manual lead creation form
- [ ] Auto-import from Google Sheets with salesperson assignment
- [ ] Carry over salesperson name from Google Sheets
- [ ] Support for leads without assigned salesperson (Owners/Directors assign later)

#### 1.2 Edit Customer Functionality
- [ ] Edit customer button/modal
- [ ] Update customer info (name, phone, email, address)
- [ ] Update trailer preferences (type, size)
- [ ] Update financing info

#### 1.3 Customer Status Management
- [ ] Status dropdown: Hot Lead, Warm Lead, Cold Lead, Deal Closed, Lost Deal, Back in Market
- [ ] Status history tracking
- [ ] Color-coded status badges
- [ ] Filter customers by status

#### 1.4 Opt-Out & Preferences
- [ ] "Remove from call list" button
- [ ] Opt-out of marketing emails checkbox
- [ ] Opt-out of marketing texts checkbox
- [ ] Prevent other reps from calling (flag)
- [ ] Opt-out timestamp and reason

#### 1.5 Salesperson Assignment
- [ ] Assign salesperson dropdown (Owners/Directors only)
- [ ] Show assigned salesperson name on customer card
- [ ] Show manager of assigned salesperson
- [ ] Filter customers by assigned salesperson
- [ ] Reassign customers to different salesperson

#### 1.6 Send Email Functionality
- [ ] Send email button
- [ ] Email template selector
- [ ] Email service dropdown (which trailer/service)
- [ ] Email history log
- [ ] Email delivery confirmation
- [ ] Email open tracking (optional)

#### 1.7 Create Quote Integration
- [ ] Redirect to Finance Calculator when "Create Quote" clicked
- [ ] Pre-fill customer name, phone, ZIP code
- [ ] Pre-select trailer if customer has preference
- [ ] Link quote back to customer profile

#### 1.8 Filtering & Search
- [ ] Filter by salesperson (Managers see their team only)
- [ ] Filter by status
- [ ] Filter by date added
- [ ] Search by name, phone, email
- [ ] Filter by trailer preferences

#### 1.9 Email Campaigns (Managers+)
- [ ] Create email campaign UI
- [ ] Select recipients with filters:
  - [ ] Trailer size preference
  - [ ] Location (ZIP code, city, state)
  - [ ] Radius search from ZIP code
  - [ ] Customer status
  - [ ] Date range (added within last X days)
- [ ] Email template editor
- [ ] Preview campaign before sending
- [ ] Send bulk emails
- [ ] Track campaign delivery/open rates

---

## 2. Finance Calculator

**Current Status:** ⚠️ 50% Complete

### ✅ What Works:
- Basic calculator interface
- Cash, Finance, RTO modes
- Manual trailer entry
- Export to HTML/PDF (with Puppeteer)
- Version stamp at bottom

### ❌ What's Missing:

#### 2.1 ZIP Code Tax Integration
- [ ] Auto-populate sales tax % by ZIP code
- [ ] Generic tax rates by state/county
- [ ] Tax rate database/API integration

#### 2.2 Quote Tracking
- [ ] Save all generated quotes to database
- [ ] Only track quotes that were copied/exported
- [ ] Track quote mode (Cash/Finance/RTO)
- [ ] Associate quote with user who created it
- [ ] Associate quote with customer (if created from CRM)

#### 2.3 Quote History & Management
- [ ] View all quotes (Owners/Directors)
- [ ] View own quotes (Salespeople)
- [ ] Filter quotes by date, mode, user, customer
- [ ] Quote details modal
- [ ] Resend quote to customer
- [ ] Mark quote as "Accepted" or "Rejected"

#### 2.4 HTML Template
- [ ] Luxury HTML theme template (styled monthly payment display)
- [ ] Professional quote export format
- [ ] Branded header/footer
- [ ] Responsive design for mobile viewing

#### 2.5 Trailer Integration
- [ ] "Run Quote" button on trailer profile in inventory
- [ ] Auto-fill: Stock Number, VIN, Selling Price, Manufacturer, Model
- [ ] Popup reminder: "Add customer name and ZIP code to proceed"
- [ ] Link quote back to trailer

---

## 3. Live Inventory

**Current Status:** ❌ 10% Complete (API exists but broken)

### ⚠️ What Exists (But Broken):
- Excel upload API route (`/api/inventory/upload-excel`)
- PDF upload API route (`/api/inventory/upload-pdf`)
- Bulk import API route (`/api/inventory/bulk-import`)
- Inventory list page (404 or doesn't load trailers)

### ❌ What's Missing:

#### 3.1 Upload Functionality
- [ ] Accept Excel files (.xlsx, .xls)
- [ ] Accept PDF files (.pdf)
- [ ] Parse Diamond Cargo Excel format
- [ ] Parse Quality Cargo Excel format
- [ ] Parse Panther Cargo Excel format
- [ ] Show upload progress indicator

#### 3.2 Review Before Save
- [ ] Display parsed trailer data in table
- [ ] Show NEW trailers in green
- [ ] Show REMOVED trailers (not in new upload) in red
- [ ] Allow manual edits to parsed data before saving
- [ ] "Save" button (commits changes to database)
- [ ] "Save & Exit" button (commits + closes window)
- [ ] "Cancel" button (discard upload)

#### 3.3 Trailer List Display
- [ ] Show all trailers in filterable table
- [ ] Color-code by manufacturer:
  - [ ] Diamond Cargo: Dark Blue
  - [ ] Quality Cargo: Red
  - [ ] Panther Cargo: (color TBD)
- [ ] Filter by manufacturer
- [ ] Filter by status (available, sold, pending)
- [ ] Filter by size
- [ ] Search by VIN or Stock Number

#### 3.4 Trailer Profile Page
- [ ] View individual trailer details
- [ ] Show images (if available)
- [ ] Show specs (length, width, height, etc.)
- [ ] Show pricing (cost, MSRP, sale price)
- [ ] "Run Quote" button → redirects to Finance Calculator
- [ ] Edit trailer button (Owners/Directors only)
- [ ] Mark as sold button
- [ ] Delete trailer button (Owners/Directors only)

#### 3.5 Upload History
- [ ] Track all uploads with timestamp
- [ ] Show who uploaded (user)
- [ ] Show # of trailers added/removed
- [ ] Rollback to previous upload (optional)

---

## 4. User Management

**Current Status:** ⚠️ 40% Complete

### ✅ What Works:
- User list page (basic)
- See user name, email, role
- Delete user button

### ❌ What's Missing:

#### 4.1 Access Control
- [ ] Hide User Management page from Salespeople and Managers
- [ ] Show only to Directors and Owners
- [ ] Hide "Delete User" button from main page (move to profile dropdown)

#### 4.2 User Profile View
- [ ] Click user → see full profile modal/page
- [ ] Display ALL info from employee application
- [ ] Show rep code
- [ ] Show manager assignment
- [ ] Show date joined
- [ ] Show last login

#### 4.3 Activity Tracking
- [ ] Track time spent in SalesDash (hours)
- [ ] Filter by:
  - [ ] Today
  - [ ] This week
  - [ ] This month
  - [ ] This year
  - [ ] All time
- [ ] Show total hours per user

#### 4.4 Color-Coded Status
- [ ] Yellow row: User active < 1 week
- [ ] Green row: User active 10-12+ hours/week (tag: "Active User")
- [ ] Red/Fire icon: User inactive > 1 month
- [ ] Gray: User never logged in

#### 4.5 Sales Performance
- [ ] Show # of trailers sold per user
- [ ] Show # of quotes created
- [ ] Show # of leads added to CRM
- [ ] Leaderboard view (optional)

---

## 5. Chat

**Current Status:** ❌ 0% Complete

### ❌ What's Missing:

#### 5.1 Chat UI
- [ ] Chat interface with message list
- [ ] Send message input
- [ ] Real-time message updates (Firebase/websockets)
- [ ] Show who is online (green dot)
- [ ] Show user avatars

#### 5.2 Public Channels
- [ ] Create public chat channels
- [ ] Anyone can join public channels
- [ ] #general, #sales, #announcements channels by default

#### 5.3 Private Messages
- [ ] Send direct message to another user
- [ ] DM conversation history
- [ ] Notification when new DM received

#### 5.4 User Status
- [ ] Toggle status: Available, Busy, Unavailable
- [ ] Show status indicator to other users
- [ ] Respect "Do Not Disturb" status

#### 5.5 Team Channels
- [ ] Managers can create private team channels
- [ ] Only team members can see/join
- [ ] Used for announcements, workflows, coordination

---

## 6. User Profiles

**Current Status:** ❌ 10% Complete

### ✅ What Works:
- Profile dropdown menu
- Basic profile info displayed

### ❌ What's Missing:

#### 6.1 Profile Customization
- [ ] Upload background image/theme
- [ ] Upload avatar image
- [ ] Token/API setup for image uploads (Cloudinary? S3?)

#### 6.2 Direct Messages
- [ ] Receive DMs from other users
- [ ] Notification badge for unread DMs
- [ ] Block Salespeople (but not Managers/Directors/Owners)

#### 6.3 Team Section
- [ ] "Team" option in profile dropdown
- [ ] View all team members (same manager)
- [ ] Team name displayed
- [ ] Team private chat access
- [ ] Team member contact cards

#### 6.4 Notifications
- [ ] Notifications dropdown (not mockups)
- [ ] Real notification system:
  - [ ] New DM
  - [ ] New quote assigned
  - [ ] New customer assigned
  - [ ] Email campaign sent
  - [ ] System announcements

#### 6.5 Email Portal
- [ ] Access to portal emails (mailbox?)
- [ ] Integration with company email system
- [ ] Email templates access

---

## 7. Salesperson Request Form

**Current Status:** ⚠️ 30% Complete

### ✅ What Works:
- Request form exists at `/sales-tools/request`
- Can submit requests
- Emails sent (if Resend configured)

### ❌ What's Missing:

#### 7.1 Easy Access
- [ ] Add to Profile dropdown menu
- [ ] Add to Sales Tools section in sidebar (bottom)
- [ ] Quick access from anywhere in dashboard

#### 7.2 Functionality
- [ ] Confirm emails are actually being sent
- [ ] Email delivery logs
- [ ] Request history (view past requests)
- [ ] Request status tracking (sent, read, replied)

---

## 8. Dashboard Analytics

**Current Status:** ⚠️ 20% Complete

### ✅ What Works:
- Basic analytics page
- Some mock data charts

### ❌ What's Missing:

#### 8.1 Rep Code Widget Relocation
- [ ] Remove "Your Rep Code" box from main dashboard
- [ ] Move to Analytics page (below User stats section)
- [ ] Keep same functionality (copy code, copy link)

#### 8.2 Real Analytics Data
- [ ] Replace mock data with real database queries
- [ ] Show actual sales numbers
- [ ] Show quote conversion rates
- [ ] Show customer acquisition trends
- [ ] Show inventory turnover rates

---

## 🚨 Critical Bugs to Fix First

### Priority 1 (Blocking):
1. **Inventory uploader doesn't accept files** - Returns "unable to load file" error
2. **CRM Edit Customer button doesn't exist** - No way to update customer info
3. **Create Quote doesn't redirect** - Should go to Finance Calculator with pre-filled data
4. **Send Email doesn't work** - No email service selector, no actual email sent

### Priority 2 (Important):
5. **Rep Code showing in 2 places** - Should only be in Analytics, not main dashboard
6. **User Management visible to all roles** - Should be Directors/Owners only
7. **Finance Calculator tax rate not auto-filling** - ZIP code should populate tax %

### Priority 3 (Nice to Have):
8. **404 errors on some preview links** - Routes not building correctly
9. **TypeScript errors blocking builds** - Currently using `ignoreBuildErrors: true` workaround

---

## 📋 Next Steps

### Step 1: Fix Critical Bugs (Week 1)
- Fix inventory uploader
- Add CRM edit customer functionality
- Connect "Create Quote" to Finance Calculator
- Implement Send Email with service selector

### Step 2: Complete Core Features (Week 2-3)
- Customer status management
- Salesperson assignment
- Quote tracking system
- Inventory color-coding

### Step 3: Advanced Features (Week 4+)
- Email campaigns
- Team chat
- User activity tracking
- Profile customization

---

## 🧪 Testing Workflow

For every feature built:

1. **Developer** (Claude/Opus/Sonnet) builds feature
2. **Push** to `fix/mvp-pass` branch
3. **Vercel** auto-builds preview (3-5 min)
4. **Kenneth** tests preview link
5. **Kenneth** approves: ✅ "deploy it" or ❌ "still broken"
6. **If approved:** Deploy to production with `vercel --prod`

**Nothing goes to production without Kenneth's approval.**

---

## 📞 Who to Bring In

- **Opus** - Built CRM, User Management, initial infrastructure
- **Sonnet** - Built Finance Calculator, export system
- **Claude (me)** - Bug fixes, integration work, documentation

**All three should review their code and fix what's broken before building new features.**

---

**End of Phase 1 Specification**
