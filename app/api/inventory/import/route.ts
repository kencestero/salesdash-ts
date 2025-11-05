import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickStandardImage } from "@/lib/inventory/image-map";
import { detectDiamond, normalizeDiamond } from "@/lib/inventory/importers/diamond";
import { detectQuality, normalizeQuality } from "@/lib/inventory/importers/quality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
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

    if (detectDiamond(headers)) {
      normalize = normalizeDiamond;
      manufacturer = "Diamond Cargo";
    } else if (detectQuality(headers)) {
      normalize = normalizeQuality;
      manufacturer = "Quality Cargo";
    } else {
      return NextResponse.json({ ok:false, message:"Unknown sheet format" }, { status: 400 });
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

      // Only use standard image if no existing image
      const standardImage = pickStandardImage({ size: t.size, axle: t.axle || null });
      const finalImages = (existing?.images && existing.images.length > 0)
        ? existing.images // Preserve existing images
        : standardImage ? [standardImage] : []; // Use standard image only if no existing

      // Map normalized trailer to Prisma schema
      const trailerData = {
        stockNumber: t.stockNumber || `AUTO-${t.vin.slice(-6)}`,
        manufacturer: t.manufacturer,
        model: t.model || "Unknown",
        year: new Date().getFullYear(), // Default to current year if not provided
        category: "Enclosed", // Default category, can be enhanced later
        length: t.lengthFeet || 0,
        width: t.widthFeet || 0,
        height: null,
        msrp: t.price || 0,
        salePrice: t.price || 0,
        cost: (t.price || 0) * 0.8, // Estimate cost as 80% of price if not provided
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
