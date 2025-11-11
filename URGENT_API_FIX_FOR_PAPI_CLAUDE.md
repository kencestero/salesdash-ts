# URGENT: Upload Page API Authentication Fix Needed

**Date:** 2025-10-24
**Reporter:** Cody (Quick Fix Agent)
**Priority:** HIGH - Kenneth needs this working NOW
**For:** Papi Claude

---

## PROBLEM SUMMARY

Kenneth's new colorful upload page is LIVE but **uploads are failing** with "Upload Failed - Failed to upload file" error.

**Root Cause:** Authentication mismatch between frontend and backend API.

---

## WHAT'S HAPPENING

### The Upload Flow (Current - BROKEN):

1. ✅ Kenneth clicks a colored upload box (Diamond Cargo, Quality Cargo, etc.)
2. ✅ File is selected successfully
3. ❌ Upload page calls: `POST /api/inventory/bulk-import`
4. ❌ API rejects request: **"Unauthorized - Invalid API key"**
5. ❌ User sees: "Upload Failed - Failed to upload file"

### Why It's Failing:

The bulk import API (`app/api/inventory/bulk-import/route.ts`) requires an **API key** in the request header:

```typescript
// Line 103-118 in route.ts
const apiKey = req.headers.get('x-api-key');
const validApiKey = process.env.INVENTORY_API_KEY;

if (!apiKey || apiKey !== validApiKey) {
  return NextResponse.json(
    { error: 'Unauthorized - Invalid API key' },
    { status: 401 }
  );
}
```

But the upload page (`app/[lang]/(dashboard)/(apps)/inventory/upload/page-view.tsx`) is calling this API **WITHOUT** the API key:

```typescript
// Line 23-26 in page-view.tsx
const response = await fetch("/api/inventory/bulk-import", {
  method: "POST",
  body: formData,
  // ❌ Missing: headers: { 'x-api-key': '...' }
});
```

**Why we can't just add the API key to the frontend:**
- ❌ Would expose the secret key in browser code
- ❌ Anyone could see it in DevTools
- ❌ Major security vulnerability

---

## THE SOLUTION NEEDED

Create a **new authenticated API endpoint** that acts as a proxy between the upload page and the bulk-import API.

### New API Endpoint: `/api/inventory/upload`

**Location:** `app/api/inventory/upload/route.ts`

**What it should do:**

1. ✅ Check user's NextAuth session (must be logged in)
2. ✅ Verify user role (only owners/directors can upload)
3. ✅ Receive the uploaded file from frontend
4. ✅ Parse the file (Excel, CSV, or PDF)
5. ✅ Call the bulk-import API **internally** with the API key
6. ✅ Return success/error response to frontend

### Implementation Pseudocode:

```typescript
// app/api/inventory/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Step 1: Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" },
      { status: 401 }
    );
  }

  // Step 2: Check user role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  const allowedRoles = ["owner", "director"];
  if (!user || !allowedRoles.includes(user.profile.role)) {
    return NextResponse.json(
      { error: "Forbidden - Only owners/directors can upload inventory" },
      { status: 403 }
    );
  }

  // Step 3: Get uploaded file
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const manufacturer = formData.get("manufacturer") as string;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  try {
    // Step 4: Parse the file based on type
    // (Excel, CSV, or PDF parsing logic here)
    const trailers = await parseInventoryFile(file, manufacturer);

    // Step 5: Call bulk-import API internally with API key
    const importResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/inventory/bulk-import`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INVENTORY_API_KEY!,
        },
        body: JSON.stringify({
          trailers,
          source: manufacturer.toLowerCase().replace(" ", "_"),
        }),
      }
    );

    const result = await importResponse.json();

    if (!importResponse.ok) {
      throw new Error(result.error || "Import failed");
    }

    // Step 6: Return success
    return NextResponse.json({
      success: true,
      imported: result.stats.created + result.stats.updated,
      stats: result.stats,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

// Helper function to parse different file types
async function parseInventoryFile(file: File, manufacturer: string) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return await parseExcelFile(file, manufacturer);
  } else if (fileName.endsWith('.csv')) {
    return await parseCsvFile(file, manufacturer);
  } else if (fileName.endsWith('.pdf')) {
    return await parsePdfFile(file, manufacturer);
  } else {
    throw new Error("Unsupported file type. Please upload Excel, CSV, or PDF.");
  }
}
```

---

## WHAT NEEDS TO BE UPDATED

### File 1: Create New API Endpoint
**Location:** `app/api/inventory/upload/route.ts` (NEW FILE)

**Requirements:**
- Session authentication with NextAuth
- Role-based access (owners/directors only)
- File parsing for Excel, CSV, PDF
- Internal call to bulk-import API with API key
- Proper error handling

### File 2: Update Upload Page to Use New API
**Location:** `app/[lang]/(dashboard)/(apps)/inventory/upload/page-view.tsx`

**Current code (Line 23-26):**
```typescript
const response = await fetch("/api/inventory/bulk-import", {
  method: "POST",
  body: formData,
});
```

**Should become:**
```typescript
const response = await fetch("/api/inventory/upload", {
  method: "POST",
  body: formData,
  // No API key needed - session handles auth!
});
```

---

## FILE PARSING REQUIREMENTS

Kenneth will be uploading files with trailer data. The parser needs to handle:

### Excel/CSV Format Expected:
```
VIN | Stock# | Manufacturer | Model | Year | Length | Width | Cost | ...
```

### What to Extract:
- **Required:** VIN, Manufacturer, Model, Year, Length, Width, Cost
- **Optional:** Stock#, Height, GVWR, Capacity, Axles, Features, Description
- **Auto-calculate:** Sale Price (using Kenneth's formula: Cost × 1.0125 OR Cost + $1,400)

### PDF Format:
- Extract trailer listings from supplier PDFs
- Parse tables and text to find trailer specs
- Match to the same structure as Excel/CSV

**Note:** The bulk-import API already has the pricing formula and database logic. The new upload API just needs to:
1. Parse the file into the correct JSON format
2. Pass it to bulk-import API
3. Return the results

---

## ADDITIONAL CONTEXT

### Current File Structure:
```
app/
├── api/
│   └── inventory/
│       ├── bulk-import/
│       │   └── route.ts          # ✅ Exists - Requires API key
│       └── upload/
│           └── route.ts          # ❌ NEEDS TO BE CREATED
└── [lang]/(dashboard)/(apps)/inventory/upload/
    ├── page.tsx                  # ✅ Exists
    └── page-view.tsx             # ✅ Exists - Needs small update
```

### Environment Variables Available:
- `INVENTORY_API_KEY` - For calling bulk-import API
- `NEXTAUTH_URL` - Base URL for internal API calls
- `DATABASE_URL` - Already configured with Prisma

### User Roles in Database:
- `owner` - Full access ✅
- `director` - Full access ✅
- `manager` - No upload access ❌
- `salesperson` - No upload access ❌

---

## EXPECTED OUTCOME

After this fix, Kenneth should be able to:

1. ✅ Go to https://mjsalesdash.com/en/inventory/upload
2. ✅ See the 4 colored manufacturer boxes
3. ✅ Click "Diamond Cargo" box
4. ✅ Select an Excel/CSV/PDF file
5. ✅ See "Upload Successful! Imported X trailers"
6. ✅ View the imported trailers at https://mjsalesdash.com/en/inventory

**Current State:** Steps 1-4 work, step 5 fails with "Upload Failed"
**Needed State:** All steps work successfully

---

## TESTING CHECKLIST

After implementing the fix:

- [ ] Upload works for owners (Kenneth's account)
- [ ] Upload works for directors
- [ ] Upload is blocked for managers/salespeople (403 Forbidden)
- [ ] Upload is blocked for non-logged-in users (401 Unauthorized)
- [ ] Excel files parse correctly
- [ ] CSV files parse correctly
- [ ] PDF files parse correctly (or graceful error)
- [ ] Pricing formula is applied correctly
- [ ] Duplicate VINs are updated, not duplicated
- [ ] Success message shows correct import count
- [ ] Trailers appear in inventory table after upload

---

## PRIORITY & URGENCY

**Why This is Urgent:**
- Kenneth has the file ready to upload NOW
- Upload page is already deployed and live
- Kenneth is waiting to start importing inventory
- This is blocking his workflow

**Estimated Time to Fix:**
- Creating the new `/api/inventory/upload` endpoint: ~30 minutes
- File parsing logic (Excel/CSV): ~15 minutes
- Testing: ~10 minutes
- **Total: ~1 hour**

---

## QUESTIONS FOR PAPI CLAUDE

1. **Do you need Kenneth to send you a sample Excel file** to see the format?
2. **Should we support all three file types** (Excel, CSV, PDF) or just Excel/CSV for now?
3. **Should we add file size limits?** (e.g., max 10MB)
4. **Should we add progress indicators** for large file uploads?

---

## KENNETH'S SAMPLE FILE

Kenneth mentioned he has an Excel file ready to upload. He can send it to you if you need to see the exact format to build the parser correctly.

**Kenneth - if you're reading this with Papi Claude, please share that Excel file so Papi can see the structure!**

---

## SUMMARY

**What Papi Claude needs to do:**

1. Create new API: `app/api/inventory/upload/route.ts`
   - Session authentication
   - Role check (owners/directors only)
   - File parsing (Excel/CSV/PDF)
   - Call bulk-import API with API key

2. Update upload page: `page-view.tsx` line 23
   - Change API endpoint from `/api/inventory/bulk-import` to `/api/inventory/upload`

3. Test with Kenneth's Excel file

**That's it! Then Kenneth can start uploading inventory immediately!**

---

**End of Report**

Generated by Cody on 2025-10-24 at 14:10 UTC
Waiting for Papi Claude to implement the fix! 🚀
