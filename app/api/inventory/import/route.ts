import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickStandardImage } from "@/lib/inventory/image-map";
import { detectDiamond, normalizeDiamond } from "@/lib/inventory/importers/diamond";
import { detectQuality, normalizeQuality } from "@/lib/inventory/importers/quality";
import { computePrice } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Quality Cargo validation: check for known QC headers
function looksLikeQuality(headers: string[]): boolean {
  const h = headers.map(s => s.toLowerCase());
  return h.some(x => x.includes('stock #')) ||
         (h.includes('model') && h.includes('size') && h.includes('retail') && h.includes('cost'));
}

export async function POST(req: Request) {
  try {
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
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
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

    for (const raw of rows) {
      const t = normalize(raw);
      if (!t?.vin) { skipped++; continue; }

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

      // Apply pricing formula: compute price from cost
      const cost = t.price || 0; // Assuming t.price from Excel is actually cost
      const calculatedPrice = cost > 0 ? computePrice(cost) : 0;

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
        msrp: calculatedPrice, // MSRP = calculated price
        salePrice: calculatedPrice, // Sale price = calculated price (override Excel)
        cost: cost, // Store original cost
        status: t.status || "available",
        images: finalImages, // Preserve existing OR use standard
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
