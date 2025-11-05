import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickStandardImage } from "@/lib/inventory/image-map";
import { detectDiamond, normalizeDiamond } from "@/lib/inventory/importers/diamond";
import { detectQuality, normalizeQuality } from "@/lib/inventory/importers/quality";

export const runtime = "nodejs"; // NOT edge

const BodySchema = z.object({
  fileBase64: z.string(),               // base64 of the .xlsx
  filename: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const buf = Buffer.from(body.fileBase64, "base64");
    const wb = XLSX.read(buf, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

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
  } catch (e:any) {
    console.error("Import error:", e);
    return NextResponse.json({ ok:false, error: e?.message || "import failed" }, { status: 500 });
  }
}
