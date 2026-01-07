# Notification System Implementation Plan

**Status:** In Progress
**Priority:** CRITICAL - Required for sales rep hiring
**Created:** 2025-01-07

---

## Overview

Build a complete notification system for Remotive SalesHub that delivers **instant** alerts via **In-App + Email** channels.

---

## Phase 1: Core Infrastructure (DO FIRST)

### 1.1 Database Schema

```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String   // Recipient
  type        NotificationType
  title       String
  message     String
  data        Json?    // Additional context (customerId, creditAppId, etc.)
  read        Boolean  @default(false)
  emailSent   Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([userId, createdAt])
}

model NotificationPreference {
  id                    String   @id @default(cuid())
  userId                String   @unique

  // Channel toggles
  inAppEnabled          Boolean  @default(true)
  emailEnabled          Boolean  @default(true)

  // CRM Notifications
  customerAssigned      Boolean  @default(true)
  creditAppUpdates      Boolean  @default(true)
  followUpReminders     Boolean  @default(true)
  duplicateAlerts       Boolean  @default(true)
  statusChanges         Boolean  @default(true)

  // System Notifications
  systemAnnouncements   Boolean  @default(true)
  tipsAndTricks         Boolean  @default(true)

  // Quiet Hours (future)
  quietHoursEnabled     Boolean  @default(false)
  quietHoursStart       String?  // "22:00"
  quietHoursEnd         String?  // "08:00"

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  // CRM - Priority Order
  CUSTOMER_ASSIGNED      // A - Someone assigned a customer to you
  CREDIT_APP_SUBMITTED   // B - Customer submitted credit app
  CREDIT_APP_APPROVED    // B - Credit app approved
  CREDIT_APP_DECLINED    // B - Credit app declined
  FOLLOW_UP_DUE          // C - Time to follow up with customer
  DUPLICATE_DETECTED     // D - Someone tried to add your customer
  STATUS_CHANGED         // E - Manager changed customer status

  // System
  SYSTEM_ANNOUNCEMENT    // News from management
  TIP                    // Dashboard tips (complete profile, etc.)
  MEETING                // Meeting announcements
  NEW_FEATURE            // New tools/features available
}
```

### 1.2 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications` | GET | List user's notifications (paginated) |
| `/api/notifications` | POST | Create notification (internal/admin) |
| `/api/notifications/unread-count` | GET | Get unread count for bell badge |
| `/api/notifications/[id]/read` | PATCH | Mark single notification as read |
| `/api/notifications/mark-all-read` | POST | Mark all as read |
| `/api/notifications/preferences` | GET | Get user's notification settings |
| `/api/notifications/preferences` | PATCH | Update notification settings |

---

## Phase 2: UI Components

### 2.1 Notification Bell (Header)

Location: Top header bar, next to avatar

```
[Bell Icon] (Orange dot if unread)
   └── Dropdown Panel
       ├── Header: "Notifications" + "Mark all read"
       ├── List of recent notifications (last 10)
       │   ├── Icon (based on type)
       │   ├── Title + Message
       │   ├── Time ago
       │   └── Unread indicator (dot)
       └── Footer: "View All" → /notifications page
```

### 2.2 Settings Page

Location: Avatar Menu → **Settings** (NEW) → Notifications tab

```
/[lang]/user-profile/settings → Add "Notifications" tab

Sections:
├── Notification Channels
│   ├── [Toggle] In-App Notifications
│   └── [Toggle] Email Notifications
│
├── CRM Alerts
│   ├── [Toggle] Customer Assigned to Me
│   ├── [Toggle] Credit Application Updates
│   ├── [Toggle] Follow-up Reminders
│   ├── [Toggle] Duplicate Customer Alerts
│   └── [Toggle] Status Changes by Manager
│
└── System Notifications
    ├── [Toggle] Announcements & News
    └── [Toggle] Tips & Recommendations
```

### 2.3 Toast Notifications

Real-time toast that appears bottom-right when notification fires:
- Auto-dismiss after 5 seconds
- Click to navigate to relevant page
- "X" to dismiss immediately

### 2.4 Profile Menu Addition

Add "Settings" to the dropdown menu (between "Profile" and "Page Access"):
```
Profile
Settings       ← NEW
Page Access
...
```

---

## Phase 3: Notification Triggers

### 3.1 CRM Triggers (Priority A-E)

| Trigger | When | Recipient | Data |
|---------|------|-----------|------|
| **A. Customer Assigned** | Customer.userId changes | New assignee | customerId, customerName, assignedBy |
| **B. Credit App Submitted** | CreditApplication created | Assigned rep | creditAppId, customerName |
| **B. Credit App Approved** | CreditApplication.status → approved | Assigned rep | creditAppId, customerName |
| **B. Credit App Declined** | CreditApplication.status → declined | Assigned rep | creditAppId, customerName |
| **C. Follow-up Due** | Cron job checks lastContactDate | Assigned rep | customerId, customerName, daysSinceContact |
| **D. Duplicate Detected** | Customer create finds match | Original owner | customerId, duplicateName, attemptedBy |
| **E. Status Changed** | Customer.status changed by non-owner | Assigned rep | customerId, oldStatus, newStatus, changedBy |

### 3.2 System Triggers

| Trigger | When | Recipient | Data |
|---------|------|-----------|------|
| Announcement | Admin creates announcement | All users / role-based | title, message |
| Profile Tip | User profile < 50% complete | That user | tip message |
| New Feature | Feature flag enabled | All users | featureName, link |

---

## Phase 4: Email Templates

Using React Email + Resend:

1. **Customer Assigned Email**
2. **Credit App Update Email**
3. **Follow-up Reminder Email**
4. **Duplicate Alert Email**
5. **Status Change Email**
6. **Announcement Email**

---

## Customer Status Options (For Follow-up System)

```typescript
enum CustomerStatus {
  NEW = "new",                    // Just added, no contact yet
  ACTIVE = "active",              // Currently in conversation
  ACTIVE_HOT = "active_hot",      // Hot lead, high intent
  WARM = "warm",                  // Interested but not urgent
  COLD = "cold",                  // Not ready, check back later
  FOLLOW_UP = "follow_up",        // Scheduled follow-up
  NEGOTIATING = "negotiating",    // Price/terms discussion
  PENDING_CREDIT = "pending_credit", // Waiting on credit app
  APPROVED = "approved",          // Credit approved, ready to close
  DECLINED = "declined",          // Credit declined
  SOLD = "sold",                  // Deal closed!
  LOST = "lost",                  // Lost to competitor or gave up
  DO_NOT_CONTACT = "dnc",         // Requested no contact
}
```

---

## Implementation Order

### Sprint 1: Foundation (TODAY)
- [ ] Add Prisma schema (Notification, NotificationPreference)
- [ ] Create notification service (`lib/notifications.ts`)
- [ ] Build API endpoints
- [ ] Add "Settings" to profile menu

### Sprint 2: UI (NEXT)
- [ ] Notification bell component with dropdown
- [ ] Settings page with notification toggles
- [ ] Toast notification component

### Sprint 3: Triggers (THEN)
- [ ] Wire up CRM triggers (customer assigned, credit app, etc.)
- [ ] Add follow-up reminder cron job
- [ ] Duplicate detection notification

### Sprint 4: Email (FINALLY)
- [ ] Email templates
- [ ] Wire email sending to notification service

---

## Files to Create/Modify

### New Files
- `lib/notifications.ts` - Core notification service
- `components/notifications/NotificationBell.tsx` - Header bell
- `components/notifications/NotificationPanel.tsx` - Dropdown panel
- `components/notifications/NotificationToast.tsx` - Toast alerts
- `app/api/notifications/route.ts` - List/create
- `app/api/notifications/[id]/read/route.ts` - Mark read
- `app/api/notifications/unread-count/route.ts` - Badge count
- `app/api/notifications/mark-all-read/route.ts` - Bulk mark read
- `app/[lang]/user-profile/settings/notifications/page.tsx` - Settings UI

### Modified Files
- `prisma/schema.prisma` - Add models
- `components/partials/header/profile-info.tsx` - Add Settings menu item
- `components/partials/header/index.tsx` - Add NotificationBell
- `app/api/crm/customers/route.ts` - Trigger on assignment
- `app/api/credit-applications/route.ts` - Trigger on status change

---

## Questions Resolved

1. **Channels:** Both In-App + Email
2. **Priority:** A→B→C→D→E (Customer Assigned most important)
3. **Messaging:** Use existing Firebase Chat, fix glitches as we go
4. **Settings Location:** New Settings page, linked from profile menu
5. **Timing:** Instant notifications (no batching)

---

## Success Criteria

- [ ] Bell icon shows unread count
- [ ] Clicking bell shows recent notifications
- [ ] Notifications appear as toast in real-time
- [ ] Email sent for each notification (if enabled)
- [ ] User can toggle notification types on/off
- [ ] CRM actions trigger appropriate notifications
