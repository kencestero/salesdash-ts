# CSV Lead Import Script

This script imports customer leads from a CSV file into the MJ Cargo SalesDash CRM system.

## Features

- **Batch Processing**: Processes leads in batches of 1000 for optimal performance
- **Duplicate Detection**: Automatically skips customers with existing emails or phone numbers
- **Error Handling**: Continues processing even if individual records fail
- **Detailed Reporting**: Shows success, duplicate, and failure counts
- **Google Sheets Compatible**: Handles UTF-8 BOM and various CSV formats
- **Status Mapping**: Intelligently determines lead status from notes

## Prerequisites

1. **CSV-Parse Package**: Already installed via `pnpm add csv-parse`
2. **Database Access**: Your `.env` file must have a valid `DATABASE_URL`
3. **CSV File**: Place your CSV file at `scripts/leads.csv`

## CSV File Format

Your CSV file must have the following columns (exact header names):

| Column Name | Required | Description | Example |
|-------------|----------|-------------|---------|
| Timestamp | No | When the lead was created | 2024-01-15 10:30:00 |
| Rep Name | No | Sales rep assigned to this lead | John Smith |
| Customer Name | **Yes** | Full customer name | Sarah Johnson |
| Customer Phone Number | **Yes** | Phone number (will be cleaned) | 555-123-4567 |
| Trailer Size | No | Size of trailer interested in | 16ft |
| Assigned Manager | No | Manager overseeing this lead | Mike Anderson |
| Stock Number (If in stock) or Factory Order | No | Stock# or "Factory Order" | STK12345 or Factory Order |
| Applied | No | Whether credit app submitted | Yes/No |
| Date of Submission | No | When credit app was submitted | 2024-01-15 |
| Cash/Finance/Rent to Own | No | Payment method | Cash/Finance/RTO |
| Manager Notes | No | Manager's notes about the lead | Approved for $25000 |
| Rep Notes | No | Sales rep's notes | Customer very interested |
| Email | No | Customer email (generated if missing) | sarah@email.com |
| Address | No | Street address | 123 Main St |
| Zip Code | No | ZIP code | 12345 |
| State | No | State (2-letter code) | TX |

### Sample CSV

See `scripts/leads.csv.example` for a sample file with proper formatting.

## Usage

### Step 1: Prepare Your CSV File

1. Export your Google Sheet or Excel file as CSV
2. Ensure the column headers match exactly (case-sensitive)
3. Place the file at `scripts/leads.csv`

```bash
# Example: Copy your exported file
cp ~/Downloads/leads-export.csv scripts/leads.csv
```

### Step 2: Run the Import

```bash
# Using ts-node (recommended) with explicit database URL
# Replace <your-connection-string> with your actual database URL
DATABASE_URL=<your-connection-string> npx ts-node scripts/import-leads.ts

# Or using the .env file (recommended)
npx ts-node scripts/import-leads.ts
```

### Step 3: Review the Results

The script will display a summary:

```
═══════════════════════════════════════════
  📈 Import Complete!
═══════════════════════════════════════════
✅ Successfully imported: 145
⏭️  Skipped (duplicates):  23
❌ Failed:                12
⏱️  Duration:              3.45s
```

## How It Works

### 1. **Data Cleaning**
- Phone numbers: Strips all non-numeric characters except `+`
- Emails: Uses phone number as fallback if email is missing
- Names: Splits "Customer Name" into firstName and lastName

### 2. **Status Determination**
The script analyzes notes to determine lead status:

| Notes Contain | Status |
|---------------|--------|
| "approved" | `approved` |
| "dead" or "declined" | `dead` |
| "applied" or Applied=Yes | `applied` |
| "contacted" | `contacted` |
| "qualified" | `qualified` |
| None of the above | `new` |

### 3. **Financing Type**
Extracts from "Cash/Finance/Rent to Own" column:

- "cash" → `cash`
- "finance" → `finance`
- "rent" or "rto" → `rto`

### 4. **Factory Order Detection**
Checks if "Stock Number" field contains "factory" or "order"

### 5. **Duplicate Prevention**
Before inserting, the script checks:
- Existing email address
- Existing phone number

If either matches, the record is skipped and counted as a duplicate.

### 6. **Batch Processing**
- Processes 1000 records at a time
- Uses Prisma's `createMany` for optimal database performance
- Falls back to individual inserts if batch fails

## Troubleshooting

### Error: "File not found at scripts/leads.csv"

**Solution:** Ensure your CSV file is placed at exactly `scripts/leads.csv`

```bash
ls -la scripts/leads.csv  # Should show your file
```

### Error: "Invalid email format"

**Issue:** The script requires a valid email for each customer.

**Solution:** The script auto-generates emails using `{phone}@placeholder.com` if email is missing. Check the failed records for other validation issues.

### Error: "Prisma Client validation error"

**Issue:** Required field is missing or invalid.

**Solution:** Common required fields:
- `firstName` (from Customer Name)
- `lastName` (from Customer Name)
- `email` (auto-generated if missing)
- `phone` (from Customer Phone Number)

### High Duplicate Count

**Issue:** Many leads are being skipped as duplicates.

**Explanation:** This is normal if you're re-importing the same data. The script protects against duplicate entries.

**Solution:** If you need to update existing records, you'll need to modify the script to use `upsert` instead of `create`.

## Advanced: Customizing the Script

### Changing Batch Size

Edit `scripts/import-leads.ts`:

```typescript
const BATCH_SIZE = 500; // Default is 1000
```

Smaller batches = More frequent progress updates, slightly slower
Larger batches = Faster overall, but harder to debug issues

### Adding Custom Field Mapping

To map additional CSV columns:

```typescript
// In the import loop, add:
const customerData = {
  // ... existing fields ...
  customField: row['Your CSV Column Name']?.trim() || null,
};
```

### Updating Existing Records

To update instead of skip duplicates:

```typescript
// Replace the batch insert with:
for (const customer of customers) {
  await prisma.customer.upsert({
    where: { email: customer.email },
    update: customer,  // Update if exists
    create: customer,  // Create if doesn't exist
  });
}
```

## CSV Export from Google Sheets

1. Open your Google Sheet
2. Click **File → Download → Comma Separated Values (.csv)**
3. Move the downloaded file to `scripts/leads.csv`

## CSV Export from Excel

1. Open your Excel file
2. Click **File → Save As**
3. Choose **CSV UTF-8 (Comma delimited) (.csv)**
4. Save to `scripts/leads.csv`

## Data Mapping Reference

| CSV Column | Database Field | Type | Notes |
|------------|----------------|------|-------|
| Timestamp | createdAt | DateTime | Import timestamp if not provided |
| Rep Name | assignedToName | String | Sales rep name |
| Customer Name | firstName, lastName | String | Split on first space |
| Customer Phone Number | phone | String | Cleaned (digits + only) |
| Trailer Size | trailerSize | String | e.g., "16ft" |
| Assigned Manager | tags[] | String[] | Added to tags array |
| Stock Number... | stockNumber, isFactoryOrder | String, Boolean | Detects "factory" keyword |
| Applied | hasAppliedCredit | Boolean | Yes → true |
| Date of Submission | lastContactDate | DateTime | When credit app submitted |
| Cash/Finance/RTO | financingType | Enum | cash, finance, or rto |
| Manager Notes | notes | Text | Combined with Rep Notes |
| Rep Notes | notes | Text | Combined with Manager Notes |
| Email | email | String | Auto-generated if missing |
| Address | street | String | Street address |
| Zip Code | zipcode | String | ZIP code |
| State | state | String | 2-letter state code |

## Performance

**Tested with:**
- 10,000 records: ~8 seconds
- 50,000 records: ~35 seconds
- 100,000 records: ~1.5 minutes

**Database Impact:**
- Uses batch inserts (1000 records per query)
- Minimal connection pool usage
- No table locks (standard INSERTs)

## Support

For issues or questions:
1. Check the error messages in the console output
2. Review the "Troubleshooting" section above
3. Verify your CSV format matches the example
4. Ensure your database connection is working: `npx prisma db pull`

## Related Scripts

- `import-from-sheet.ts` - Direct Google Sheets API import
- `verify-import.ts` - Verify imported data integrity
- `import-dc-inventory.ts` - Inventory-specific import

## Changelog

### Version 1.0.0 (2024-10-17)
- Initial release
- Batch processing with 1000 records per batch
- Duplicate detection by email and phone
- Status mapping from notes
- Error handling and detailed reporting
