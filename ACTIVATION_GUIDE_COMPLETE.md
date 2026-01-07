# 🚀 Remotive Logistics CRM - COMPLETE ACTIVATION GUIDE
**All Features & Instructions in One Place**

---

## 📋 **TABLE OF CONTENTS**
1. [Pre-Installation Requirements](#1-pre-installation-requirements)
2. [Customer Name Links](#2-customer-name-links)
3. [Working Buttons (Call/Email/Quote)](#3-working-buttons)
4. [Draggable Columns](#4-draggable-columns)
5. [Excel Upload](#5-excel-upload)
6. [Favicon Fix](#6-favicon-fix)
7. [Import Missing Leads](#7-import-missing-leads)
8. [Quick Verification Checklist](#8-verification-checklist)

---

## 1️⃣ **PRE-INSTALLATION REQUIREMENTS**

### Install Dependencies First:
```bash
# Navigate to your project
cd C:\Users\kence\salesdash-ts

# Install required packages
pnpm add js-cookie
pnpm add -D @types/js-cookie

# Clear cache and restart
rm -rf .next
pnpm dev
```

---

## 2️⃣ **CUSTOMER NAME LINKS** ✅ ALREADY ACTIVE!

### Status: **WORKING NOW**
Customer names in the list are already clickable links!

### Files Modified:
- `app/[lang]/(dashboard)/(apps)/crm/customers/page.tsx`

### How It Works:
- Customer names appear in **orange** (#ee6832)
- Hover shows **underline**
- Clicks go to `/en/crm/customers/{id}`
- Same destination as View button

### No Action Needed - Already Working!

---

## 3️⃣ **WORKING BUTTONS (Call/Email/Quote)** ✅ ALREADY ACTIVE!

### Status: **WORKING NOW**

### Files Created:
```
✅ app/api/crm/call/route.ts     - Call API endpoint
✅ app/api/crm/email/route.ts    - Email API endpoint (uses Resend)
✅ app/api/crm/quote/route.ts    - Quote API endpoint
```

### Customer Detail Page Updated:
- `app/[lang]/(dashboard)/(apps)/crm/customers/[id]/page.tsx`

### Features:
- **Call Button**: Opens phone dialer + logs activity
- **Email Button**: Sends REAL emails via Resend API
- **Quote Button**: Creates quotes with unique numbers

### Environment Variables Needed:
Add to your `.env` file if not already there:
```env
RESEND_API_KEY=re_Pkdcn1eF_MH2diGv3oTrbc5Zz9mNR4Aoj
DATABASE_URL=postgresql://neondb_owner:npg_m5CqnWHQK2rp@ep-snowy-leaf-ad9rqm9s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### No Action Needed - Already Working!

---

## 4️⃣ **DRAGGABLE COLUMNS** 🆕 NEEDS ACTIVATION!

### Status: **BUILT - NEEDS INTEGRATION**

### Step 1: Files Already Created:
```
✅ hooks/use-draggable-columns.ts       - Core draggable logic
✅ components/inventory/column-manager.tsx - UI component
```

### Step 2: Add to Inventory Page
Open `app/[lang]/(dashboard)/(apps)/inventory/page.tsx` and add:

#### At the top (imports):
```typescript
import { useDraggableColumns } from '@/hooks/use-draggable-columns';
import { ColumnManager } from '@/components/inventory/column-manager';
```

#### Inside your component (after useState):
```typescript
const {
  columns,
  allColumns,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  toggleColumnVisibility,
  moveColumn,
  resetColumns
} = useDraggableColumns();
```

#### Above your table (add the manager button):
```tsx
<div className="flex justify-between items-center mb-4">
  <CardTitle className="text-white text-2xl">
    {filteredTrailers.length} Trailers
  </CardTitle>
  <div className="flex gap-2">
    <ColumnManager
      columns={allColumns}
      onToggleVisibility={toggleColumnVisibility}
      onMoveColumn={moveColumn}
      onReset={resetColumns}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    />
    {/* Other buttons here */}
  </div>
</div>
```

#### Replace static table headers with dynamic ones:
```tsx
<TableHeader>
  <TableRow className="border-gray-700">
    {columns.map((column) => (
      <TableHead
        key={column.id}
        draggable
        onDragStart={() => handleDragStart(column.id)}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(e, column.id)}
        className={`text-gray-400 text-base font-bold cursor-move ${column.width || ''}`}
      >
        {column.label}
      </TableHead>
    ))}
  </TableRow>
</TableHeader>
```

#### Update table body to use dynamic columns:
See `DRAGGABLE_COLUMNS_IMPLEMENTATION.tsx` for complete code

### Features Once Activated:
- Drag & drop columns to reorder
- Hide/show columns
- Saves layout to cookies (365 days)
- Reset to defaults button
- Arrow buttons to move columns

---

## 5️⃣ **EXCEL UPLOAD** ✅ ALREADY ACTIVE!

### Status: **WORKING NOW**

### Supported File Types:
- ✅ Quality Cargo Excel (.xlsx) - reads "PLAIN UNITS" sheet
- ✅ Diamond Cargo Excel (.xlsx) - reads "AVAILBLE" sheet  
- ✅ PDF files (any format)
- ✅ CSV files

### How to Use:
1. Go to **Inventory** page
2. Click blue **"Upload File"** button
3. Select your Excel/PDF/CSV file
4. System auto-detects format and imports

### API Endpoints:
```
✅ app/api/inventory/upload-excel/route.ts - Excel parser
✅ app/api/inventory/upload-pdf/route.ts   - PDF parser
✅ app/api/inventory/bulk-import/route.ts  - Bulk processor
```

### Features:
- Auto-detects manufacturer (QC/DC)
- Shows import summary
- Updates existing trailers
- Tracks new/updated/removed items
- View history of uploads

### No Action Needed - Already Working!

---

## 6️⃣ **FAVICON FIX** ✅ ALREADY ACTIVE!

### Status: **FIXED**

### Files Updated:
```
✅ public/favicon.ico - Moved from app folder
✅ public/manifest.json - Created
✅ app/layout.tsx - Updated metadata
```

### Clear Browser Cache:
```bash
# In Chrome DevTools (F12):
1. Right-click refresh button
2. Select "Empty Cache and Hard Reload"

# Or in terminal:
rm -rf .next
pnpm dev
```

### Verification:
- Check browser tab for MJ logo
- Visit: http://localhost:3000/favicon.ico
- Visit: http://localhost:3000/logo.png

---

## 7️⃣ **IMPORT MISSING LEADS** ⚠️ NEEDS ACTION!

### Status: **MANUAL IMPORT NEEDED**

### Current Database Status:
- **Have**: 473 leads
- **Need**: 762 total
- **Missing**: 289 leads

### Option 1: Import from Google Sheets
```bash
# Google Sheets IDs:
DUPLICATE (SAFE): 1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8
PRODUCTION: 1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA

# Export sheet as CSV, then import
```

### Option 2: Use SQL Script
Location: `scripts/import_missing_leads.sql`

```bash
# Connect to database and run:
psql "postgresql://neondb_owner:npg_m5CqnWHQK2rp@ep-snowy-leaf-ad9rqm9s-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" < scripts/import_missing_leads.sql
```

### Option 3: Use Neon Console
1. Go to Neon dashboard
2. Open SQL editor
3. Paste contents of `import_missing_leads.sql`
4. Execute

---

## 8️⃣ **VERIFICATION CHECKLIST** ✅

### Quick Test Everything:
```bash
# 1. Start fresh
cd C:\Users\kence\salesdash-ts
rm -rf .next
pnpm dev
```

### Check Each Feature:

| Feature | Test URL/Action | Expected Result |
|---------|-----------------|-----------------|
| **Customer Links** | http://localhost:3000/en/crm/customers | Names are orange & clickable |
| **Call Button** | Click Call on any customer | Toast notification + phone dialer |
| **Email Button** | Click Email on any customer | Email dialog + sends via Resend |
| **Quote Button** | Click Quote on any customer | Creates quote with number |
| **Excel Upload** | Inventory → Upload File | Accepts .xlsx files |
| **Favicon** | Check browser tab | MJ logo visible |
| **Draggable Columns** | After adding code → Manage Columns | Can drag/drop columns |

---

## 🎯 **PRIORITY ACTIVATION ORDER**

### Do This First:
1. **Install dependencies**: `pnpm add js-cookie @types/js-cookie`
2. **Clear cache**: `rm -rf .next`
3. **Restart server**: `pnpm dev`

### Then Activate:
4. **Add draggable columns code** to inventory page
5. **Import missing 289 leads** from Google Sheets
6. **Test all buttons** work

### Already Working (No Action):
- Customer name links ✅
- Call/Email/Quote buttons ✅
- Excel upload ✅
- Favicon ✅

---

## 🔥 **TROUBLESHOOTING**

### If Something Doesn't Work:

#### Buttons not working?
```bash
# Check API routes exist:
ls app/api/crm/
# Should see: call, email, quote folders
```

#### Favicon not showing?
```bash
# Force clear:
1. Ctrl+Shift+Delete in browser
2. Clear "Cached images and files"
3. Restart browser
```

#### Excel upload fails?
```bash
# Check file structure:
- Quality Cargo needs "PLAIN UNITS" sheet
- Diamond Cargo needs "AVAILBLE" sheet
- File must be .xlsx (not .xls)
```

#### Database connection issues?
```bash
# Test connection:
npx prisma db push
npx prisma studio
```

---

## 📞 **SUPPORT COMMANDS**

### Quick Fixes:
```bash
# Reset everything:
rm -rf .next node_modules
pnpm install
pnpm dev

# Check database:
npx prisma studio

# View logs:
pnpm dev --verbose

# Test API endpoints:
curl http://localhost:3000/api/crm/customers
```

---

## ✅ **FINAL CHECKLIST**

Before you're done, make sure:
- [ ] Dependencies installed (`js-cookie`)
- [ ] Server restarted
- [ ] Customer names are clickable
- [ ] Buttons show toast notifications
- [ ] Excel upload accepts files
- [ ] Favicon shows in browser tab
- [ ] Draggable columns code added
- [ ] Missing leads imported (289)

---

## 🚀 **YOU'RE ALL SET!**

Once you complete the steps above, your CRM will have:
- ✅ Clickable customer names
- ✅ Working Call/Email/Quote buttons
- ✅ Draggable & saveable column layouts
- ✅ Excel/PDF upload capability
- ✅ Proper favicon
- ✅ 762 total leads (after import)

---

**¡VÁMONOS HERMANO!** Your CRM is ready to DOMINATE! 💪🔥🚀

---

*Last Updated: October 25, 2024*
*Created by: Claude Opus for Kenneth @ Remotive Logistics*