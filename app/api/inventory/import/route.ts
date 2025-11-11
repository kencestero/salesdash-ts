import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickStandardImage } from "@/lib/inventory/image-map";
import { detectDiamond, normalizeDiamond } from "@/lib/inventory/importers/diamond";
import { detectQuality, normalizeQuality } from "@/lib/inventory/importers/quality";
import { computePrice } from "@/lib/pricing";
import { requireRole } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Find header row in Excel sheet (handles messy sheets with title rows before headers)
 * Scans first 10 rows for a row that contains "MODEL" and either "VIN" or "VIN #"
 * @returns 0-indexed row number of header row (default: 0)
 */
function findHeaderRow(sheet: any[][]): number {
  for (let i = 0; i < Math.min(10, sheet.length); i++) {
    const row = (sheet[i] || []).map(String);
    const hasModel = row.some(c => /(^|\s)model(\s|$)/i.test(c));
    const hasVin = row.some(c => /\bvin\b|vin\s*#/i.test(c));
    if (hasModel && hasVin) return i;
  }
  return 0; // Default to first row if not found
}

// Quality Cargo validation: check for known QC headers
function looksLikeQuality(headers: string[]): boolean {
  const h = headers.map(s => s.toLowerCase());
  return h.some(x => x.includes('stock #')) ||
         (h.includes('model') && h.includes('size') && h.includes('retail') && h.includes('cost'));
}

export async function POST(req: Request) {
  try {
    // Auth guard: only MANAGER or OWNER can import inventory
    try {
      await requireRole(["manager", "owner"]);
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden: requires MANAGER or OWNER role" }, { status: 403 });
      }
      throw error;
    }

    // Extract supplier query param
    const url = new URL(req.url);
    const supplierParam = url.searchParams.get('supplier'); // 'diamond', 'quality', or 'panther'

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ ok:false, error:'No file' }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const name = (file.name || '').toLowerCase();

    // Lazy import to keep edge bundles clean (even though we're node)
    const XLSX = await import('xlsx');

    let rows: any[] = [];
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      const wb = XLSX.read(buf, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Dynamic header detection: scan first 10 rows for header row (handles messy sheets)
      const sheetArray = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
      const headerRowIndex = findHeaderRow(sheetArray);

      console.log(`[inventory/import] Detected header row at index: ${headerRowIndex}`);

      // Use detected header row index to parse data
      rows = XLSX.utils.sheet_to_json(ws, {
        defval: '',
        range: headerRowIndex  // Start from detected header row
      });
    } else {
      return NextResponse.json({ ok:false, error:'Unsupported file type' }, { status: 415 });
    }

    if (!rows.length) return NextResponse.json({ ok:false, message:"Empty sheet" }, { status: 400 });

    const headers = Object.keys(rows[0]);
    let normalize: (r:any)=>any, manufacturer: string;

    // Supplier-specific parser selection with validation
    if (supplierParam === 'diamond') {
      normalize = normalizeDiamond;
      manufacturer = "Diamond Cargo";
    } else if (supplierParam === 'quality') {
      // Validate Quality Cargo file
      if (!looksLikeQuality(headers)) {
        return NextResponse.json({
          ok:false,
          error:'QUALITY_MISMATCH: wrong file for Quality tile. Expected QC headers (STOCK #, MODEL, SIZE, RETAIL, COST)'
        }, { status: 400 });
      }
      normalize = normalizeQuality;
      manufacturer = "Quality Cargo";
    } else if (supplierParam === 'panther') {
      // Panther parser not yet implemented, fallback to auto-detect
      return NextResponse.json({
        ok:false,
        error:'Panther Cargo import not yet implemented'
      }, { status: 501 });
    } else {
      // Fallback: auto-detect if no supplier param
      if (detectDiamond(headers)) {
        normalize = normalizeDiamond;
        manufacturer = "Diamond Cargo";
      } else if (detectQuality(headers)) {
        normalize = normalizeQuality;
        manufacturer = "Quality Cargo";
      } else {
        return NextResponse.json({ ok:false, message:"Unknown sheet format. Please specify supplier param (?supplier=diamond or ?supplier=quality)" }, { status: 400 });
      }
    }

    let upserts = 0, skipped = 0;

    console.log(`[inventory/import] Processing ${rows.length} rows from ${manufacturer}`);
    console.log(`[inventory/import] First row headers:`, Object.keys(rows[0]));
    console.log(`[inventory/import] Sample first row:`, rows[0]);

    for (let idx = 0; idx < rows.length; idx++) {
      const raw = rows[idx];
      const rowNumber = idx + 1; // 1-indexed row number for logging

      const t = normalize(raw);
      if (!t?.vin) {
        const reason = !t ? "Normalization returned null (missing stock/VIN)" : "Missing VIN in normalized object";
        console.log(`[inventory/import] Skipped row ${rowNumber}:`, { reason, rowNumber, raw });
        skipped++;
        continue;
      }

      // Detailed validation logging
      console.log(`[inventory/import] Row ${rowNumber} normalized:`, {
        stock: t.stockNumber,
        model: t.model,
        size: { width: t.widthFeet, length: t.lengthFeet },
        height: t.heightFeet,
        salePrice: (t as any).sellingPrice,
        cost: t.price
      });

      // Check if trailer already exists
      const existing = await prisma.trailer.findUnique({
        where: { vin: t.vin },
        select: { images: true },
      });

      // Detect blackout and special types from model/description
      const modelLower = (t.model || '').toLowerCase();
      const notesLower = (t.notes || '').toLowerCase();
      const allText = `${modelLower} ${notesLower}`;

      const blackout = allText.includes('blackout');
      const specialType = allText.includes('dump') ? 'DUMP' :
                          allText.includes('racing') ? 'RACING' : null;

      // Enhanced standard image mapping
      const standardImage = pickStandardImage({
        size: t.size,
        axle: t.axle || null,
        blackout,
        specialType
      });

      const finalImages = (existing?.images && existing.images.length > 0)
        ? existing.images // Preserve existing images
        : standardImage ? [standardImage] : []; // Use standard image only if no existing

      // Use selling price from importer (prioritizes discounted > price > computed from cost)
      const cost = t.price || 0; // t.price contains dealer cost
      const sellingPrice = (t as any).sellingPrice || (cost > 0 ? computePrice(cost) : 0);

      // Map normalized trailer to Prisma schema
      const trailerData = {
        stockNumber: t.stockNumber || `AUTO-${t.vin.slice(-6)}`,
        manufacturer: t.manufacturer,
        model: t.model || "Unknown",
        year: new Date().getFullYear(), // Default to current year if not provided
        category: "Enclosed", // Default category, can be enhanced later
        length: t.lengthFeet || 0,
        width: t.widthFeet || 0,
        height: t.heightFeet || null, // Use calculated height from parser
        rearDoorType: t.rearDoorType || null, // Use parsed rear door type
        msrp: sellingPrice, // MSRP = selling price (from discounted/price or computed)
        salePrice: sellingPrice, // Sale price = selling price
        cost: cost, // Store dealer cost
        status: t.status || "available",
        images: finalImages, // Preserve existing OR use standard
        features: (t as any).standard_features || [], // Map standard_features to Prisma features field
      };

      await prisma.trailer.upsert({
        where: { vin: t.vin },
        update: trailerData,
        create: {
          vin: t.vin,
          ...trailerData,
        },
      });

      upserts++;
    }

    return NextResponse.json({ ok:true, manufacturer, upserts, skipped });
  } catch (err:any) {
    console.error('[inventory/import] failed', err);
    return NextResponse.json({ ok:false, error: String(err?.message || err) }, { status: 500 });
  }
}
