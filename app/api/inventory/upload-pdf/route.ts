import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import * as pdf from 'pdf-parse';
import * as XLSX from 'xlsx';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/inventory/upload-pdf
 *
 * Accepts PDF, Excel (.xlsx), or CSV files containing trailer inventory data,
 * uses OpenAI to extract structured data, and inserts the trailers into the database.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Check user role - only owners and directors can upload files
    const userRole = (session.user as any).role;
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden - Only owners and directors can upload inventory files' },
        { status: 403 }
      );
    }

    console.log('📄 File Upload Request from user:', session.user.email, `(${userRole})`);

    // 3. Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 4. Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
    ];

    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.pdf') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');

    if (!validTypes.includes(file.type) && !isValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, Excel (.xlsx), or CSV file.' },
        { status: 400 }
      );
    }

    console.log('📄 Processing file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`, `Type: ${file.type}`);

    // 5. Extract text based on file type
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText: string = '';

    try {
      if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        // PDF Processing
        console.log('📄 Processing as PDF...');
        const pdfData = await pdf.default(buffer);
        extractedText = pdfData.text;
        console.log('✅ PDF text extracted:', extractedText.substring(0, 200) + '...');
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls')
      ) {
        // Excel Processing
        console.log('📊 Processing as Excel...');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV format first for better AI parsing
        const csvData = XLSX.utils.sheet_to_csv(worksheet);

        // Also get JSON for direct parsing if structure is clear
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        extractedText = `Excel Spreadsheet Data:\n\n${csvData}\n\nJSON Format:\n${JSON.stringify(jsonData, null, 2)}`;
        console.log('✅ Excel data extracted:', extractedText.substring(0, 200) + '...');
      } else if (file.type === 'text/csv' || fileName.endsWith('.csv')) {
        // CSV Processing
        console.log('📄 Processing as CSV...');
        extractedText = buffer.toString('utf-8');
        console.log('✅ CSV text extracted:', extractedText.substring(0, 200) + '...');
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (parseError: any) {
      console.error('❌ File parsing error:', parseError);
      return NextResponse.json(
        { error: `Failed to parse file. Please ensure the file is not corrupted. Error: ${parseError.message}` },
        { status: 400 }
      );
    }

    // 6. Use OpenAI to extract structured inventory data
    console.log('🤖 Sending to OpenAI for structured extraction...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for better accuracy
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting cargo trailer inventory data from various file formats (PDF, Excel, CSV).

Your task is to parse the provided inventory list and extract structured data for each trailer.

Extract the following fields for each trailer:
- manufacturer: string (look for "Diamond Cargo", "Quality Cargo", or default to "MJ Cargo" if not specified)
- model: string (the full model description, e.g., "7X16TA2 Black .080 R VN 7'")
- year: number (default to current year if not specified)
- category: string (one of: "Utility", "Dump", "Enclosed", "Gooseneck", "Flatbed", "Car Hauler", "Concession", "Motorcycle")
- length: number (in feet, extract from model if needed)
- width: number (in feet, extract from model if needed)
- height: number or null (interior height in feet if specified)
- msrp: number (manufacturer's suggested retail price)
- salePrice: number (current sale price - use MSRP if not specified)
- cost: number (dealer cost - this is the ACTUAL wholesale cost price from the manufacturer)
- status: string (default "available")
- location: string or null (physical location like "Main Lot", "Back Lot")
- features: string[] (array of features like ["Ramp Door", "V-Nose", etc.])
- description: string or null (any additional description from NOTES/OPTIONS column)

PRICE EXTRACTION RULES - CRITICAL FOR DIAMOND CARGO:
Column structure is ALWAYS: [VIN #] [MODEL] [EXT COLOR] [REAR] [FRONT] [HT] [PRICE] [NEW DISC'D PRICE] [FINISH DATE] [NOTES/OPTIONS]

PRICING LOGIC:
1. **COST field**: ALWAYS extract from "PRICE" column (column 7) - this is the wholesale cost in yellow
2. **NEW DISC'D PRICE column** (column 8): Check if it says "MAKE OFFER" or has a numeric value
3. If column 8 = "MAKE OFFER":
   - Set "makeOffer": true
   - Calculate salePrice as: PRICE × 1.25 (for storage only, won't display)
4. If column 8 = numeric value:
   - Set "makeOffer": false
   - Use that value as salePrice

EXAMPLE:
- VIN 96193: PRICE=$10,230, NEW DISC'D PRICE="MAKE OFFER" → cost=$10,230, makeOffer=true
- VIN 116315: PRICE=$7,115, NEW DISC'D PRICE=$7,115 → cost=$7,115, salePrice=$7,115, makeOffer=false

NEVER extract cost from any column other than "PRICE" column!

IMPORTANT:
- For VIN: If there's a VIN in the data, use it. Otherwise generate: 1MJ[TYPE][WIDTH]X[LENGTH]P1[6-digit-sequential]
  (e.g., 1MJTA7X16P1000001 for a tandem axle 7x16)
- For Stock Number: Use the stock number from the file (like DC-116865 for Diamond Cargo, QC-12345 for Quality Cargo)
  If not present, generate: MJ-${new Date().getFullYear()}-XXX
- For axles: SA = Single Axle, TA2 = Tandem (2 axles), TA3 = Triple axle, TA4 = Tandem with 6000lb axles
- Extract dimensions from model strings (e.g., "7X16" means 7 feet wide, 16 feet long)
- Parse color information from model strings
- COST is the dealer's wholesale price (what they pay the manufacturer)
- Look for NOTES/OPTIONS column and include all that information in the description field
- Detect manufacturer from stock number prefix: DC- = Diamond Cargo, QC- = Quality Cargo

Return ONLY a valid JSON object with a "trailers" array. No markdown, no explanations, just the JSON.
Format: { "trailers": [ {...}, {...} ] }`,
        },
        {
          role: 'user',
          content: `Extract all trailers from this inventory data:\n\n${extractedText}`,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('OpenAI returned empty response');
    }

    console.log('🤖 OpenAI response received:', responseText.substring(0, 200) + '...');

    // 7. Parse the JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);

      // Handle different response formats
      let trailers = parsedData.trailers || parsedData.data || parsedData;

      if (!Array.isArray(trailers)) {
        throw new Error('Response is not an array');
      }

      console.log(`✅ Parsed ${trailers.length} trailers from OpenAI response`);

      // 8. Determine the manufacturer from the uploaded data
      const uploadStartTime = Date.now();
      const uploadedManufacturer = trailers[0]?.manufacturer || 'Unknown';
      console.log(`📊 Detected manufacturer: ${uploadedManufacturer}`);

      // 9. Get all existing trailers for this manufacturer
      const existingTrailers = await prisma.trailer.findMany({
        where: {
          manufacturer: {
            contains: uploadedManufacturer.split(' ')[0], // Match "Diamond" from "Diamond Cargo"
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          vin: true,
          stockNumber: true,
        },
      });

      console.log(`📊 Found ${existingTrailers.length} existing ${uploadedManufacturer} trailers in database`);

      // 10. Build comparison maps
      const existingVinMap = new Map(existingTrailers.map((t) => [t.vin, t]));
      const uploadedVins = new Set(trailers.map((t: any) => t.vin));

      const newVins: string[] = [];
      const updatedVins: string[] = [];
      const removedVins: string[] = [];

      // Find removed trailers (in DB but not in upload)
      for (const existing of existingTrailers) {
        if (!uploadedVins.has(existing.vin)) {
          removedVins.push(existing.vin);
        }
      }

      console.log(`📊 Comparison:
        - New trailers: ${trailers.filter((t: any) => !existingVinMap.has(t.vin)).length}
        - Updated trailers: ${trailers.filter((t: any) => existingVinMap.has(t.vin)).length}
        - Removed trailers: ${removedVins.length}`);

      // 11. Process trailers (insert new or update existing)
      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      for (let i = 0; i < trailers.length; i++) {
        const trailerData = trailers[i];

        try {
          // Validate required fields
          const required = ['vin', 'stockNumber', 'manufacturer', 'model', 'year', 'category', 'length', 'width', 'cost'];
          const missing = required.filter(field => !trailerData[field]);

          if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
          }

          const trailerPayload = {
            vin: trailerData.vin,
            stockNumber: trailerData.stockNumber,
            manufacturer: trailerData.manufacturer,
            model: trailerData.model,
            year: parseInt(trailerData.year),
            category: trailerData.category,
            length: parseFloat(trailerData.length),
            width: parseFloat(trailerData.width),
            height: trailerData.height ? parseFloat(trailerData.height) : null,
            gvwr: trailerData.gvwr ? parseInt(trailerData.gvwr) : null,
            capacity: trailerData.capacity ? parseInt(trailerData.capacity) : null,
            axles: trailerData.axles ? parseInt(trailerData.axles) : null,
            msrp: trailerData.msrp ? parseFloat(trailerData.msrp) : 0,
            salePrice: trailerData.salePrice ? parseFloat(trailerData.salePrice) : 0,
            cost: parseFloat(trailerData.cost),
            makeOffer: trailerData.makeOffer === true || trailerData.makeOffer === 'true',
            status: trailerData.status || 'available',
            location: trailerData.location || null,
            images: trailerData.images || [],
            description: trailerData.description || null,
            features: trailerData.features || [],
          };

          // Check if trailer exists
          const existingTrailer = existingVinMap.get(trailerData.vin);

          if (existingTrailer) {
            // Update existing trailer
            const trailer = await prisma.trailer.update({
              where: { id: existingTrailer.id },
              data: trailerPayload,
            });

            updatedVins.push(trailer.vin);
            results.success.push({ ...trailer, action: 'updated' });
            console.log(`🔄 Updated trailer: ${trailer.stockNumber}`);
          } else {
            // Create new trailer
            const trailer = await prisma.trailer.create({
              data: {
                ...trailerPayload,
                createdBy: session.user.id,
              },
            });

            newVins.push(trailer.vin);
            results.success.push({ ...trailer, action: 'created' });
            console.log(`✅ Created trailer: ${trailer.stockNumber}`);
          }
        } catch (error: any) {
          console.error(`❌ Failed to process trailer #${i}:`, error.message);
          results.errors.push({
            trailer: trailerData,
            error: error.message,
          });
        }
      }

      const processingTime = Date.now() - uploadStartTime;

      // 12. Create upload report
      const uploadReport = await prisma.uploadReport.create({
        data: {
          fileName: file.name,
          manufacturer: uploadedManufacturer,
          uploadedBy: session.user.id,
          totalInUpload: trailers.length,
          newTrailers: newVins.length,
          updatedTrailers: updatedVins.length,
          removedTrailers: removedVins.length,
          newVins,
          updatedVins,
          removedVins,
          processingTime,
          errors: results.errors.length > 0 ? results.errors : null,
        },
      });

      console.log(`📊 Upload report created: ${uploadReport.id}`);

      // 13. Return results with report
      return NextResponse.json({
        message: `Successfully processed ${results.success.length} trailers`,
        success: results.success,
        errors: results.errors,
        report: {
          id: uploadReport.id,
          fileName: file.name,
          manufacturer: uploadedManufacturer,
          totalInUpload: trailers.length,
          newTrailers: newVins.length,
          updatedTrailers: updatedVins.length,
          removedTrailers: removedVins.length,
          newVins,
          updatedVins,
          removedVins,
          processingTime,
        },
        summary: {
          total: trailers.length,
          successful: results.success.length,
          failed: results.errors.length,
        },
      });
    } catch (parseError: any) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      return NextResponse.json(
        {
          error: 'Failed to parse inventory data from AI response',
          details: parseError.message,
          rawResponse: responseText?.substring(0, 500),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ File upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process file',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
