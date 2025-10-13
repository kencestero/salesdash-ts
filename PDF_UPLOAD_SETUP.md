# PDF Inventory Upload Feature Setup Guide

## Overview

This feature allows you to upload a PDF containing your trailer inventory list. The system uses OpenAI's GPT-4o to automatically extract structured data from the PDF and insert trailers directly into your database.

## Features

- **AI-Powered Extraction**: Automatically parses trailer information from unstructured PDF text
- **Smart Field Detection**: Extracts model, dimensions, pricing, features, and more
- **Duplicate Prevention**: Skips trailers with existing VINs or stock numbers
- **Batch Import**: Upload and import multiple trailers at once
- **Error Reporting**: Shows detailed results for successful and failed imports
- **Auto-Generated IDs**: Creates unique VINs and stock numbers automatically

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click **"Create new secret key"**
4. Name it something like "MJ Cargo Inventory Parser"
5. Copy the key (starts with `sk-...`)
6. **IMPORTANT**: Save it immediately - you can't view it again!

### 2. Add to Local Environment

Edit your `.env` file (or `.env.local`):

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Add to Vercel (Production)

1. Go to [https://vercel.com/kencestero-7874s-projects/salesdash-ts/settings/environment-variables](https://vercel.com/kencestero-7874s-projects/salesdash-ts/settings/environment-variables)
2. Click **"Add New"**
3. Name: `OPENAI_API_KEY`
4. Value: `sk-your-actual-key-here`
5. Select: **"All Environments"** (or just Production)
6. Click **"Save"**

### 4. Redeploy

After adding the environment variable to Vercel:

```bash
git commit --allow-empty -m "trigger redeploy for OpenAI env"
git push
```

Or use Vercel Dashboard:
- Go to **Deployments**
- Click the 3 dots on the latest deployment
- Click **"Redeploy"**

## How to Use

### 1. Navigate to Inventory Page

Go to: `https://salesdash-ts.vercel.app/en/dashboard/inventory`

### 2. Click "Upload PDF" Button

Located in the top-right corner, next to "Add Trailer"

### 3. Select Your PDF

- Click the upload area or drag and drop
- Must be a PDF file
- Can contain multiple trailers

### 4. AI Processing

The system will:
1. Extract text from the PDF
2. Send it to OpenAI GPT-4o
3. Parse structured trailer data
4. Insert each trailer into the database
5. Skip duplicates (existing VINs/stock numbers)

### 5. Review Results

The modal will show:
- **Total**: Number of trailers found in PDF
- **Success**: Successfully imported
- **Failed**: Errors (with reasons)

## Supported Data Fields

The AI automatically extracts:

### Required Fields
- **manufacturer**: Trailer manufacturer (defaults to "MJ Cargo")
- **model**: Full model description (e.g., "7X16TA2 Black .080 R VN 7'")
- **year**: Model year (defaults to current year)
- **category**: Type (Utility, Dump, Enclosed, Gooseneck, etc.)
- **length**: Length in feet
- **width**: Width in feet
- **msrp**: Manufacturer's suggested retail price
- **salePrice**: Current sale price
- **cost**: Dealer cost

### Optional Fields
- **height**: Interior height in feet
- **gvwr**: Gross Vehicle Weight Rating (lbs)
- **capacity**: Payload capacity (lbs)
- **axles**: Number of axles
- **location**: Physical location (e.g., "Main Lot")
- **features**: Array of features (e.g., ["Ramp Door", "V-Nose"])
- **description**: Additional description

### Auto-Generated Fields
- **vin**: Unique VIN (format: 1MJ[TYPE][WIDTH]X[LENGTH]P1[6-digit-seq])
- **stockNumber**: Stock number (format: MJ-YYYY-XXX)
- **status**: Defaults to "available"
- **createdBy**: Automatically set to logged-in user
- **createdAt**: Timestamp

## PDF Format Examples

The AI can handle various PDF formats. Here are examples:

### Format 1: Structured List
```
7X16TA2 Black .080 R VN 7' - $5,799 MSRP
Features: Ramp Door, V-Nose, Black Polycore, 7' Interior
Location: Main Lot

8.5X20TA2 White .030 R VN 7' - $7,799 MSRP
Features: Ramp Door, V-Nose, White, 7' Interior
Location: Main Lot
```

### Format 2: Table Format
```
Model                          | MSRP    | Sale Price | Location
7X16TA2 Black .080 R VN 7'    | $5,799  | $5,299     | Main Lot
8.5X20TA2 White .030 R VN 7'  | $7,799  | $7,299     | Main Lot
```

### Format 3: Detailed Descriptions
```
Trailer 1:
Model: 7X16TA2 Black .080 R VN 7'
Dimensions: 7' x 16' x 7' interior
Price: $5,799 MSRP / $5,299 Sale
Features: Ramp door, V-nose, Black polycore exterior
Axles: Tandem (2x 3500lb)
```

**The AI is smart enough to handle all these formats and more!**

## Troubleshooting

### Error: "Unauthorized"
- Make sure you're logged in
- Session may have expired - refresh and log in again

### Error: "Invalid file type"
- Only PDF files are supported
- Check that the file extension is `.pdf`

### Error: "Failed to parse PDF"
- PDF might be corrupted - try re-downloading or re-creating it
- Scanned PDFs might have issues - ensure text is selectable

### Error: "Failed to send verification email"
Wait, this is the wrong error! This is from the email system, not PDF upload.

Let me check if you're on the wrong page or if there's an issue with the code.

### High number of failed imports
- Check that PDF contains clear, structured data
- Ensure prices are formatted consistently
- Review error messages for specific issues

### Duplicates being skipped
- This is intentional to prevent duplicate inventory
- Check if trailers already exist with same VIN or stock number
- Update existing trailers manually if needed

## API Endpoint

**Endpoint**: `POST /api/inventory/upload-pdf`

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "message": "Successfully processed 10 trailers",
  "success": [...],
  "errors": [...],
  "summary": {
    "total": 15,
    "successful": 10,
    "failed": 5
  }
}
```

## Cost Estimation

OpenAI GPT-4o pricing (as of 2025):
- **Input**: ~$2.50 per 1M tokens
- **Output**: ~$10 per 1M tokens

**Estimated cost per PDF**:
- Small PDF (10 trailers, ~2K tokens): **$0.01**
- Medium PDF (50 trailers, ~10K tokens): **$0.05**
- Large PDF (200 trailers, ~40K tokens): **$0.20**

**This is extremely affordable for the automation it provides!**

## Security Notes

- **API Key**: Never commit your OpenAI API key to git
- **Access Control**: Only authenticated users can upload PDFs
- **Duplicate Prevention**: System checks for existing VINs/stock numbers
- **Error Handling**: Gracefully handles malformed data without crashing

## Future Enhancements

Potential improvements:
- [ ] Support for Excel/CSV files
- [ ] Image recognition for PDF images (OCR)
- [ ] Batch update existing trailers
- [ ] Custom field mapping
- [ ] Template-based extraction
- [ ] Automatic price estimation
- [ ] Competitor pricing comparison

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test with a simple PDF containing 1-2 trailers first
4. Contact the developer with the PDF file and error details

---

**Created**: 2025-10-13
**Last Updated**: 2025-10-13
**Status**: ✅ Production Ready
