# MJ Cargo — Build Context (READ FIRST, EVERY SESSION)

## Business Context

**What we sell**: Enclosed cargo trailers (main), dump trailers (secondary). Primary mfrs: Diamond Cargo (Douglas, GA), Quality Cargo (Nashville, GA). We finance, RTO, and deliver.

**Org model**: Remote reps (scaling 90→300+). Commission-only. Training-heavy.

**Where we are**: Live Inventory via Google Sheet/API in progress, SalesDash (Next.js 14) on Vercel, Finance/RTO calculators WIP, Google Sites CRM knowledge hub.

**Non-negotiables**:
- Colors: `#09213C` (dark blue), `#E96114` (orange).
- Env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (use these exact names).
- Auth: NextAuth v5, Google OAuth, join-code gating.
- DB: Prisma + Postgres (Neon).
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui.
- Design: mobile-first, clean, obvious, no fluff.

## Sales Process (short)

1. Lead captured (form/chat/phone/FB).
2. Rep runs Finance or RTO quote (tax by ZIP, doc/title fees).
3. VIN match (if available) → auto-fill price/specs; price range: rep can set +100% / -30% vs listed.
4. Send quote PDF/SMS, follow-ups.
5. Close → delivery scheduled → audit trail saved.

## Pain Points (now)

- Reps need hand-holding; too much manual data entry.
- Quote tax/fees by ZIP is slow; inconsistent pricing rules.
- Inventory/VIN linkage not always present.
- No clean analytics on rep performance or quote→sale funnel.

## Goals (next 60–90 days)

1. Close deals faster (one-screen quote flow, fewer clicks).
2. Reduce manual entry (VIN→auto-fill, ZIP→tax autofill).
3. Better lead→quote→sale tracking (events + audit log).
4. Automate guardrails (pricing limits, expired quotes, cleanup job).
5. Simple training UI (novice-friendly, zero guesswork).

## Tech Preferences

**Love**: Server Actions, Prisma, Zod validation, file-based routing, Tailwind, shadcn.

**Avoid**: Over-engineering, breaking auth, style frameworks that fight Tailwind.

## Performance Priorities

- Mobile-first (reps on phones).
- Snappy first interaction (<2s TTFB on key routes).
- Resilient offline-ish draft state for quotes (localStorage ok).

## Must-Track Metrics (show in Manager Dashboard)

- Quote→Sale conversion %
- Time to first response (lead timestamp → rep touch)
- Avg gross profit / unit
- Quotes created per rep / day
- % quotes linked to a VIN
- Time from "accepted quote" → "delivered"
- Auto-expired quotes count (90-day rule)

## Data Model (core, don't rename)

**User**: `id`, `role` (OWNER/MANAGER/REP), `specialNumber` (rep ID), `email`, `image`

**Quote**: `id`, `repId`, customer (`name`/`email`/`phone`), `zip`/`city`/`state`, `taxRate`, `price`, `down`, `APR`, `term`, doc/title fees, optional `vin`, `status` (draft/sent/accepted/expired), `expiresAt`

**QuoteEvent**: `id`, `quoteId`, `type` (CREATED/SENT/VIEWED/ACCEPTED/EXPIRED/UPDATED), `payload` (JSON), `createdAt`

**Inventory**: `vin`, `priceListed`, spec bundle (size, metal .080, colors: B black, CG charcoal gray, etc.), `availability`

## Rules & Automations

1. **Pricing guardrail**: Selling Price can be +100% / -30% vs listed; warn & block out-of-range.
2. **VIN Linking**: If entered VIN exists in Inventory, auto-fill and lock spec fields; allow hiding VIN on customer PDF.
3. **ZIP → Tax**: Required; fetch city/state + tax; store all three.
4. **Expiration**: Quotes auto-expire in 90 days; daily cleanup job deletes expired + writes `QuoteEvent(EXPIRED)`.
5. **Permissions**: Managers/Owners see all quotes + edit history; Reps see only theirs.

## High-ROI Features (build in this order)

1. **One-screen Quote Builder** (start with just: "Customer LastName + Rep Initials", ZIP; then price/down/APR/term; live summary + PDF).
2. **ZIP Tax Autofill** (local table first; swap to API later).
3. **VIN Auto-fill** (pull price/specs; toggle "hide VIN on PDF").
4. **Quote Events + Audit Log** (server actions emit events).
5. **Auto-Expire + Cleanup** (cron/daily route).
6. **Manager Dashboard** (5 metrics above; filter by `specialNumber`).
7. **Training Mode** (demo data + tooltips; easy toggle).

## UX Requirements (novice-friendly)

- Big inputs, plain English labels, inline validation, no dead-ends.
- Clear primary action per screen.
- Save-as-you-go; recover drafts.
- Theme: MJ Cargo colors only; consistent cards, rounded-2xl, soft shadows.

## Deliverables Definition of Done (per feature)

- Server Action + Zod schema + unit test for happy/edge paths.
- Prisma migration committed; seed updated if needed.
- UI with accessibility basics (labels, keyboard, focus).
- Telemetry event(s) emitted.
- Docs: 10-line README section w/ usage + envs.

## Envs (use exactly these)

```
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
DATABASE_URL
```

(Optional later) `ZIP_TAX_API_KEY`

## What Claude Needs From Me (to be 2–10× smarter)

1. This file pinned and read at session start.
2. Access to sample data: 5 inventory rows (with VINs), 5 quotes (various states), ZIP→tax CSV.
3. Screenshots I like and 2 competitors I hate (callouts why).
4. Known edge cases (no VIN, out-of-range pricing, missing ZIP, RTO no APR display).
5. **"3-Tasks-At-A-Time" mode**: when I say "Let's get this shit done," propose the next 3 PR-sized tasks, then execute.

## Session Bootstrap Prompt (paste into Claude settings)

Load `PROJECT.md` (above). For every session:

1. Confirm context loaded.
2. Propose the next 3 highest-ROI tasks (PR-sized), referencing the Goals/Rules.
3. Ship code with exact file paths, Prisma changes, env usage (`AUTH_*` names), and tests.
4. Never break auth or colors. Keep mobile-first.
5. Track events (`QuoteEvent`) for every user-visible state change.
