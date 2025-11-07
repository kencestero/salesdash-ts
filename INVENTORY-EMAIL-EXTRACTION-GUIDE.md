# Inventory Email Extraction Guide

## Gmail Account
- **Email**: kencestero@gmail.com
- **Password**: pENOSKY77200@@

## Emails to Extract

### 1. Lee DCFW (Diamond Cargo)
- **Subject**: "DCFW: 10/17/25 DC OPEN STOCK LIST"
- **From**: Lee Portivent
- **Date**: Oct 17, 2025, 10:40 AM
- **To**: Brittany
- **Has Attachments**: YES

### 2. Quality Cargo
- **Subject**: "quality cargo open stock 10-13"
- **From**: Elvira via googlegroups.com
- **Date**: Mon, Oct 13, 8:31 AM
- **Has Attachments**: YES

### 3. Panther Cargo (DUMP TRAILERS ONLY)
- **Subject**: "panther cargo open stock"
- **From**: Iliana Castillo iliana@panthercargollc.com via googlegroups.com
- **Date**: Tue, Oct 14, 8:40 AM
- **To**: Jessica
- **Has Attachments**: YES
- **NOTE**: DO NOT MIX with enclosed trailers. Separate section. Low volume (1-2 sales/month)

## Pricing Formula

### Standard Pricing
```
Base Formula: Cost + (Cost × 0.0125)
Which equals: Cost × 1.0125

BUT...

If profit < $1,400, use instead:
Price = Cost + $1,400
```

### Examples
- **Cost: $50,000**
  - Formula: $50,000 × 1.0125 = $50,625
  - Profit: $625 ❌ (less than $1,400)
  - **Final Price: $51,400** (Cost + $1,400)

- **Cost: $100,000**
  - Formula: $100,000 × 1.0125 = $101,250
  - Profit: $1,250 ❌ (less than $1,400)
  - **Final Price: $101,400** (Cost + $1,400)

- **Cost: $120,000**
  - Formula: $120,000 × 1.0125 = $121,500
  - Profit: $1,500 ✅ (more than $1,400)
  - **Final Price: $121,500** (Use formula)

### JavaScript Implementation
```javascript
function calculatePrice(cost) {
  const markup = cost * 0.0125; // 1.25%
  const priceWithMarkup = cost + markup;
  const profit = priceWithMarkup - cost;

  if (profit < 1400) {
    // Cap at minimum $1,400 profit
    return cost + 1400;
  }

  return priceWithMarkup;
}
```

## Data Fields to Extract

For each trailer in the inventory emails, extract:

1. **VIN** (Vehicle Identification Number)
2. **Manufacturer** (Diamond Cargo, Quality Cargo, Panther Cargo)
3. **Model/Type** (e.g., "7x16 Tandem Axle Enclosed")
4. **Year**
5. **Length** (in feet)
6. **Width** (in feet)
7. **Height** (in feet)
8. **Weight** (GVWR)
9. **Axles** (Single, Tandem, Triple)
10. **Color**
11. **Cost Price** (what we pay)
12. **Options/Features** (ramp door, side door, windows, etc.)
13. **Notes** (any special information)
14. **Stock Number** (if provided)
15. **Location** (if provided)

## Database Update Process

1. Check if trailer exists by VIN
2. If exists:
   - Update cost
   - Recalculate price using formula
   - Update notes/options
   - Update status to "available"
3. If new:
   - Create new trailer record
   - Calculate price using formula
   - Add all details
   - Set status to "available"

## API Endpoint for Bulk Import

**Endpoint**: `POST /api/inventory/bulk-import`

**Authentication**: API Key in header
```
X-API-Key: INVENTORY_API_KEY
```

**Payload Format**:
```json
{
  "source": "Lee DCFW" | "Quality Cargo" | "Panther Cargo",
  "trailers": [
    {
      "vin": "1234567890ABCDEFG",
      "manufacturer": "Diamond Cargo",
      "model": "7x16 Tandem Axle Enclosed",
      "year": 2025,
      "length": 16,
      "width": 7,
      "height": 6.5,
      "weight": 7000,
      "axles": "tandem",
      "color": "White",
      "cost": 50000,
      "options": "Ramp door, side door, LED lights",
      "notes": "Brand new, ready to deliver",
      "stockNumber": "DC-12345",
      "location": "Dallas"
    }
  ]
}
```

## Manual Extraction Steps

### Step 1: Access Gmail
1. Go to https://mail.google.com
2. Login with: kencestero@gmail.com / pENOSKY77200@@

### Step 2: Download Attachments
1. Find each email by subject
2. Download all attachments (likely Excel or PDF files)
3. Save to a folder

### Step 3: Parse Data
1. Open each file
2. Extract trailer information
3. Format according to API payload above

### Step 4: Import to Database
1. Use bulk import API endpoint
2. Or use database script
3. Verify all trailers imported correctly

## Security Notes

- ⚠️ **Password is stored in plaintext in this file - DELETE after use**
- Consider setting up Gmail API with OAuth2 for automated extraction
- Use environment variables for sensitive data in production

## Future Automation

To automate this process:
1. Set up Gmail API access
2. Create cron job to check for new inventory emails daily
3. Automatically parse attachments
4. Auto-import to database
5. Send notification when new inventory is added

---

**Created**: Oct 20, 2025
**For**: Kenneth Cestero (Manager, MJ Cargo SalesDash)
**Purpose**: Extract inventory from 3 supplier emails and update pricing
