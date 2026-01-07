# PAPI CLAUDE - COMPLETE TASK LIST
**Project:** Remotive Logistics SalesDash (Next.js 14 CRM)
**Location:** c:\Users\kence\salesdash-ts
**Date:** October 22, 2025

---

## 🚨 CRITICAL BUGS TO FIX (Priority Order)

### 1. DUAL ACCOUNT ISSUE (HIGHEST PRIORITY)
**Problem:**
- Email signup creates account with rep number but NO profile
- Google OAuth creates account with profile but NO rep number
- Email verification emails not sending

**Details:**
- Test account: `HolyBikesUSA@gmail.com` has rep number but no profile
- Kenneth's uncle tried email signup → never received verification email
- Uncle then used Google OAuth → worked but missing rep number
- Kenneth's main account: Google login shows profile but NO rep number

**Fix Required:**
- Both signup methods MUST create COMPLETE accounts (profile + rep number)
- Email verification emails must send properly
- Fix verification token generation and email service
- Ensure OAuth signup also generates rep code during profile creation

**Files to check:**
- `app/api/auth/verify/route.ts` - Email verification + rep code generation
- `lib/auth.ts` - NextAuth configuration for OAuth
- `app/api/join/route.ts` - Email signup handler
- Email service configuration (Resend API)

---

### 2. CREDIT APPLICATION BROKEN
**Problem:**
- Won't load without rep number
- Even with rep number, link has extra code interrupting connection
- Must connect to Matt's Webflow site: remotivetrailers.com

**What Works:**
- ✅ Kenneth LOVES the colorful "Add to CRM" popup - KEEP THIS!

**Fix Required:**
- Fix rep code link generation
- Remove extra code interrupting remotivetrailers.com connection
- Ensure credit apps load when rep number exists
- Make sure rep tracking works end-to-end

**Files to check:**
- `app/credit-application/[repCode]/page.tsx`
- `app/api/validate-rep/[repCode]/route.ts`
- Rep code URL generation in dashboard components

---

### 3. INVENTORY PAGE BROKEN
**Problem:**
- Shows "page doesn't exist" error
- Trailers not updating since launch day
- Unclear if OpenAI agent/bulk import is working

**Location:**
- `app/[lang]/(dashboard)/(apps)/inventory/`

**Fix Required:**
- Debug why page shows error
- Check bulk import API: `/api/inventory/bulk-import`
- Verify pricing formula is working: Cost × 1.0125 OR Cost + $1,400 (min $1,400 profit)
- Check if trailers are being synced from manufacturers

---

### 4. CUSTOMER CRM NOT SYNCING
**Problem:**
- Only getting a few customers
- Not syncing from Google Sheets

**Kenneth's Request:**
- Duplicate the Google Sheets where leads currently live
- Create bridge: Form → Google Sheets → Website
- Avoid breaking Matt's existing CRM
- Just transfer/sync leads automatically

**Fix Required:**
- Set up Google Sheets API integration
- Create cron job or webhook to sync leads
- Map Google Sheets columns to Customer model
- Handle duplicates properly (by phone/email)

**Reference:**
- See existing cron job: `app/api/cron/sync-google-sheets/route.ts` (if exists)
- May need to create new sync endpoint

---

## 🎨 NEW FEATURE: LUXURY QUOTE THEME (REQUIRED!)

### Overview
Add luxury-themed quote download feature to Finance Calculator with premium styling matching Remotive Logistics branding.

### Design Requirements
**Color Scheme:**
- Primary: Orange #E96114
- Secondary: Dark Blue #09213C
- Clean white backgrounds with professional spacing

**Header Section:**
- Trophy icon + "Remotive Logistics FINANCE CALCULATOR - Luxury Configuration"
- Toggle checkboxes for: Finance Options | Lease/Rent-To-Own | Cash Purchase
- Orange background with dark blue accents

**Main Content:**
- Large "Remotive Logistics TRAILERS" header with orange background
- "FINANCE CALCULATOR" subtitle
- "Rugged Quality, Smooth Financing" tagline
- Quote date, representative name, quote number

**Customer Information:**
- Name, Phone, Email fields
- Clean card layout with dark blue headers

**Unit Details:**
- Trailer type, warranty, size info
- Professional card layout matching customer info

**Payment Options Tables:**

**Finance Options:**
- Show ALL terms: 24mo, 36mo, 48mo, 60mo, 72mo
- Columns: $0 down, $1,000 down, $2,500 down, $5,000 down
- Display monthly payment + APR for each option
- Dark header with "8.99% APR" displayed

**Lease/Rent-To-Own:**
- Terms: 24mo, 36mo, 48mo
- Same down payment columns
- Display "$19.59/mo LDW" fee
- Blue accent header

**Cash Purchase:**
- Sale Price
- Gov't / Other Fees
- Sales Tax (8.25%)
- Total Cash Due (large, bold)
- Orange header with fire icon

**Footer:**
- Authorization & Agreement section with signature lines
- Remotive Logistics Trailers branding
- "Premium Enclosed Cargo & Equipment Trailers"
- Contact info and website

### Download Options Required
- ✅ Download as HTML (full styled page)
- ✅ Download as JPEG (high quality image)
- ✅ Download as PNG (transparent background option)

### Technical Implementation

**New Components:**
```
components/finance/LuxuryQuoteTheme.tsx - Main luxury quote component
components/finance/QuoteExportButtons.tsx - Download buttons
```

**Export Utilities:**
```
lib/quote-export.ts - HTML/Image export functions using html2canvas or similar
```

**Integration:**
```
app/[lang]/(dashboard)/(apps)/finance-calculator/page.tsx - Add luxury theme option
```

**Features:**
- Use existing Quote model data structure
- Responsive design for print/digital
- High-quality PDF rendering support
- Ensure all Remotive Logistics branding matches existing theme

**Libraries to use:**
- `html2canvas` for image export
- `jsPDF` for PDF generation (optional)
- React component for HTML preview/download

---

## 🗑️ FEATURES TO HIDE (NOT DELETE!)

### Instructions
In `config/menus.ts`, HIDE these menu items by commenting out OR using `hidden: true` flag.

**DO NOT DELETE THE CODE** - just remove from sidebar navigation!

### Items to Hide:
- ❌ Quick Quote Builder (already have Finance Calculator)
- ❌ Multi-level menu
- ❌ Icons
- ❌ Maps (keep only 1 map component visible)
- ❌ Vector
- ❌ Chart
- ❌ Diagrams
- ❌ Table
- ❌ Forms
- ❌ Components
- ❌ Entire "Elements" folder/tab

### Example Implementation:
```typescript
// HIDDEN - Keep for future use
// {
//   title: "Icons",
//   icon: "heroicons:star",
//   href: "/icons"
// },

// OR if menu system supports hidden flag:
{
  title: "Icons",
  icon: "heroicons:star",
  href: "/icons",
  hidden: true
}
```

---

## 🔒 ACCESS RESTRICTIONS

### Email Templates & Invoice Pages
**Restrict access to:**
- ✅ owner
- ✅ director
- ✅ manager

**Block access for:**
- ❌ salesperson

**Implementation:**
Add role checks in page components:
```typescript
const currentUser = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: { profile: true }
});

if (!["owner", "director", "manager"].includes(currentUser.profile.role)) {
  return <Unauthorized />;
}
```

**Pages to protect:**
- Email templates section
- Invoice pages
- Any sensitive financial/reporting pages

---

## 📋 EXECUTION ORDER

Execute tasks in this order, testing each before moving to next:

1. ✅ **Fix dual account bug**
   - Email signup creates profile + rep number
   - OAuth signup creates profile + rep number
   - Test both methods create complete accounts

2. ✅ **Fix email verification**
   - Verification emails send properly
   - Test with new signup flow
   - Check Resend API configuration

3. ✅ **Add Luxury Quote Theme**
   - Build luxury theme component
   - Add HTML/JPEG/PNG export
   - Test all download formats
   - Verify branding matches mockups

4. ✅ **Fix credit application**
   - Rep code links work properly
   - Remove interrupting code
   - Test end-to-end from dashboard to Matt's site

5. ✅ **Fix inventory page**
   - Resolve "page doesn't exist" error
   - Verify bulk import API works
   - Test pricing formula calculations
   - Confirm trailer data updates

6. ✅ **Set up Google Sheets sync**
   - Create Google Sheets API integration
   - Build Form → Sheets → Website bridge
   - Test lead syncing
   - Handle duplicates

7. ✅ **Hide unnecessary menu items**
   - Update config/menus.ts
   - Comment out or hide items
   - Verify sidebar navigation clean
   - Keep code intact for future

8. ✅ **Add role restrictions**
   - Protect email templates
   - Protect invoice pages
   - Test with different roles
   - Verify salespeople blocked

---

## 🧪 TESTING CHECKLIST

After each fix, verify:
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] No console errors in browser
- [ ] Changes work on both desktop and mobile
- [ ] Role-based access works correctly
- [ ] Database operations succeed
- [ ] Email notifications send (if applicable)
- [ ] UI matches Remotive Logistics branding

---

## 📞 CONTACT

Kenneth is available if clarification needed on any requirements!

**Test Accounts:**
- Email signup (broken): HolyBikesUSA@gmail.com
- Kenneth's main account: Check Google OAuth login

**External Sites:**
- Credit Applications: https://remotivetrailers.com
- Production: https://mjsalesdash.com

---

## 📚 REFERENCE DOCS

- Full codebase docs: `CLAUDE.md`
- Database schema: `prisma/schema.prisma`
- CRM system docs: `COMPLETE_CRM_BUILD_SUMMARY.md`
- Manager system: `docs/DYNAMIC_MANAGER_SYSTEM.md`
- Recent fixes: `docs/FIXES_IN_PROGRESS.md`

---

**Generated:** October 22, 2025, 5:09 AM
**By:** Browser Claude Code
**For:** Papi Claude (Claude Desktop)

🚀 **Ready to execute! Start with task #1 and work sequentially!**
