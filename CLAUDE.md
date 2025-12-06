# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Remotive Logistics** is a comprehensive sales management system for trailer dealerships built on Next.js 14 with TypeScript, Prisma ORM, PostgreSQL (Neon), NextAuth.js, and Firebase. Built on the DashTail template with custom CRM features for remote trailer sales reps.

**Company Location:** Haverstraw, NY 10927
**Live Site:** [Domain TBD]
**Repository:** https://github.com/kencestero/salesdash-ts

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript
- PostgreSQL (Neon) + Prisma ORM (generated client at `lib/generated/prisma`)
- NextAuth.js v4 (JWT sessions with credentials + Google/GitHub OAuth)
- Firebase Firestore (real-time chat)
- TailwindCSS + Radix UI (shadcn/ui components)
- React Email + Resend (transactional emails)

**Branding:** Dark mode with #E96114 (orange) + #09213C (dark blue) color scheme.

**Email Configuration:** All system emails sent from `noreply@remotivelogistics.com` via Resend API.

**Credit Application Domain:** Rep code links point to credit application portal (configurable).

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build (includes prisma generate)
pnpm typecheck              # TypeScript validation without build
pnpm start                  # Start production server

# Database
npx prisma db push              # Sync schema to database (reads from .env)
npx prisma db push --accept-data-loss  # Force sync (drops data)
npx prisma generate             # Generate Prisma client
pnpm prisma studio              # Open database GUI (localhost:5555)

# Deployment
vercel                      # Deploy preview
vercel --prod               # Deploy to production (DO NOT use run_in_background)
vercel env add <VAR_NAME>   # Add environment variable
vercel ls                   # List deployments
```

**Critical Notes:**
- DATABASE_URL must be in `.env` file - Prisma reads from environment
- Prisma client generates to `lib/generated/prisma` (custom output location)
- `pnpm build` auto-runs `prisma generate` via postinstall script
- **Never** run `vercel --prod` with `run_in_background: true` - causes bash spam issues

## Architecture & Code Patterns

### Directory Structure

```
app/
├── [lang]/                          # Internationalized routing (default: "en")
│   ├── (dashboard)/                 # Protected routes (auth required)
│   │   ├── (home)/dashboard/       # Main dashboard variants
│   │   ├── (apps)/                 # Applications (chat, email, calendar, CRM)
│   │   ├── (components)/           # UI component demos
│   │   └── (admin)/                # Admin-only pages (owners/directors)
│   ├── auth/                       # Login, signup, verification
│   └── layout.tsx                  # Root providers (Auth, Theme, i18n)
├── api/                            # API routes
│   ├── auth/                       # NextAuth endpoints + verification
│   ├── admin/                      # Admin-only APIs (role-protected)
│   ├── crm/                        # CRM operations (customers, activities)
│   ├── calendars/                  # Calendar events
│   ├── credit-applications/        # Credit app submissions
│   └── user/                       # User profile operations
├── credit-application/[repCode]/   # Public credit app (no auth required)
└── layout.tsx

lib/
├── auth.ts                         # NextAuth configuration
├── prisma.ts                       # Prisma client singleton
└── generated/prisma/               # Generated Prisma client (custom location)

prisma/
└── schema.prisma                   # Database schema

config/
└── menus.ts                        # Sidebar navigation (3000+ lines)
```

### Server/Client Component Pattern

**Pattern:** `page.tsx` (server) → `page-view.tsx` (client)

```typescript
// page.tsx (Server Component)
export default async function Page() {
  const session = await getServerSession(authOptions);
  return <PageView session={session} />;
}

// page-view.tsx (Client Component)
"use client";
export default function PageView({ session }) {
  // Client-side logic, hooks, state
}
```

### Prisma Import Pattern

**Critical:** Always use the correct import path:

```typescript
// ✅ CORRECT
import { prisma } from "@/lib/prisma";

// ❌ WRONG - DO NOT USE
import prisma from "@/lib/generated/prisma";
```

The Prisma client is exported as a singleton from `lib/prisma.ts`.

### Authentication & Sessions

**Session Validation:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**User Profile Lookup with Role:**
```typescript
const currentUser = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: { profile: true },
});

// Check role
if (!["owner", "director"].includes(currentUser.profile.role)) {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
```

**Session Strategy:** JWT-based (not database sessions). User ID and email stored in JWT token.

## Database Schema (Key Models)

### User & Authentication
- **User** - NextAuth user with email/password + OAuth support
- **Account** - OAuth provider accounts (Google, GitHub)
- **Session** - User sessions (JWT strategy)
- **VerificationToken** - Email verification tokens
- **PendingUser** - Users awaiting email verification (includes managerId, role, status)

### User Management & Organization
- **UserProfile** - Extended user data with:
  - `repCode` - Unique rep code (e.g., "REP482756", "REP000000" for freelancers)
  - `managerId` - Links to manager's User.id
  - `status` - "employee" or "freelancer"
  - `role` - "owner", "director", "manager", "salesperson"
  - `accountStatus` - "active", "banned", "timeout", "muted"
  - `isAvailableAsManager` - Controls visibility in signup manager dropdown (dynamic system)
  - `isActive` - Soft delete flag for user suspension/removal
  - **Granular Permissions**: `canAccessCRM`, `canAccessInventory`, `canAccessConfigurator`, `canAccessCalendar`, `canAccessReports`, `canManageUsers`

### CRM & Sales
- **Customer** - CRM contacts with lead tracking, financing info, assigned rep
- **Deal** - Sales opportunities with pricing, financing, status tracking
- **Trailer** - Inventory items (VIN, specs, pricing, images, status)
- **CreditApplication** - Credit apps with e-signature, can be submitted via public rep-tracked links
- **Activity** - Customer interaction logs (call, email, meeting, note, task)

### Finance & Quotes
- **Quote** - Finance quotes (Cash/Finance/RTO modes) with sharing tokens
- **QuoteActivity** - Tracking for quote views, edits, PDF downloads
- **PricingPolicy** - System-wide pricing defaults (RTO markup, APR, fees)

### Communication & Calendar
- **Email** - Email logs and templates
- **EmailTemplate** - Reusable email templates with variables
- **CalendarEvent** - Personal and company-wide events with role-based visibility

### Inventory & Uploads
- **UploadReport** - Tracks inventory uploads (manufacturer bulk imports)
- **Trailer** - Inventory with automatic pricing formula: Cost × 1.015 OR Cost + $2,000 (minimum $2,000 profit)
- **Bulk Import API** - `/api/inventory/bulk-import` accepts trailer data and auto-calculates prices

## Rep Tracking System

**Rep Code Format:**
- Employees: `REP` + 6 random digits (e.g., "REP482756")
- Freelancers: "REP000000" (hardcoded)
- Generated during email verification in `/api/auth/verify`

**Rep Code Flow:**
1. User signs up → selects manager or checks "Freelancer"
2. Email verification → rep code generated and assigned to UserProfile
3. Rep shares public link: `/credit-application/[repCode]`
4. Customer submits credit app → automatically assigned to rep's userId

**Rep Code Access Points:**
- Dashboard: [RepCodeCard](app/[lang]/(dashboard)/(home)/dashboard/components/rep-code-card.tsx) component
- User Profile: RepCodeInfo component
- Public credit app: Rep validation banner

## OAuth Signup Flow (Google/GitHub)

**Critical Implementation Details:**

1. **Join Code Validation** - OAuth signups require valid join code in cookies:
   - Cookie: `join_ok` must be "true"
   - Cookie: `join_role` contains role (default: "salesperson")
   - Cookies set by `/api/join/validate` endpoint during signup form submission

2. **SignIn Callback Logic** ([lib/auth.ts](lib/auth.ts)):
   ```typescript
   // Existing user → Allow login
   if (existingUser) return true;

   // New user WITHOUT join code → Block signup
   if (!joinCodeValid) return false;

   // New user WITH join code → Create account
   // Creates User + UserProfile + Account records
   ```

3. **New Field: `needsJoinCode`**:
   - Added to `UserProfile` schema (default: false)
   - If OAuth user created without join code, set to true
   - Middleware checks this flag and redirects to `/auth/complete-signup`

4. **Manager Selection**:
   - Both email and OAuth signup paths include manager dropdown
   - Manager data stored in cookies during signup: `signup_managerId`

**OAuth Security:**
- Blocks new users without valid join code (prevents unauthorized signups)
- Existing users can always login (no join code required)
- Session uses JWT strategy, not database sessions

## Dynamic Manager System

**Manager Assignment:**
- Managers are dynamically loaded from database during signup
- Controlled via `isAvailableAsManager` flag in UserProfile
- Only users with role "owner", "director", or "manager" can be assigned as managers
- Fallback to hardcoded list (7 managers) if no managers are marked as available

**Manager Selection API:**
- `/api/managers/available` (GET, public) - Returns list of available managers for signup
- `/api/admin/users/[id]/toggle-manager` (PATCH, admin-only) - Toggle manager availability

**Signup Page Implementation:**
- Hybrid approach: tries dynamic fetch first, falls back to hardcoded list
- Shows role in parentheses: "Kenneth Cestero (owner)"
- Includes "I DON'T KNOW YET" rainbow checkbox for freelancers
- Manager dropdown available for both email and social (Google/GitHub) signup paths

## Role-Based Access Control

**Role Hierarchy (highest to lowest):**
1. **Owner** - Full system access, user management, company announcements
2. **Director** - User management, company announcements
3. **Manager** - Company announcements, assigned rep oversight
4. **Salesperson** - Standard rep access

**Permission Patterns:**

```typescript
// Admin-only endpoint (owners/directors)
if (!["owner", "director"].includes(currentUser.profile.role)) {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}

// Company announcement creation (owners/managers)
if (!["owner", "manager"].includes(currentUser.profile.role)) {
  return NextResponse.json({ error: "Only owners and managers can create company announcements" }, { status: 403 });
}
```

**Granular Permissions:** Check UserProfile permission flags:
- `canAccessCRM` - Customer management
- `canAccessInventory` - View trailers
- `canAccessConfigurator` - Finance calculator
- `canAccessCalendar` - Calendar access
- `canAccessReports` - Analytics/reports
- `canManageUsers` - User management dashboard

## Critical API Patterns

### Protected API Route Template
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  // Add role checks as needed
  // ... business logic

  return NextResponse.json({ data });
}
```

### Public API Route (No Auth)
```typescript
// For public credit applications, rep validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  // No authentication required
  // ... business logic
  return NextResponse.json({ success: true });
}
```

### Dynamic Route Param Access
```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // Use id for database queries
}
```

## Component Patterns

### shadcn/ui Components
Located in `components/ui/`. Use these instead of creating new base components:
- Dialog, AlertDialog - Modals and confirmations
- Select, Input, Button, Badge - Form controls
- Card, CardContent, CardHeader - Containers
- Tabs, TabsList, TabsContent - Tabbed interfaces
- Switch - Toggle controls
- Toast (via `use-toast` hook) - Notifications

### Toast Notifications
```typescript
import { toast } from "@/components/ui/use-toast";

toast({
  title: "Success",
  description: "Operation completed successfully",
});

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});
```

### Dialog Pattern with High z-index
```typescript
// For dialogs with Select components, use high z-index
<SelectContent className="z-[9999]">
  <SelectItem value="option1">Option 1</SelectItem>
</SelectContent>
```

## State Management

**Zustand Stores** (`store/index.ts`):
- Theme configuration (layout variants, sidebar state)
- Sidebar collapse state
- Layout types (vertical, horizontal, semibox)
- Persisted to localStorage

**No Global User State:** Fetch user profile as needed via `/api/user/profile`.

## Cron Jobs & Automation

**Vercel Cron Configuration:** [vercel.json](vercel.json)

**Google Sheets CRM Auto-Sync:**
- **Schedule:** Daily at 8:00 AM UTC (Vercel Hobby plan limitation)
- **Endpoint:** `/api/cron/sync-google-sheets`
- **Function:** Syncs leads from Google Sheets to Remotive CRM
- **Features:**
  - Maps all 20 columns (A-T) from Google Sheets
  - Detects new vs existing leads by phone/email
  - Updates manager notes, rep notes, status changes
  - Full duplicate prevention
  - Auto-assigns to sales reps

**Important:** Vercel Hobby plan only allows daily cron jobs. Hourly schedule `0 * * * *` will fail. Use `0 8 * * *` for daily at 8am.

## Inventory Management

**Bulk Import API:** `/api/inventory/bulk-import`

**Features:**
- API key authentication: `INVENTORY_API_KEY` env var
- Accepts 405 trailers from Diamond, Quality, Panther Cargo
- Auto-detects duplicates by VIN
- Updates prices if cost changed

**Pricing Formula (Kenneth's Formula):**
```
Price = MAX(Cost × 1.015, Cost + $2,000)
Minimum profit: $2,000
```

**Example:**
- Cost: $5,000 → Price: $7,000 (adds $2,000)
- Cost: $150,000 → Price: $152,250 (1.50% markup)

## Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-auth-secret-here

# OAuth (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Firebase (for Chat)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=Remotive Logistics <noreply@remotivelogistics.com>
# Note: Quotes around email are optional - auto-stripped if present

# Inventory System (Optional)
INVENTORY_API_KEY=your-api-key-here  # For bulk import endpoint

# Google Sheets Integration (Optional)
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

## Common Tasks

### Adding a New Protected Page
1. Create in `app/[lang]/(dashboard)/your-page/`
2. Create `page.tsx` (server component) and `page-view.tsx` (client component)
3. Add to `config/menus.ts` in appropriate section
4. Add authentication check in page.tsx
5. Add role-based protection if needed

### Adding a New API Endpoint
1. Create in `app/api/your-endpoint/route.ts`
2. Add authentication with `getServerSession(authOptions)`
3. Add role-based checks if needed
4. Use `{ prisma } from "@/lib/prisma"` import
5. Return `NextResponse.json()` responses

### Updating Database Schema
1. Edit `prisma/schema.prisma`
2. Run `DATABASE_URL="..." npx prisma db push` (or `--accept-data-loss` if needed)
3. Run `DATABASE_URL="..." npx prisma generate` to regenerate client
4. Update TypeScript interfaces if needed

### Creating a New User Role
1. Update `UserProfile.role` enum in schema
2. Add role to permission checks in API routes
3. Update role colors in components (if displaying badges)
4. Add to sidebar menu permissions if needed

## Important Files Reference

**Authentication:**
- `lib/auth.ts` - NextAuth configuration with Google/GitHub OAuth + credentials
- `app/api/auth/verify/route.ts` - Email verification + rep code generation
- `middleware.ts` - Route protection and i18n routing

**User Management:**
- `app/api/admin/users/route.ts` - User CRUD (GET all, PATCH update, DELETE remove)
- `app/[lang]/(dashboard)/(admin)/user-management/page.tsx` - Admin UI

**CRM System:**
- `app/api/crm/customers/route.ts` - Customer list/create
- `app/api/crm/customers/[id]/route.ts` - Individual customer CRUD
- `app/api/crm/activities/route.ts` - Activity logging
- `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx` - Customer profile UI

**Rep Tracking:**
- `app/api/validate-rep/[repCode]/route.ts` - Public rep validation
- `app/credit-application/[repCode]/page.tsx` - Public credit app with rep tracking
- `app/[lang]/(dashboard)/(home)/dashboard/components/rep-code-card.tsx` - Dashboard rep card

**Manager System:**
- `app/api/managers/available/route.ts` - Public endpoint for manager dropdown
- `app/api/admin/users/[id]/toggle-manager/route.ts` - Toggle manager availability (admin-only)
- `app/[lang]/auth/join/page.tsx` - Signup page with dynamic manager fetch

**Calendar:**
- `app/api/calendars/route.ts` - Calendar events CRUD
- `app/api/calendars/[id]/route.ts` - Individual event operations

**Navigation:**
- `config/menus.ts` - Sidebar menu structure (3000+ lines, defines all navigation)

## Middleware & Route Protection

**Key File:** [middleware.ts](middleware.ts)

**Route Protection Levels:**
1. **Public Routes** - No auth required:
   - `/apply/*` - Credit applications
   - `/demo-*` - Demo pages
   - `/playground` - Testing playground
   - `/_next/*` - Static assets

2. **Auth Routes** - `/[lang]/auth/*`:
   - Login, signup, verify-email, complete-signup
   - Accessible without session

3. **Protected Routes** - `/[lang]/(dashboard)/*`:
   - Requires valid session token (JWT cookie)
   - Redirects to `/en/login` if no session

4. **Complete Signup Check**:
   - Middleware calls `/api/auth/check-status`
   - If `needsJoinCode` is true → redirect to `/auth/complete-signup`
   - Prevents OAuth users without join code from accessing dashboard

**Session Detection:**
- Checks cookies: `next-auth.session-token` (HTTP) or `__Secure-next-auth.session-token` (HTTPS)
- JWT-based sessions (not database sessions)

**Language Routing:**
- Auto-adds `/en` prefix if missing (except `/apply` routes)
- Default locale: "en"

## Known Issues & Gotchas

1. **Prisma Import:** Always use `import { prisma } from "@/lib/prisma"`, never from generated folder directly
2. **Z-index Conflicts:** Select components in Dialogs need `className="z-[9999]"`
3. **Sidebar Visibility:** Sidebar links visible to all users, but pages may have role-based protection
4. **Rep Code Generation:** Only happens during email verification, not during initial signup
5. **Freelancer Rep Code:** Always "REP000000" (hardcoded, not random)
6. **Manager List:** Uses hybrid approach - dynamic fetch with hardcoded fallback (7 managers) until real managers sign up
7. **Email Environment Variable:** If `RESEND_FROM_EMAIL` has quotes, they're auto-stripped by the email service
8. **OAuth Signup Security:** New users blocked without valid join code (existing users can always login)
9. **Vercel Deployment:** Never use `run_in_background: true` for `vercel --prod` - causes infinite bash output spam
10. **Session Timeout:** 30-minute inactivity timer (mousedown, keydown, scroll, touchstart) - see `SessionTimeout` component

## Recent Fixes (2025-01-21)

**OAuth Crash Fix:**
- Added `needsJoinCode` Boolean field to `UserProfile` schema
- Fixes crash when OAuth users sign up without join code
- Deployed to production ✅

**Security Improvements:**
- Block OAuth signup without valid join code
- Complete signup handler for OAuth users missing join code
- Session timeout component (30 min inactivity)

**UI Updates:**
- Rep code card: 75% smaller, theme colors, portal links
- Manager dropdown on social signup paths
- Cookie settings for localhost development

## Testing Checklist for Changes

When making changes, verify:
- [ ] Authentication works (session checks)
- [ ] Role-based permissions enforced
- [ ] Prisma queries use correct import (`@/lib/prisma`)
- [ ] Toast notifications appear on success/error
- [ ] Forms validate before submission
- [ ] Loading states shown during async operations
- [ ] Error boundaries catch failures gracefully
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Database migrations run successfully (`npx prisma db push`)
- [ ] OAuth signup flow works (test with Google/GitHub)
- [ ] Manager dropdown loads correctly on signup

## Troubleshooting

### Database Issues
```bash
# Error: "PrismaClient is unable to run in this browser environment"
# Fix: Check you're using server-side import only
import { prisma } from "@/lib/prisma";  # ✅ Correct

# Error: "Can't reach database server at..."
# Fix: Check DATABASE_URL in .env file
echo $DATABASE_URL  # Should show PostgreSQL connection string

# Error: "Unknown argument 'field_name'"
# Fix: Schema changed, regenerate Prisma client
npx prisma generate
```

### OAuth Issues
```bash
# Error: OAuth signup creates user but crashes
# Fix: Added needsJoinCode field to schema (fixed 2025-01-21)

# Error: "Configuration: Please use a valid OAuth provider"
# Fix: Check AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env

# Error: OAuth user redirects to complete-signup page
# Reason: User signed up without join code - by design
```

### Deployment Issues
```bash
# Vercel deployment stuck on "Completing..."
# Fix: Don't use run_in_background with vercel commands

# Cron job failing: "Deployment contains Cron Jobs that exceed your plan limit"
# Fix: Vercel Hobby only allows daily cron (not hourly)
# Change: 0 * * * * → 0 8 * * * (daily at 8am)

# Environment variable not working
vercel env ls  # List all env vars
vercel env add VAR_NAME  # Add new env var
```

### Build Issues
```bash
# Error: "Module not found: Can't resolve '@/lib/generated/prisma'"
# Fix: Run prisma generate
npx prisma generate

# Error: Type error in build
pnpm typecheck  # Check TypeScript errors first
```

## Additional Documentation

**Detailed References:**
- [README.md](README.md) - Setup instructions, features overview, deployment guide
- `.github/copilot-instructions.md` - Development patterns and constraints
- Documentation files (check root directory):
  - `GOOGLE-SHEETS-AUTO-SYNC-SETUP.md` - Google Sheets integration
  - `INVENTORY-EMAIL-EXTRACTION-GUIDE.md` - Gmail extraction setup
  - `PYTHON-INVENTORY-INTEGRATION.md` - Python inventory scripts
  - `DASHTAIL-SETUP-GUIDE.md` - DashTail template docs
  - `docs/DYNAMIC_MANAGER_SYSTEM.md` - Manager system (Phases 1-3)
  - `docs/Remotive_Rep_Ascension.md` - Rep progression system

**External Docs:**
- Next.js 14: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org
- shadcn/ui: https://ui.shadcn.com
- Vercel Cron: https://vercel.com/docs/cron-jobs

---

**Last Updated:** 2025-01-21
**Current Version:** Production (remotivelogistics.com)
**Recent Major Changes:** OAuth crash fix, needsJoinCode field, security improvements
