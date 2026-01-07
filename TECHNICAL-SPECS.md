# 🛠️ TECHNICAL SPECIFICATIONS - Remotive Logistics SalesDash

**For Developers / Technical Review**
**Date:** October 10, 2025

---

## 📚 TABLE OF CONTENTS

1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Activity Tracking System](#activity-tracking-system)
7. [Alert System](#alert-system)
8. [Performance Optimization](#performance-optimization)
9. [Security Measures](#security-measures)
10. [Deployment Pipeline](#deployment-pipeline)

---

## 💻 TECH STACK

### **Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** TailwindCSS 3.x
- **UI Components:** Shadcn/ui (Radix UI primitives)
- **Icons:** Iconify
- **State Management:** React hooks (useState, useContext)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts

### **Backend:**
- **Framework:** Next.js API Routes (serverless functions)
- **Language:** TypeScript 5.x
- **Runtime:** Node.js 20.x
- **ORM:** Prisma 5.x
- **Authentication:** NextAuth.js 4.x
- **Password Hashing:** bcryptjs
- **HMAC:** Node.js crypto (built-in)

### **Database:**
- **Primary:** PostgreSQL 15 (Neon.tech)
- **Connection Pooling:** Prisma + Neon pooler
- **Migrations:** Prisma Migrate
- **Backup:** Neon automatic daily backups

### **Hosting & Infrastructure:**
- **Web Hosting:** Vercel (Edge Network)
- **Database:** Neon (Serverless Postgres)
- **CDN:** Vercel Edge Network (global)
- **Caching:** Vercel KV (Redis)
- **Email:** Resend (transactional emails)
- **Monitoring:** Vercel Analytics + Sentry

### **DevOps:**
- **Version Control:** Git + GitHub
- **CI/CD:** Vercel (auto-deploy on push)
- **Environment Variables:** Vercel Environment Variables
- **Cron Jobs:** Vercel Cron (built-in scheduler)

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌────────────────────┬──────────────────────────────┐  │
│  │  Desktop Browser   │  Mobile Browser (Responsive) │  │
│  │  (Chrome, Safari)  │  (iOS Safari, Android Chrome)│  │
│  └────────────────────┴──────────────────────────────┘  │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS (TLS 1.3)
┌───────────────────▼─────────────────────────────────────┐
│               VERCEL EDGE NETWORK                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Global CDN (300+ locations)                      │   │
│  │ - DDoS Protection (Layer 3/4/7)                  │   │
│  │ - Rate Limiting (1000 req/min per IP)           │   │
│  │ - SSL Termination (Auto-renewed)                │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│           NEXT.JS APPLICATION (Vercel)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  FRONTEND (React Server Components)             │   │
│  │  ├─ /dashboard/page.tsx (Overview)              │   │
│  │  ├─ /dashboard/team/page.tsx (Manager View)     │   │
│  │  ├─ /dashboard/team/[code]/page.tsx (Profile)   │   │
│  │  ├─ /auth/join/page.tsx (Signup)                │   │
│  │  └─ /auth/login/page.tsx (Login)                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  MIDDLEWARE (Edge Runtime)                       │   │
│  │  ├─ Activity Tracker (logs every request)       │   │
│  │  ├─ Auth Guard (role-based access control)      │   │
│  │  └─ Session Refresh (JWT validation)            │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  API ROUTES (Serverless Functions)              │   │
│  │  ├─ /api/auth/* (NextAuth handlers)             │   │
│  │  ├─ /api/join/* (Signup, validation)            │   │
│  │  ├─ /api/team/* (Team management)               │   │
│  │  ├─ /api/activity/* (Activity tracking)         │   │
│  │  └─ /api/alerts/* (Performance alerts)          │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬──────────────┬──────────────────────┘
                    │              │
        ┌───────────▼──────┐  ┌───▼────────────┐
        │  NEON POSTGRES   │  │  VERCEL KV     │
        │  (Primary DB)    │  │  (Redis Cache) │
        │  ┌────────────┐  │  │  ┌──────────┐  │
        │  │ User       │  │  │  │ Sessions │  │
        │  │ UserProfile│  │  │  │ Stats    │  │
        │  │ Team       │  │  │  │ JobQueue │  │
        │  │ Activity   │  │  │  └──────────┘  │
        │  │ Deal       │  │  │                 │
        │  └────────────┘  │  │                 │
        └──────────────────┘  └────────────────┘
                    │
        ┌───────────▼──────────────┐
        │  EXTERNAL SERVICES       │
        │  ├─ Resend (Email)       │
        │  ├─ Sentry (Monitoring)  │
        │  └─ Vercel Analytics     │
        └──────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### **Current Schema (Phase 0):**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  profile  UserProfile?
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  firstName       String?
  lastName        String?
  phone           String?
  zipcode         String?
  salespersonCode String?  @unique // REP12345, SMR12345, VIP12345
  role            String   @default("salesperson") // owner, manager, salesperson
  member          Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([role])
  @@index([salespersonCode])
}
```

### **Planned Schema (Phase 1+):**

```prisma
// Phase 1: Add Director role, Teams, Activity Tracking

model UserProfile {
  // ... existing fields ...
  role            String   @default("salesperson")
  // New values: "owner", "director", "manager", "salesperson"

  // New relations
  directorTeams   Team[]   @relation("DirectorTeams")
  managerTeams    Team[]   @relation("ManagerTeams")
  teamMemberships TeamMember[]
  activityLogs    ActivityLog[]
  stats           UserStats?
  assignedDeals   Deal[]   @relation("AssignedDeals")
  managedDeals    Deal[]   @relation("ManagedDeals")
  closedDeals     Deal[]   @relation("ClosedDeals")
  alerts          PerformanceAlert[]
}

model Team {
  id          String   @id @default(cuid())
  name        String
  directorId  String?
  managerId   String
  createdAt   DateTime @default(now())

  director    UserProfile? @relation("DirectorTeams", fields: [directorId], references: [id])
  manager     UserProfile  @relation("ManagerTeams", fields: [managerId], references: [id])
  members     TeamMember[]

  @@index([directorId])
  @@index([managerId])
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  joinedAt  DateTime @default(now())

  team      Team        @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // login, logout, page_view, lead_added, etc
  metadata    Json?    // { path: "/dashboard", leadId: "123" }
  timestamp   DateTime @default(now())

  user        UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp(sort: Desc)])
  @@index([action, timestamp(sort: Desc)])
}

model UserStats {
  id               String    @id @default(cuid())
  userId           String    @unique
  totalLogins      Int       @default(0)
  totalHoursOnline Float     @default(0)
  weeklyHours      Float     @default(0)
  leadsAdded       Int       @default(0)
  meetingsAttended Int       @default(0)
  lastLoginAt      DateTime?
  lastActiveAt     DateTime?
  weekResetAt      DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([weeklyHours])
}

model Deal {
  id              String    @id @default(cuid())
  customerName    String
  trailerModel    String
  saleAmount      Float
  status          String    @default("pending") // pending, closed, cancelled
  assignedRepId   String
  managerId       String
  closedByOwnerId String?
  notes           String?   @db.Text
  createdAt       DateTime  @default(now())
  closedAt        DateTime?

  assignedRep     UserProfile  @relation("AssignedDeals", fields: [assignedRepId], references: [id])
  manager         UserProfile  @relation("ManagedDeals", fields: [managerId], references: [id])
  closedByOwner   UserProfile? @relation("ClosedDeals", fields: [closedByOwnerId], references: [id])

  @@index([assignedRepId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

model PerformanceAlert {
  id          String   @id @default(cuid())
  userId      String
  severity    String   // yellow, red
  reason      String
  emailSent   Boolean  @default(false)
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())

  user        UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
  @@index([severity, resolvedAt])
}
```

### **Index Strategy:**

**Why indexes matter:**
- Without indexes: Query scans all rows (slow)
- With indexes: Query jumps to exact rows (fast)
- Cost: Extra storage (minimal), slower writes (negligible)

**Our index choices:**
- `@@index([userId])` - Fast user lookups (most common query)
- `@@index([userId, timestamp])` - Activity logs by user + time
- `@@index([role])` - Filter all managers/salespersons
- `@@index([salespersonCode])` - Search by employee code
- `@@index([status])` - Filter pending/closed deals

---

## 🔌 API ENDPOINTS

### **Authentication:**

```typescript
POST /api/auth/signin
// Login with credentials or OAuth
Body: { email: string, password: string } | { provider: "google" }
Response: { user: User, session: Session }

POST /api/auth/signout
// Logout and clear session
Response: { ok: true }

GET /api/auth/session
// Get current session
Response: { user: User } | null
```

### **Signup & Onboarding:**

```typescript
POST /api/join/validate
// Validate join code
Body: { code: string } // "732B4A"
Response: { ok: true, role: "salesperson" }

POST /api/join/register
// Create new account
Body: {
  firstName: string,
  lastName: string,
  phone: string,
  zipcode: string,
  email: string,
  password: string
}
Response: { ok: true, userId: string, verificationUrl: string }

GET /api/auth/verify?token=abc123
// Verify email address
Response: Redirect to /auth/login?verified=true

POST /api/auth/resend-verification
// Resend verification email
Body: { email: string }
Response: { ok: true, message: string }
```

### **Team Management:**

```typescript
GET /api/team
// Get team members (filtered by role)
Query: ?role=salesperson&status=yellow&search=REP12345
Response: {
  members: UserProfile[],
  total: number,
  filters: { active: number, yellow: number, red: number }
}

GET /api/team/[employeeCode]
// Get individual profile
Response: {
  profile: UserProfile,
  stats: UserStats,
  activityLog: ActivityLog[],
  alerts: PerformanceAlert[]
}

PATCH /api/team/[employeeCode]
// Update team member
Body: { teamId: string, managerId: string }
Response: { ok: true }

DELETE /api/team/[employeeCode]
// Terminate employee
Response: { ok: true, deleted: true }
```

### **Activity Tracking:**

```typescript
POST /api/activity/log
// Manually log activity (for special events)
Body: {
  action: "lead_added" | "meeting_attended",
  metadata: { leadName: string, meetingId: string }
}
Response: { ok: true, logId: string }

GET /api/activity/stats
// Get aggregated stats
Query: ?userId=user_abc123&period=week
Response: {
  totalHours: number,
  leadsAdded: number,
  meetingsAttended: number,
  lastLogin: string
}
```

### **Alerts:**

```typescript
GET /api/alerts
// Get all alerts for user
Query: ?severity=red&resolved=false
Response: { alerts: PerformanceAlert[] }

POST /api/alerts/resolve
// Mark alert as resolved
Body: { alertId: string }
Response: { ok: true }

POST /api/alerts/check
// Manually trigger alert check (admin only)
Response: { checked: number, alertsCreated: number }
```

### **Deals:**

```typescript
POST /api/deals
// Create new deal (owner only)
Body: {
  customerName: string,
  trailerModel: string,
  saleAmount: number,
  assignedRepId: string,
  status: "pending" | "closed"
}
Response: { ok: true, dealId: string }

GET /api/deals
// List deals
Query: ?status=closed&assignedRepId=user_abc&limit=50
Response: { deals: Deal[], total: number }

PATCH /api/deals/[dealId]
// Update deal status
Body: { status: "closed", closedAt: string }
Response: { ok: true }
```

---

## 🔐 AUTHENTICATION FLOW

### **Signup Flow (OAuth):**

```
1. User → /auth/join
2. Validate join code → Store in cookie
3. Click "Sign up with Google"
4. Google OAuth → Callback to /api/auth/callback/google
5. Custom Adapter:
   - Creates User (emailVerified = null)
   - Generates random password (backup)
   - Creates UserProfile (member = false, role from cookie)
   - Creates VerificationToken
   - Logs verification URL to console
6. Redirect → /auth/verify-email?email=user@example.com
7. User clicks verification link
8. /api/auth/verify → Update emailVerified, member = true
9. Redirect → /auth/login?verified=true
10. User signs in → Access dashboard
```

### **Signup Flow (Email/Password):**

```
1. User → /auth/join
2. Validate join code → Store in cookie
3. Fill form + Submit
4. /api/join/register:
   - Hash password (bcrypt, 10 rounds)
   - Create User (emailVerified = null)
   - Create UserProfile (member = false)
   - Create VerificationToken
   - Send email (or log URL)
5. Redirect → /auth/verify-email?email=user@example.com
6. User clicks verification link
7. /api/auth/verify → Update emailVerified, member = true
8. Redirect → /auth/login?verified=true
9. User signs in with email/password → Access dashboard
```

### **Login Flow:**

```
1. User → /auth/login
2. Enter credentials OR click "Sign in with Google"
3. NextAuth validates:
   - CredentialsProvider: Check password + emailVerified
   - GoogleProvider: Check if user exists
4. If emailVerified = null → Reject with error
5. If valid → Create JWT session
6. Redirect → /dashboard
```

### **Session Management:**

```
- Strategy: JWT (not database sessions)
- Token stored in: HTTP-only cookie (secure)
- Token contains: { id, email, role }
- Expiration: 30 days (configurable)
- Refresh: Automatic on each request (middleware)
```

### **Role-Based Access Control (RBAC):**

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const session = await getToken({ req });

  if (!session) {
    return redirectToLogin(req);
  }

  const userRole = session.role;
  const requestPath = req.nextUrl.pathname;

  // Check permissions
  if (requestPath.startsWith('/dashboard/team')) {
    if (userRole === 'salesperson') {
      return new Response('Forbidden', { status: 403 });
    }
  }

  if (requestPath.startsWith('/api/deals')) {
    if (userRole !== 'owner') {
      return new Response('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}
```

---

## 📊 ACTIVITY TRACKING SYSTEM

### **Middleware Implementation:**

```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function middleware(req: NextRequest) {
  const session = await getToken({ req });

  if (session?.id) {
    // Log activity asynchronously (don't block request)
    logActivity({
      userId: session.id,
      action: 'page_view',
      metadata: {
        path: req.nextUrl.pathname,
        userAgent: req.headers.get('user-agent'),
        ip: req.ip
      }
    }).catch(console.error);

    // Update last active timestamp
    updateLastActive(session.id).catch(console.error);
  }

  return NextResponse.next();
}

async function logActivity(data: ActivityLogInput) {
  await prisma.activityLog.create({ data });
}

async function updateLastActive(userId: string) {
  await prisma.userStats.upsert({
    where: { userId },
    update: { lastActiveAt: new Date() },
    create: {
      userId,
      lastActiveAt: new Date(),
      lastLoginAt: new Date()
    }
  });
}
```

### **Session Time Calculation:**

```typescript
// Calculate hours online when user logs out
export async function calculateSessionTime(userId: string) {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    select: { lastLoginAt: true, lastActiveAt: true }
  });

  if (!stats.lastLoginAt) return 0;

  const loginTime = stats.lastLoginAt.getTime();
  const logoutTime = stats.lastActiveAt.getTime();
  const sessionMs = logoutTime - loginTime;
  const sessionHours = sessionMs / (1000 * 60 * 60);

  // Update total hours
  await prisma.userStats.update({
    where: { userId },
    data: {
      totalHoursOnline: { increment: sessionHours },
      weeklyHours: { increment: sessionHours }
    }
  });

  return sessionHours;
}
```

### **Tracked Events:**

| Event | Trigger | Metadata |
|-------|---------|----------|
| `login` | /api/auth/signin success | { provider: "google" \| "credentials" } |
| `logout` | /api/auth/signout | { sessionDuration: number } |
| `page_view` | Every page load (middleware) | { path: string, userAgent: string } |
| `lead_added` | CRM form submission | { leadName: string, leadValue: number } |
| `meeting_attended` | Calendar event marked complete | { meetingId: string, duration: number } |
| `deal_closed` | Owner inputs closed sale | { dealId: string, amount: number } |
| `idle_timeout` | 15 min of no activity | { lastPath: string } |

---

## 🚨 ALERT SYSTEM

### **Cron Job Configuration:**

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-performance",
      "schedule": "0 * * * *" // Every hour
    },
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 8 * * 1" // Monday 8 AM
    },
    {
      "path": "/api/cron/reset-weekly-stats",
      "schedule": "0 0 * * 0" // Sunday midnight
    }
  ]
}
```

### **Alert Logic:**

```typescript
// app/api/cron/check-performance/route.ts
export async function GET(req: Request) {
  // Verify cron secret (security)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all active salespeople
  const users = await prisma.userProfile.findMany({
    where: {
      role: 'salesperson',
      member: true
    },
    include: { stats: true }
  });

  let alertsCreated = 0;

  for (const user of users) {
    const stats = user.stats;
    if (!stats) continue;

    // Check 1: Weekly hours < 10
    if (stats.weeklyHours < 10) {
      await createAlert(user.id, 'yellow', 'Low hours this week');
      await sendWarningEmail(user, 'yellow');
      alertsCreated++;
    }

    // Check 2: No login for 3+ days
    const daysSinceLogin = getDaysSince(stats.lastLoginAt);
    if (daysSinceLogin >= 3) {
      await createAlert(user.id, 'red', 'No login for 3+ days');
      await sendWarningEmail(user, 'red');
      await notifyManager(user, 'red');
      alertsCreated++;
    }

    // Check 3: Leads < 5 this week
    if (stats.leadsAdded < 5) {
      await createAlert(user.id, 'yellow', 'Low lead count this week');
      alertsCreated++;
    }
  }

  return Response.json({
    ok: true,
    usersChecked: users.length,
    alertsCreated
  });
}

async function createAlert(userId: string, severity: string, reason: string) {
  await prisma.performanceAlert.create({
    data: { userId, severity, reason }
  });
}

async function sendWarningEmail(user: UserProfile, severity: string) {
  const template = severity === 'red' ? 'critical-alert' : 'warning-alert';

  await resend.emails.send({
    from: 'alerts@salesdash.io',
    to: user.email,
    subject: severity === 'red' ? '🚨 URGENT: Account Review' : '⚠️ Performance Warning',
    html: renderTemplate(template, { user, severity })
  });
}

async function notifyManager(user: UserProfile, severity: string) {
  // Get user's manager
  const teamMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: {
      team: {
        include: { manager: true }
      }
    }
  });

  if (!teamMembership) return;

  const manager = teamMembership.team.manager;

  await resend.emails.send({
    from: 'alerts@salesdash.io',
    to: manager.email,
    subject: `🚨 Alert: ${user.firstName} ${user.lastName} (${user.salespersonCode})`,
    html: `
      <p>Your team member has been flagged for critical low activity:</p>
      <ul>
        <li>Name: ${user.firstName} ${user.lastName}</li>
        <li>Code: ${user.salespersonCode}</li>
        <li>Issue: No login for 3+ days</li>
      </ul>
      <p>Please reach out immediately.</p>
      <a href="https://salesdash.io/dashboard/team/${user.salespersonCode}">View Profile</a>
    `
  });
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **1. Database Query Optimization:**

**Bad (N+1 Query Problem):**
```typescript
// This fetches users, then makes 100 separate queries for stats
const users = await prisma.userProfile.findMany();
for (const user of users) {
  const stats = await prisma.userStats.findUnique({
    where: { userId: user.id }
  });
}
// Result: 101 queries (1 + 100)
```

**Good (Single Query with Include):**
```typescript
const users = await prisma.userProfile.findMany({
  include: { stats: true }
});
// Result: 1 query
```

### **2. Caching Strategy:**

```typescript
import { kv } from '@vercel/kv';

// Cache team stats for 5 minutes
export async function getTeamStats(teamId: string) {
  const cacheKey = `team:${teamId}:stats`;

  // Try cache first
  const cached = await kv.get(cacheKey);
  if (cached) return cached;

  // Cache miss, fetch from DB
  const stats = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        include: { stats: true }
      }
    }
  });

  // Aggregate stats
  const aggregated = {
    totalHours: stats.reduce((sum, m) => sum + m.user.stats.weeklyHours, 0),
    avgHours: aggregated.totalHours / stats.length,
    topPerformer: stats.sort((a, b) => b.user.stats.weeklyHours - a.user.stats.weeklyHours)[0]
  };

  // Store in cache for 5 minutes
  await kv.set(cacheKey, aggregated, { ex: 300 });

  return aggregated;
}
```

### **3. Pagination:**

```typescript
// Don't load all 1,000 employees at once
export async function getTeamMembers(page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.userProfile.findMany({
      skip,
      take: limit,
      include: { stats: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.userProfile.count()
  ]);

  return {
    members,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
}
```

### **4. Database Connection Pooling:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why this works:**
- In development, Next.js hot-reloads, creating new Prisma instances
- Without this, you hit "Too many connections" error
- In production, single instance shared across serverless functions

### **5. React Performance:**

```typescript
// Use React.memo for expensive components
const EmployeeCard = React.memo(({ employee }) => {
  return <div>...</div>;
}, (prevProps, nextProps) => {
  return prevProps.employee.id === nextProps.employee.id;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

// Use useMemo for expensive calculations
const sortedEmployees = useMemo(() => {
  return employees.sort((a, b) =>
    b.stats.weeklyHours - a.stats.weeklyHours
  );
}, [employees]);
```

---

## 🔒 SECURITY MEASURES

### **1. SQL Injection Prevention:**

**Prisma protects automatically:**
```typescript
// Safe - Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { email: userInput } // Even if userInput = "admin' OR '1'='1", it's safe
});
```

### **2. XSS Prevention:**

**React escapes by default:**
```tsx
// Safe - React auto-escapes
<div>{userInput}</div>

// Unsafe - bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### **3. CSRF Protection:**

**NextAuth handles automatically:**
```typescript
// All POST requests require CSRF token
// Token stored in HTTP-only cookie
// Verified on every request
```

### **4. Rate Limiting:**

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}
```

### **5. Environment Variables:**

**Never commit secrets:**
```bash
# .env.local (gitignored)
AUTH_SECRET="NOz4QIw59HJOtSl6ZJ2pxeg6PLifH4k+j91YxBTayF8="
DATABASE_URL="postgresql://..."
AUTH_GOOGLE_SECRET="GOCSPX-..."

# vercel.json (committed, no secrets)
{
  "env": {
    "AUTH_SECRET": "@auth-secret",
    "DATABASE_URL": "@database-url"
  }
}
```

**Use Vercel Environment Variables UI:**
- Production secrets stored encrypted
- Preview/Development can use different values
- Rotated without code changes

### **6. Password Hashing:**

```typescript
import bcrypt from 'bcryptjs';

// Hash on signup
const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

// Verify on login
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Why 10 rounds?**
- 1 round: Instant (insecure)
- 10 rounds: ~100ms (secure, not slow)
- 15 rounds: ~3 seconds (too slow)

---

## 🚀 DEPLOYMENT PIPELINE

### **Git Workflow:**

```
main branch (production)
├── Deploys to: salesdash-ts.vercel.app
├── Auto-deploy on push
└── Protected (requires review)

feature branches
├── Deploys to: salesdash-ts-git-feature-name.vercel.app
├── Preview deployments (isolated)
└── Deleted after merge
```

### **Deployment Process:**

```bash
# 1. Local development
npm run dev

# 2. Make changes
git add .
git commit -m "feat: add team dashboard"

# 3. Push to GitHub
git push

# 4. Vercel auto-deploys
# - Installs dependencies
# - Runs Prisma migrations
# - Builds Next.js
# - Deploys to Edge Network
# - Takes ~2 minutes

# 5. Check deployment
# Production: https://salesdash-ts.vercel.app
# Or specific deployment: https://salesdash-abc123.vercel.app
```

### **Database Migrations:**

```bash
# 1. Create migration
npx prisma migrate dev --name add_director_role

# 2. Generates SQL
# prisma/migrations/20251010_add_director_role/migration.sql

# 3. Apply to production
npx prisma migrate deploy
# Or: Vercel auto-runs on deploy
```

### **Environment Variables:**

```bash
# Local (.env.local)
AUTH_SECRET="local-dev-secret"

# Vercel Production
vercel env add AUTH_SECRET production
> Enter value: NOz4QIw59HJOtSl6ZJ2pxeg6PLifH4k+j91YxBTayF8=

# View all variables
vercel env ls
```

### **Rollback Process:**

```bash
# If deployment breaks, rollback to previous version
vercel rollback

# Or redeploy specific commit
git checkout abc123
git push --force
```

---

## 📝 CODING STANDARDS

### **TypeScript:**

```typescript
// Use strict types
type UserRole = 'owner' | 'director' | 'manager' | 'salesperson';

interface ActivityLogInput {
  userId: string;
  action: string;
  metadata?: Record<string, any>;
}

// Avoid 'any', use 'unknown' if needed
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}
```

### **Error Handling:**

```typescript
// API routes - always return JSON
export async function GET(req: Request) {
  try {
    const data = await fetchData();
    return Response.json({ ok: true, data });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { ok: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### **Naming Conventions:**

```typescript
// Files: kebab-case
team-dashboard.tsx
user-stats.ts

// Components: PascalCase
function TeamDashboard() {}

// Functions: camelCase
function getUserStats() {}

// Constants: UPPER_SNAKE_CASE
const MAX_EMPLOYEES = 1000;

// Database tables: PascalCase
model UserProfile {}
```

---

**Questions? Open an issue on GitHub or contact the team!**

Last Updated: October 10, 2025
Version: 1.0
