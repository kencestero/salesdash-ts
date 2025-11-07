# Quick Start: Import Supplier Inventory 🚀

## Step 1: Get Gmail Emails (5 minutes)

1. **Login**: https://mail.google.com
   - Email: `kencestero@gmail.com`
   - Password: `pENOSKY77200@@`

2. **Find & Download Attachments**:
   - ✅ "DCFW: 10/17/25 DC OPEN STOCK LIST" (Lee Portivent, Oct 17)
   - ✅ "quality cargo open stock 10-13" (Elvira, Oct 13)
   - ✅ "panther cargo open stock" (Iliana Castillo, Oct 14)

3. **Save** all Excel/PDF files to Desktop

---

## Step 2: Extract Data to Spreadsheet (15 minutes)

Open each file and create a spreadsheet with these columns:

| VIN | Manufacturer | Model | Year | Length | Width | Height | Cost | Features | Notes |
|-----|--------------|-------|------|--------|-------|--------|------|----------|-------|

**MOST IMPORTANT**: Get the **COST** for each trailer! The system will calculate the price automatically.

---

## Step 3: Format as JSON (I'll help you with this)

When you're ready, show me the spreadsheet and I'll format it for you. Or use this template:

```json
{
  "source": "Lee DCFW",
  "trailers": [
    {
      "vin": "VIN_NUMBER_HERE",
      "manufacturer": "Diamond Cargo",
      "model": "7x16 Tandem Axle",
      "year": 2025,
      "length": 16,
      "width": 7,
      "height": 6.5,
      "cost": 12000,
      "category": "enclosed",
      "features": ["Ramp door", "LED lights"],
      "notes": "Any special notes"
    }
  ]
}
```

---

## Step 4: Import via API

**Option A: Use Postman/Insomnia** (easiest for testing)
1. Create new POST request
2. URL: `http://localhost:3000/api/inventory/bulk-import`
3. Headers:
   - `Content-Type: application/json`
   - `X-API-Key: mjcargo-inventory-import-65b8353628a3a9ef530f2b628bdc2fa9`
4. Body: Paste your JSON
5. Send!

**Option B: Use curl**
```bash
curl -X POST http://localhost:3000/api/inventory/bulk-import \
  -H "Content-Type: application/json" \
  -H "X-API-Key: mjcargo-inventory-import-65b8353628a3a9ef530f2b628bdc2fa9" \
  -d @trailers.json
```

**Option C: Just send me the spreadsheet and I'll import it for you!**

---

## What Happens Automatically

1. ✅ System checks if trailer exists (by VIN)
2. ✅ Applies your pricing formula:
   - Cost + 1.25% OR Cost + $1,400 (whichever is higher)
   - Guarantees minimum $1,400 profit
3. ✅ Creates new trailer or updates existing
4. ✅ Adds all notes/features
5. ✅ Returns summary: X created, Y updated, Z errors

---

## Pricing Examples

Your formula ensures **minimum $1,400 profit** on every trailer:

- Cost $50,000 → **Sells for $51,400** (profit $1,400) ✅
- Cost $100,000 → **Sells for $101,400** (profit $1,400) ✅
- Cost $120,000 → **Sells for $121,500** (profit $1,500) ✅
- Cost $200,000 → **Sells for $202,500** (profit $2,500) ✅

---

## Panther Dump Trailers

**IMPORTANT**: Mark Panther dumps with `"category": "dump"` so they're separated!

```json
{
  "category": "dump",
  "manufacturer": "Panther Cargo",
  ...
}
```

We'll create a separate section for these since they're low volume (1-2/month).

---

## Need Help?

Just drop the Excel files in chat or show me screenshots and I'll extract the data and import it for you!

**Estimated Total Time**: 20-30 minutes to import all 3 suppliers ⚡

---

## API Key (for reference)

```
INVENTORY_API_KEY=mjcargo-inventory-import-65b8353628a3a9ef530f2b628bdc2fa9
```

This is already in your `.env.local` file!

---

**Ready to rock when you are!** 🎸
