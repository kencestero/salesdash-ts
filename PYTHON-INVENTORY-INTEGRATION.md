# Python Inventory Scripts → SalesDash Integration

## 🎯 What This Does

Connects your existing Python scripts to SalesDash so trailers auto-import to the database.

**Your Python Scripts:**
- `import_inventory.py` - Imports 405 trailers (Diamond, Quality, Panther)
- `upload_to_cloudinary.py` - Uploads VIN-named images to CDN

**What We Built:**
- ✅ API endpoint: `/api/inventory/bulk-import`
- ✅ API key authentication
- ✅ Auto-detects duplicates (by VIN)
- ✅ Updates prices if changed

---

## 📋 Setup Instructions

### Step 1: Generate API Key

Run this command to generate a secure API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 2: Add API Key to Environment

Add to your `.env` file AND Vercel:

```bash
INVENTORY_API_KEY="your-generated-api-key-here"
```

**Vercel:**
```bash
vercel env add INVENTORY_API_KEY
```

Or via Vercel Dashboard → Settings → Environment Variables

### Step 3: Update Your Python Script

Open your `import_inventory.py` file and add this function at the top:

```python
import requests
import json

# SalesDash API Configuration
SALESDASH_API_URL = "https://your-app.vercel.app/api/inventory/bulk-import"
SALESDASH_API_KEY = "your-api-key-here"  # Replace with your actual API key

def send_to_salesdash(trailers, source_name):
    """
    Send trailers to SalesDash API

    Args:
        trailers: List of trailer dictionaries
        source_name: 'diamond_cargo', 'quality_cargo', or 'panther_cargo'

    Returns:
        Response from SalesDash API
    """
    headers = {
        'X-API-Key': SALESDASH_API_KEY,
        'Content-Type': 'application/json'
    }

    payload = {
        'trailers': trailers,
        'source': source_name
    }

    print(f"📤 Sending {len(trailers)} trailers to SalesDash...")

    try:
        response = requests.post(
            SALESDASH_API_URL,
            headers=headers,
            json=payload,
            timeout=300  # 5 minute timeout for large batches
        }

        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS!")
            print(f"   Created: {result['stats']['created']}")
            print(f"   Updated: {result['stats']['updated']}")
            print(f"   Skipped: {result['stats']['skipped']}")
            print(f"   Errors: {result['stats']['errors']}")
            return result
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"   {response.text}")
            return None

    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return None
```

### Step 4: Update Your Data Format

Make sure your trailers are in this format:

```python
trailer = {
    # Required fields
    "vin": "113617",
    "manufacturer": "Diamond Cargo",
    "model": "5X10SA",
    "year": 2025,
    "category": "Enclosed",
    "length": 10,
    "width": 5,
    "msrp": 2860,
    "salePrice": 2860,

    # Optional fields
    "stockNumber": "DC-113617",
    "height": 5.5,  # feet
    "gvwr": 3500,   # lbs
    "capacity": 2500,  # lbs
    "axles": 1,
    "cost": 2288,  # 80% of sale price
    "makeOffer": False,
    "status": "available",
    "location": "Bowling Green, KY",
    "description": "Black .080 V-Nose enclosed trailer",
    "features": [
        "LED Lighting",
        "V-Nose Design",
        "Ramp Door",
        "Black Out Package"
    ],
    "images": []  # Will be populated later with Cloudinary URLs
}
```

### Step 5: Call the Function

At the end of your script, after you've processed all trailers:

```python
# Example: After importing Diamond Cargo
diamond_trailers = [...]  # Your list of trailers

# Send to SalesDash
result = send_to_salesdash(diamond_trailers, 'diamond_cargo')

if result:
    print(f"✅ Diamond Cargo import complete!")
else:
    print(f"❌ Diamond Cargo import failed!")
```

---

## 🧪 Testing

### Test the API Endpoint

Before updating your Python script, test that the API works:

```bash
# Test with curl
curl -X GET https://your-app.vercel.app/api/inventory/bulk-import \
  -H "X-API-Key: your-api-key"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Bulk Import API is working",
  "endpoint": "/api/inventory/bulk-import",
  "method": "POST"
}
```

### Test with Sample Data

Create a test file `test_import.py`:

```python
import requests

API_URL = "https://your-app.vercel.app/api/inventory/bulk-import"
API_KEY = "your-api-key"

# Sample trailer
test_trailer = {
    "vin": "TEST123",
    "manufacturer": "Test Manufacturer",
    "model": "TEST-MODEL",
    "year": 2025,
    "category": "Enclosed",
    "length": 10,
    "width": 5,
    "msrp": 5000,
    "salePrice": 4500
}

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

payload = {
    'trailers': [test_trailer],
    'source': 'test'
}

response = requests.post(API_URL, headers=headers, json=payload)
print(response.json())
```

Run it:
```bash
python test_import.py
```

---

## 📊 Expected Workflow

### Step-by-Step Process:

1. **Your Python Script Runs** (locally or on a server)
   ```bash
   python import_inventory.py
   ```

2. **Processes Excel Files**
   - Diamond Cargo → 160 trailers
   - Quality Cargo → 107 trailers
   - Panther Cargo → 138 trailers

3. **Sends to SalesDash API**
   ```
   POST /api/inventory/bulk-import
   Headers: X-API-Key: your-key
   Body: { trailers: [...], source: 'diamond_cargo' }
   ```

4. **SalesDash Processes**
   - Checks for existing VINs
   - Creates new trailers
   - Updates prices if changed
   - Skips duplicates

5. **Returns Results**
   ```json
   {
     "stats": {
       "total": 160,
       "created": 155,
       "updated": 3,
       "skipped": 2,
       "errors": 0
     }
   }
   ```

---

## 🔒 Security

### API Key Protection

**DO:**
- ✅ Store API key in environment variable
- ✅ Use `.env` file (add to `.gitignore`)
- ✅ Rotate key if compromised

**DON'T:**
- ❌ Hardcode API key in script
- ❌ Commit API key to GitHub
- ❌ Share API key publicly

### Best Practice

Create a `.env` file in your Python scripts folder:

```bash
# .env
SALESDASH_API_URL=https://your-app.vercel.app/api/inventory/bulk-import
SALESDASH_API_KEY=your-api-key-here
```

Update your Python script to use it:

```python
import os
from dotenv import load_dotenv

load_dotenv()

SALESDASH_API_URL = os.getenv('SALESDASH_API_URL')
SALESDASH_API_KEY = os.getenv('SALESDASH_API_KEY')
```

Install python-dotenv:
```bash
pip install python-dotenv
```

---

## 🐛 Troubleshooting

### Error: "Unauthorized - Invalid API key"
- Make sure `INVENTORY_API_KEY` is set in Vercel
- Check that API key matches in Python script
- Verify header name is `X-API-Key` (case-sensitive)

### Error: "Invalid request - trailers array required"
- Make sure you're sending `{ "trailers": [...] }` format
- Check that `trailers` is an array, not a single object

### Error: "VIN is required"
- Every trailer must have a `vin` field
- VIN cannot be empty or null

### Trailers Not Showing Up
- Check Vercel logs for errors
- Verify trailer data format matches schema
- Check that `status` is "available" (or it won't show in inventory)

---

## 📈 Success Metrics

Once working, you should see:
- ✅ 405 trailers in SalesDash inventory
- ✅ Diamond Cargo: 160 trailers
- ✅ Quality Cargo: 107 trailers
- ✅ Panther Cargo: 138 trailers
- ✅ All prices, dimensions, features imported
- ✅ Ready for VIN image matching (Phase 3)

---

## 🔄 Automation Options

### Option 1: Manual Run (Current)
```bash
python import_inventory.py
```

### Option 2: Daily Cron Job (Recommended)
```bash
# Run daily at 3 AM
0 3 * * * cd /path/to/scripts && python import_inventory.py
```

### Option 3: Email Trigger (Advanced)
Use your `fetch_emails.py` script to:
1. Check for new inventory emails
2. Extract attachments
3. Run import script
4. Send to SalesDash

---

## 📁 Complete Example Script

Here's a full example showing how to integrate:

```python
#!/usr/bin/env python3
"""
Import inventory from Excel files and send to SalesDash
"""

import requests
import json
import pandas as pd
from datetime import datetime

# Configuration
SALESDASH_API_URL = "https://your-app.vercel.app/api/inventory/bulk-import"
SALESDASH_API_KEY = "your-api-key-here"

def send_to_salesdash(trailers, source_name):
    """Send trailers to SalesDash API"""
    headers = {
        'X-API-Key': SALESDASH_API_KEY,
        'Content-Type': 'application/json'
    }

    payload = {
        'trailers': trailers,
        'source': source_name
    }

    print(f"📤 Sending {len(trailers)} trailers to SalesDash...")

    try:
        response = requests.post(
            SALESDASH_API_URL,
            headers=headers,
            json=payload,
            timeout=300
        )

        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCCESS!")
            print(f"   Created: {result['stats']['created']}")
            print(f"   Updated: {result['stats']['updated']}")
            print(f"   Skipped: {result['stats']['skipped']}")
            print(f"   Errors: {result['stats']['errors']}")
            return result
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"   {response.text}")
            return None

    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return None

def parse_diamond_cargo(excel_file):
    """Parse Diamond Cargo Excel file"""
    df = pd.read_excel(excel_file)
    trailers = []

    for _, row in df.iterrows():
        trailer = {
            "vin": str(row['VIN']),
            "manufacturer": "Diamond Cargo",
            "model": str(row['Model']),
            "year": 2025,
            "category": "Enclosed",
            "length": float(row['Length']),
            "width": float(row['Width']),
            "msrp": float(row['MSRP']),
            "salePrice": float(row['Sale Price']),
            "stockNumber": f"DC-{row['VIN']}",
            # Add more fields as needed
        }
        trailers.append(trailer)

    return trailers

def main():
    print("═══════════════════════════════════════════")
    print("  Remotive Logistics Inventory Import to SalesDash")
    print("═══════════════════════════════════════════\n")

    # Import Diamond Cargo
    print("📦 Processing Diamond Cargo...")
    diamond_trailers = parse_diamond_cargo('diamond_cargo.xlsx')
    diamond_result = send_to_salesdash(diamond_trailers, 'diamond_cargo')

    # Import Quality Cargo
    print("\n📦 Processing Quality Cargo...")
    quality_trailers = parse_diamond_cargo('quality_cargo.xlsx')
    quality_result = send_to_salesdash(quality_trailers, 'quality_cargo')

    # Import Panther Cargo
    print("\n📦 Processing Panther Cargo...")
    panther_trailers = parse_diamond_cargo('panther_cargo.xlsx')
    panther_result = send_to_salesdash(panther_trailers, 'panther_cargo')

    print("\n═══════════════════════════════════════════")
    print("  ✅ All Imports Complete!")
    print("═══════════════════════════════════════════\n")

if __name__ == "__main__":
    main()
```

---

**Next Step:** Set up Cloudinary for VIN image matching! 🚀
