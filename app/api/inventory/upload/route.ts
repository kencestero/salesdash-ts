import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { getFallbackImages } from '@/lib/images/fallback';
import { computeSellingPrice } from '@/lib/pricing/compute';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/inventory/upload
 *
 * Excel/CSV-only inventory upload with direct column mapping
 * Vendor detection by filename, upsert by VIN (fallback Stock#)
 * Applies $1,500 minimum profit pricing rule
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate (allow user session OR system import header)
    const systemImport = req.headers.get('X-System-Import');
    const session = await getServerSession(authOptions);

    if (!systemImport && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check user role (only owners/directors can manually upload)
    if (!systemImport) {
      const userRole = (session.user as any).role;
      if (userRole !== 'owner' && userRole !== 'director') {
        return NextResponse.json(
          { error: 'Only owners and directors can upload inventory' },
          { status: 403 }
        );
      }
    }

    console.log('📦 Inventory Upload Started');

    // 3. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 4. Validate file type (Excel/CSV only)
    const fileName = file.name.toLowerCase();
    const isValid =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Only Excel (.xlsx) and CSV files are supported' },
        { status: 400 }
      );
    }

    console.log(`📄 Processing: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // 5. Detect vendor from filename
    const vendor = detectVendor(fileName);
    console.log(`🏭 Detected vendor: ${vendor}`);

    // 6. Parse Excel/CSV
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    console.log(`📊 Found ${rawRows.length} rows (including header)`);

    // 7. Parse rows based on vendor
    const trailers = vendor === 'Diamond Cargo'
      ? parseDiamondCargo(rawRows)
      : vendor === 'Quality Cargo'
      ? parseQualityCargo(rawRows)
      : parseDiamondCargo(rawRows); // Default to Diamond format

    console.log(`✅ Parsed ${trailers.length} trailers`);

    // 8. Upsert trailers
    const stats = {
      vendor,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[],
    };

    for (const trailer of trailers) {
      try {
        // Find existing by VIN (preferred) or stockNumber (fallback)
        const existing = await prisma.trailer.findFirst({
          where: {
            OR: [
              { vin: trailer.vin },
              { stockNumber: trailer.stockNumber },
            ],
          },
        });

        // Apply pricing formula: 25% markup OR $1,400 profit minimum
        const pricingResult = computeSellingPrice(trailer.cost);

        // Use computed price if ASK_FOR_PRICING status
        // Otherwise use makeOffer logic or provided salePrice
        const finalSalePrice = pricingResult.pricingStatus === 'ASK_FOR_PRICING'
          ? null
          : (trailer.makeOffer || !trailer.salePrice
              ? pricingResult.price
              : trailer.salePrice);

        const finalPricingStatus = pricingResult.pricingStatus;

        // Use fallback images if no images provided
        const finalImages = trailer.images && trailer.images.length > 0
          ? trailer.images
          : getFallbackImages({
              width: trailer.width,
              length: trailer.length,
              axles: trailer.axles,
              model: trailer.model,
              category: trailer.category,
            });

        const payload = {
          ...trailer,
          salePrice: finalSalePrice,
          pricingStatus: finalPricingStatus,
          images: finalImages,
          status: 'available',
          manufacturer: vendor,
        };

        if (existing) {
          // Update existing
          await prisma.trailer.update({
            where: { id: existing.id },
            data: payload,
          });
          stats.updated++;
          console.log(`🔄 Updated: ${trailer.stockNumber}`);
        } else {
          // Create new
          await prisma.trailer.create({
            data: {
              ...payload,
              createdBy: session?.user?.id || 'system',
            },
          });
          stats.created++;
          console.log(`✅ Created: ${trailer.stockNumber}`);
        }
      } catch (error: any) {
        stats.errors.push({
          stockNumber: trailer.stockNumber,
          vin: trailer.vin,
          error: error.message,
        });
        stats.skipped++;
        console.error(`❌ Error on ${trailer.stockNumber}:`, error.message);
      }
    }

    console.log(`✅ Upload complete: ${stats.created} created, ${stats.updated} updated, ${stats.skipped} skipped`);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Detect vendor from filename
 */
function detectVendor(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('diamond') || lower.includes('dc-') || lower.includes('dc ')) {
    return 'Diamond Cargo';
  }
  if (lower.includes('quality') || lower.includes('qc-') || lower.includes('qc ')) {
    return 'Quality Cargo';
  }
  // Default
  return 'Diamond Cargo';
}

/**
 * Parse Diamond Cargo Excel format
 * Column structure: [VIN #] [MODEL] [EXT COLOR] [REAR] [FRONT] [HT] [PRICE] [NEW DISC'D PRICE] [FINISH DATE] [NOTES/OPTIONS]
 */
function parseDiamondCargo(rows: string[][]): any[] {
  const trailers: any[] = [];

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) continue;

    try {
      const vin = String(row[0] || '').trim();
      const model = String(row[1] || '').trim();
      const extColor = String(row[2] || '').trim();
      const rear = String(row[3] || '').trim();
      const front = String(row[4] || '').trim();
      const height = String(row[5] || '').trim();
      const priceRaw = String(row[6] || '').trim();
      const newPriceRaw = String(row[7] || '').trim();
      const notes = String(row[9] || '').trim();

      if (!vin || !model) continue;

      // Parse dimensions from model (e.g., "7X16TA2")
      const sizeMatch = model.match(/(\d+\.?\d*)X(\d+\.?\d*)/);
      const width = sizeMatch ? parseFloat(sizeMatch[1]) : 7;
      const length = sizeMatch ? parseFloat(sizeMatch[2]) : 16;

      // Parse axles
      let axles = 1;
      if (model.includes('TA')) axles = 2;
      if (model.includes('SA')) axles = 1;

      // Parse height
      const heightMatch = height.match(/(\d+)/);
      const heightNum = heightMatch ? parseFloat(heightMatch[1]) : null;

      // Parse cost (PRICE column = dealer cost)
      const cost = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;

      // Parse NEW DISC'D PRICE column
      const makeOffer = newPriceRaw.toUpperCase().includes('MAKE OFFER');
      let salePrice = 0;
      if (!makeOffer && newPriceRaw) {
        salePrice = parseFloat(newPriceRaw.replace(/[^0-9.]/g, '')) || 0;
      }

      // Generate stock number
      const stockNumber = `DC-${vin}`;

      // Detect category
      let category = 'Enclosed';
      if (model.toLowerCase().includes('dump')) category = 'Dump';
      if (notes.toLowerCase().includes('concession')) category = 'Concession';

      // Year (default to current year)
      const year = new Date().getFullYear();

      trailers.push({
        vin,
        stockNumber,
        model,
        year,
        category,
        width,
        length,
        height: heightNum,
        axles,
        gvwr: null,
        capacity: null,
        msrp: 0,
        salePrice,
        cost,
        makeOffer,
        location: null,
        images: [],
        description: notes || null,
        features: [],
      });
    } catch (error: any) {
      console.error(`❌ Error parsing row ${i}:`, error.message);
    }
  }

  return trailers;
}

/**
 * Parse Quality Cargo Excel format
 * Similar to Diamond Cargo
 */
function parseQualityCargo(rows: string[][]): any[] {
  const trailers: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[0]) continue;

    try {
      const vin = String(row[0] || '').trim();
      const model = String(row[1] || '').trim();
      const priceRaw = String(row[6] || '').trim();

      if (!vin || !model) continue;

      const sizeMatch = model.match(/(\d+\.?\d*)X(\d+\.?\d*)/);
      const width = sizeMatch ? parseFloat(sizeMatch[1]) : 7;
      const length = sizeMatch ? parseFloat(sizeMatch[2]) : 16;

      let axles = 1;
      if (model.includes('TA')) axles = 2;

      const cost = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;
      const stockNumber = `QC-${vin}`;
      const year = new Date().getFullYear();

      trailers.push({
        vin,
        stockNumber,
        model,
        year,
        category: 'Enclosed',
        width,
        length,
        height: null,
        axles,
        gvwr: null,
        capacity: null,
        msrp: 0,
        salePrice: 0,
        cost,
        makeOffer: false,
        location: null,
        images: [],
        description: null,
        features: [],
      });
    } catch (error: any) {
      console.error(`❌ Error parsing Quality row ${i}:`, error.message);
    }
  }

  return trailers;
}
