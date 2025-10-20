/**
 * Bulk Inventory Import API
 *
 * Accepts trailer data from Python automation scripts
 * Protected with API key authentication
 *
 * POST /api/inventory/bulk-import
 *
 * Example Python usage:
 *   import requests
 *   response = requests.post(
 *     'https://your-app.vercel.app/api/inventory/bulk-import',
 *     headers={'X-API-Key': 'your-api-key'},
 *     json={'trailers': [...]}
 *   )
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BulkImportTrailer {
  vin: string;
  stockNumber?: string;
  manufacturer: string;
  model: string;
  year: number;
  category: string;

  // Dimensions
  length: number;
  width: number;
  height?: number;
  gvwr?: number;
  capacity?: number;
  axles?: number;

  // Pricing
  msrp: number;
  salePrice: number;
  cost?: number;
  makeOffer?: boolean;

  // Details
  status?: string;
  location?: string;
  description?: string;
  features?: string[];
  images?: string[];

  // Source tracking
  source?: string;
  importedBy?: string;
}

interface BulkImportRequest {
  trailers: BulkImportTrailer[];
  source?: string; // 'diamond_cargo', 'quality_cargo', 'panther_cargo'
}

interface ImportStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{
    vin: string;
    error: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // API Key Authentication
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = process.env.INVENTORY_API_KEY;

    if (!validApiKey) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: BulkImportRequest = await req.json();
    const { trailers, source } = body;

    if (!trailers || !Array.isArray(trailers)) {
      return NextResponse.json(
        { error: 'Invalid request - trailers array required' },
        { status: 400 }
      );
    }

    console.log(`📦 Bulk import started: ${trailers.length} trailers from ${source || 'unknown'}`);
    const startTime = Date.now();

    const stats: ImportStats = {
      total: trailers.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
    };

    // Process each trailer
    for (const trailer of trailers) {
      try {
        // Validate required fields
        if (!trailer.vin) {
          stats.errors++;
          stats.errorDetails.push({
            vin: 'MISSING',
            error: 'VIN is required',
          });
          continue;
        }

        // Check if trailer already exists
        const existing = await prisma.trailer.findFirst({
          where: {
            OR: [
              { vin: trailer.vin },
              { stockNumber: trailer.stockNumber || '' },
            ],
          },
        });

        if (existing) {
          // Trailer exists - check if we should update it
          const shouldUpdate =
            trailer.salePrice !== existing.salePrice ||
            trailer.status !== existing.status ||
            trailer.location !== existing.location;

          if (shouldUpdate) {
            await prisma.trailer.update({
              where: { id: existing.id },
              data: {
                // Update price if changed
                salePrice: trailer.salePrice,
                msrp: trailer.msrp,
                cost: trailer.cost || existing.cost,

                // Update status/location
                status: trailer.status || existing.status,
                location: trailer.location || existing.location,

                // Update features if provided
                features: trailer.features || existing.features,
                description: trailer.description || existing.description,

                updatedAt: new Date(),
              },
            });
            stats.updated++;
            console.log(`✏️  Updated: ${trailer.vin} - ${trailer.manufacturer} ${trailer.model}`);
          } else {
            stats.skipped++;
          }
        } else {
          // New trailer - create it
          await prisma.trailer.create({
            data: {
              vin: trailer.vin,
              stockNumber: trailer.stockNumber || `${source?.toUpperCase().replace('_', '-')}-${trailer.vin}`,

              // Basic info
              manufacturer: trailer.manufacturer,
              model: trailer.model,
              year: trailer.year,
              category: trailer.category,

              // Dimensions
              length: trailer.length,
              width: trailer.width,
              height: trailer.height || 7,
              gvwr: trailer.gvwr,
              capacity: trailer.capacity,
              axles: trailer.axles,

              // Pricing
              msrp: trailer.msrp,
              salePrice: trailer.salePrice,
              cost: trailer.cost || trailer.salePrice * 0.8,
              makeOffer: trailer.makeOffer || false,

              // Status & location
              status: trailer.status || 'available',
              location: trailer.location || 'Main Lot',

              // Details
              description: trailer.description || `${trailer.manufacturer} ${trailer.model} ${trailer.category} Trailer`,
              features: trailer.features || [],
              images: trailer.images || [],

              // Metadata
              createdBy: trailer.importedBy || 'python_script',
            },
          });
          stats.created++;
          console.log(`✅ Created: ${trailer.vin} - ${trailer.manufacturer} ${trailer.model}`);
        }
      } catch (error) {
        stats.errors++;
        stats.errorDetails.push({
          vin: trailer.vin || 'UNKNOWN',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Error processing ${trailer.vin}:`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Bulk Import Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total Trailers:   ${stats.total}`);
    console.log(`✅ Created:          ${stats.created}`);
    console.log(`✏️  Updated:          ${stats.updated}`);
    console.log(`⏭️  Skipped:          ${stats.skipped}`);
    console.log(`❌ Errors:           ${stats.errors}`);
    console.log(`⏱️  Duration:         ${duration}s`);
    console.log('═══════════════════════════════════════════\n');

    return NextResponse.json({
      success: true,
      message: 'Bulk import completed',
      stats,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('💥 Fatal error in bulk import:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test if API is working
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.INVENTORY_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid API key' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Bulk Import API is working',
    endpoint: '/api/inventory/bulk-import',
    method: 'POST',
    authHeader: 'X-API-Key',
    timestamp: new Date().toISOString(),
  });
}
