import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/inventory/upload-pdf
 *
 * Accepts a PDF file containing trailer inventory data,
 * uses OpenAI to extract structured data, and inserts
 * the trailers into the database.
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

    // 2. Check user role - only owners and directors can upload PDFs
    const userRole = (session.user as any).role;
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden - Only owners and directors can upload inventory PDFs' },
        { status: 403 }
      );
    }

    console.log('📄 PDF Upload Request from user:', session.user.email, `(${userRole})`);

    // 2. Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    console.log('📄 Processing PDF:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);

    // 4. Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      const pdfData = await pdf(buffer);
      pdfText = pdfData.text;
      console.log('✅ PDF text extracted:', pdfText.substring(0, 200) + '...');
    } catch (pdfError) {
      console.error('❌ PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF. Please ensure the file is not corrupted.' },
        { status: 400 }
      );
    }

    // 5. Use OpenAI to extract structured inventory data
    console.log('🤖 Sending to OpenAI for structured extraction...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for better accuracy
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting cargo trailer inventory data from text.

Your task is to parse the provided inventory list and extract structured data for each trailer.

Extract the following fields for each trailer:
- manufacturer: string (default to "MJ Cargo" if not specified)
- model: string (the full model description, e.g., "7X16TA2 Black .080 R VN 7'")
- year: number (default to current year if not specified)
- category: string (one of: "Utility", "Dump", "Enclosed", "Gooseneck", "Flatbed", "Car Hauler", "Concession", "Motorcycle")
- length: number (in feet, extract from model if needed)
- width: number (in feet, extract from model if needed)
- height: number or null (interior height in feet if specified)
- msrp: number (manufacturer's suggested retail price)
- salePrice: number (current sale price - use MSRP if not specified)
- cost: number (dealer cost - estimate 70% of MSRP if not specified)
- status: string (default "available")
- location: string or null (physical location like "Main Lot", "Back Lot")
- features: string[] (array of features like ["Ramp Door", "V-Nose", etc.])
- description: string or null (any additional description)

IMPORTANT:
- Generate unique VINs in the format: 1MJ[TYPE][WIDTH]X[LENGTH]P1[6-digit-sequential]
  (e.g., 1MJTA7X16P1000001 for a tandem axle 7x16)
- Generate unique stock numbers in format: MJ-YYYY-XXX (e.g., MJ-2025-001)
- Start stock numbers from MJ-${new Date().getFullYear()}-100 and increment
- For axles: SA = Single Axle, TA2 = Tandem (2 axles), TA3 = Triple axle
- Extract dimensions from model strings (e.g., "7X16" means 7 feet wide, 16 feet long)
- If price is not specified, estimate reasonable prices based on trailer size/type
- Parse color information from model strings

Return ONLY a valid JSON array of trailer objects. No markdown, no explanations, just the JSON array.`,
        },
        {
          role: 'user',
          content: `Extract all trailers from this inventory list:\n\n${pdfText}`,
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

    // 6. Parse the JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);

      // Handle different response formats
      let trailers = parsedData.trailers || parsedData.data || parsedData;

      if (!Array.isArray(trailers)) {
        throw new Error('Response is not an array');
      }

      console.log(`✅ Parsed ${trailers.length} trailers from OpenAI response`);

      // 7. Validate and insert trailers into database
      const results = {
        success: [] as any[],
        errors: [] as any[],
      };

      for (let i = 0; i < trailers.length; i++) {
        const trailerData = trailers[i];

        try {
          // Validate required fields
          const required = ['vin', 'stockNumber', 'manufacturer', 'model', 'year', 'category', 'length', 'width', 'msrp', 'salePrice', 'cost'];
          const missing = required.filter(field => !trailerData[field]);

          if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
          }

          // Check if VIN or stock number already exists
          const existing = await prisma.trailer.findFirst({
            where: {
              OR: [
                { vin: trailerData.vin },
                { stockNumber: trailerData.stockNumber },
              ],
            },
          });

          if (existing) {
            results.errors.push({
              trailer: trailerData,
              error: `Duplicate: VIN or Stock Number already exists (${existing.stockNumber})`,
            });
            continue;
          }

          // Insert trailer
          const trailer = await prisma.trailer.create({
            data: {
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
              msrp: parseFloat(trailerData.msrp),
              salePrice: parseFloat(trailerData.salePrice),
              cost: parseFloat(trailerData.cost),
              status: trailerData.status || 'available',
              location: trailerData.location || null,
              images: trailerData.images || [],
              description: trailerData.description || null,
              features: trailerData.features || [],
              createdBy: session.user.id,
            },
          });

          results.success.push(trailer);
          console.log(`✅ Created trailer: ${trailer.stockNumber}`);
        } catch (error: any) {
          console.error(`❌ Failed to create trailer #${i}:`, error.message);
          results.errors.push({
            trailer: trailerData,
            error: error.message,
          });
        }
      }

      // 8. Return results
      return NextResponse.json({
        message: `Successfully processed ${results.success.length} trailers`,
        success: results.success,
        errors: results.errors,
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
    console.error('❌ PDF upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process PDF',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
