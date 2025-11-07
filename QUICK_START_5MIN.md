# ⚡ QUICK ACTIVATION - 5 MINUTE SETUP

## 🎯 **WHAT'S ALREADY WORKING** (No Action Needed)
- ✅ Customer names are clickable
- ✅ Call/Email/Quote buttons work
- ✅ Excel upload works
- ✅ Favicon is fixed

## 🔥 **WHAT NEEDS ACTIVATION** (Do This Now)

### 1️⃣ **Install Dependencies** (30 seconds)
```bash
cd C:\Users\kence\salesdash-ts
pnpm add js-cookie @types/js-cookie
```

### 2️⃣ **Activate Draggable Columns** (2 minutes)
Open: `app/[lang]/(dashboard)/(apps)/inventory/page.tsx`

Add at top:
```typescript
import { useDraggableColumns } from '@/hooks/use-draggable-columns';
import { ColumnManager } from '@/components/inventory/column-manager';
```

Add after useState:
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

Find this line (around line 420):
```tsx
<CardTitle className="text-white text-2xl">
  {filteredTrailers.length} Trailers
</CardTitle>
```

Add the ColumnManager button next to it:
```tsx
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
</div>
```

### 3️⃣ **Import Missing Leads** (2 minutes)
```bash
# Quick way - use Neon Console:
1. Go to: https://console.neon.tech
2. Open your database
3. Go to SQL Editor
4. Paste content from: scripts/import_missing_leads.sql
5. Click Run
```

### 4️⃣ **Restart Server** (30 seconds)
```bash
# Stop server (Ctrl+C)
rm -rf .next
pnpm dev
```

## ✅ **DONE! TEST EVERYTHING**

### Test Links:
- http://localhost:3000/en/crm/customers → Click any name
- http://localhost:3000/en/crm/customers/[id] → Test buttons
- http://localhost:3000/en/inventory → Click "Manage Columns"
- http://localhost:3000/en/inventory → Click "Upload File"

## 🔥 **EVERYTHING SHOULD BE WORKING!**

---

**Total Time: ~5 minutes**

¡Listo papi! 💪🚀