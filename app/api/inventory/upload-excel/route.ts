import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

interface TrailerData {
  vin: string;
  stockNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  category: string;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  msrp: number;
  salePrice: number;
  cost?: number;
  status: string;
  notes?: string;
}

/**
 * Parse Diamond Cargo Excel file (AVAILBLE sheet)
 * Header is in row 6, data starts in row 7
 */
function parseDiamondCargo(buffer: Buffer): TrailerData[] {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets["AVAILBLE"];

  if (!worksheet) {
    throw new Error("Diamond Cargo file missing 'AVAILBLE' sheet");
  }

  // Read raw data
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const trailers: TrailerData[] = [];

  // Data starts at row 7 (index 6)
  for (let i = 6; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue; // Skip empty rows, column B is VIN

    try {
      const vin = String(row[1]).trim();
      const stockNum = row[0] ? String(row[0]).trim() : vin;

      if (!vin || vin.toLowerCase() === "nan") continue;

      // Column mapping from analysis:
      // B: VIN #, F: MODEL, G: COLOR, H: REAR, I: FRONT, J: HT, R: PRICE, S: NEW DISC'D PRICE, W: NOTES/OPTIONS
      const model = row[5] ? String(row[5]).trim() : "Unknown";
      const color = row[6] ? String(row[6]).trim() : "";
      const height = row[9] ? String(row[9]).trim() : "";
      const price = row[17] ? parseFloat(String(row[17])) : 0; // PRICE column
      const newPrice = row[18] ? parseFloat(String(row[18])) : price; // NEW DISC'D PRICE
      const notes = row[33] ? String(row[33]).trim() : ""; // NOTES/OPTIONS

      // Determine category from model (Diamond sells enclosed trailers)
      const category = "enclosed";

      trailers.push({
        vin,
        stockNumber: stockNum,
        manufacturer: "Diamond Cargo",
        model,
        year: new Date().getFullYear(),
        category,
        height: height ? parseFloat(height) : undefined,
        color,
        msrp: newPrice > 0 ? newPrice : price,
        salePrice: newPrice > 0 ? newPrice : price,
        cost: price * 0.8, // Estimate cost at 80% of price
        status: "available",
        notes,
      });
    } catch (err) {
      console.error(`Error parsing Diamond Cargo row ${i}:`, err);
      continue;
    }
  }

  console.log(`✅ Parsed ${trailers.length} trailers from Diamond Cargo`);
  return trailers;
}

/**
 * Parse Quality Cargo Excel file (PLAIN UNITS sheet)
 * No header row, data starts at row 2 (index 1)
 * Column structure:
 * A: VIN, B: BASE PRICE, C: DISCOUNT, D: FINAL PRICE, E: MODEL, F: COLOR, G: GVWR, H: ?, I: DOOR, J: RAMP, K: NOTES
 */
function parseQualityCargo(buffer: Buffer): TrailerData[] {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets["PLAIN UNITS "];

  if (!worksheet) {
    throw new Error("Quality Cargo file missing 'PLAIN UNITS ' sheet");
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const trailers: TrailerData[] = [];

  // Data starts at row 2 (index 1)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue; // Skip empty rows, column A is VIN

    try {
      const vin = String(row[0]).trim();

      if (!vin || vin.toLowerCase() === "nan") continue;

      // Parse columns
      const basePrice = row[1] ? parseFloat(String(row[1])) : 0;
      const discount = row[2] ? parseFloat(String(row[2])) : 0;
      const finalPrice = row[3] ? parseFloat(String(row[3])) : basePrice + discount;
      const model = row[4] ? String(row[4]).trim() : "Unknown";
      const color = row[5] ? String(row[5]).trim() : "";
      const gvwr = row[6] ? parseFloat(String(row[6])) : undefined;
      const doorType = row[8] ? String(row[8]).trim() : "";
      const ramp = row[9] ? String(row[9]).trim() : "";
      const notes = row[10] ? String(row[10]).trim() : "";

      const stockNum = vin; // Use VIN as stock number for Quality Cargo

      // Determine category (Quality sells enclosed trailers)
      const category = "enclosed";

      trailers.push({
        vin,
        stockNumber: stockNum,
        manufacturer: "Quality Cargo",
        model,
        year: new Date().getFullYear(),
        category,
        color,
        msrp: finalPrice,
        salePrice: finalPrice,
        cost: basePrice,
        status: "available",
        notes: [doorType, ramp, notes].filter(Boolean).join(" | "),
      });
    } catch (err) {
      console.error(`Error parsing Quality Cargo row ${i}:`, err);
      continue;
    }
  }

  console.log(`✅ Parsed ${trailers.length} trailers from Quality Cargo`);
  return trailers;
}

/**
 * Parse Panther Cargo Excel file (if needed)
 * Specialized in dump trailers and open trailers
 */
function parsePantherCargo(buffer: Buffer): TrailerData[] {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Use first sheet

  if (!worksheet) {
    throw new Error("Panther Cargo file has no sheets");
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  const trailers: TrailerData[] = [];

  // Try to auto-detect header and data structure
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    if (row && row.some((cell) => String(cell).toLowerCase().includes("vin"))) {
      headerRowIndex = i;
      break;
    }
  }

  // Data starts after header
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    try {
      // Flexible parsing for Panther
      const vin = String(row[0]).trim();
      if (!vin || vin.toLowerCase() === "nan") continue;

      const model = row[1] ? String(row[1]).trim() : "Unknown";
      const price = row[row.length - 1] ? parseFloat(String(row[row.length - 1])) : 0;

      // Determine if dump or open trailer from model name
      const modelLower = model.toLowerCase();
      let category = "utility";
      if (modelLower.includes("dump")) category = "dump";
      if (modelLower.includes("open")) category = "open";

      trailers.push({
        vin,
        stockNumber: vin,
        manufacturer: "Panther Cargo",
        model,
        year: new Date().getFullYear(),
        category,
        msrp: price,
        salePrice: price,
        cost: price * 0.75,
        status: "available",
        notes: `Panther ${category} trailer`,
      });
    } catch (err) {
      console.error(`Error parsing Panther Cargo row ${i}:`, err);
      continue;
    }
  }

  console.log(`✅ Parsed ${trailers.length} trailers from Panther Cargo`);
  return trailers;
}

/**
 * Check if image exists for VIN
 */
function checkTrailerImage(vin: string): string | null {
  const imageFolders = [
    "/public/images/trailers",
    "/public/trailers",
  ];

  for (const folder of imageFolders) {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    for (const ext of imageExtensions) {
      const fileName = `${vin}${ext}`;
      if (files.includes(fileName)) {
        return `${folder}/${fileName}`;
      }
    }
  }

  return null; // No image found
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user with role check
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check permissions (only owners/directors can upload)
    if (!["owner", "director"].includes(currentUser.profile?.role || "")) {
      return NextResponse.json(
        { error: "Only owners/directors can upload inventory" },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const manufacturer = formData.get("manufacturer") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!manufacturer) {
      return NextResponse.json(
        { error: "No manufacturer specified" },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

    // Parse based on manufacturer
    let trailers: TrailerData[] = [];

    if (manufacturer === "Diamond Cargo") {
      trailers = parseDiamondCargo(bytes);
    } else if (manufacturer === "Quality Cargo") {
      trailers = parseQualityCargo(bytes);
    } else if (manufacturer === "Panther Cargo") {
      trailers = parsePantherCargo(bytes);
    } else {
      return NextResponse.json(
        { error: "Unknown manufacturer" },
        { status: 400 }
      );
    }

    if (trailers.length === 0) {
      return NextResponse.json(
        { error: "No trailers found in file" },
        { status: 400 }
      );
    }

    // Track results
    let newCount = 0;
    let updatedCount = 0;
    const newVins: string[] = [];
    const updatedVins: string[] = [];
    const errors: Array<{ vin: string; error: string }> = [];

    // Upsert trailers into database
    for (const trailer of trailers) {
      try {
        // Check if trailer exists by VIN
        const existing = await prisma.trailer.findUnique({
          where: { vin: trailer.vin },
        });

        if (existing) {
          // Update existing
          await prisma.trailer.update({
            where: { vin: trailer.vin },
            data: {
              model: trailer.model,
              color: trailer.color,
              height: trailer.height,
              msrp: trailer.msrp,
              salePrice: trailer.salePrice,
              cost: trailer.cost,
              description: trailer.notes,
              updatedAt: new Date(),
            },
          });
          updatedCount++;
          updatedVins.push(trailer.vin);
        } else {
          // Create new
          const imageUrl = checkTrailerImage(trailer.vin);
          const images = imageUrl ? [imageUrl] : [];

          await prisma.trailer.create({
            data: {
              vin: trailer.vin,
              stockNumber: trailer.stockNumber,
              manufacturer: trailer.manufacturer,
              model: trailer.model,
              year: trailer.year,
              category: trailer.category,
              length: trailer.length || 0,
              width: trailer.width || 6,
              height: trailer.height,
              msrp: trailer.msrp,
              salePrice: trailer.salePrice,
              cost: trailer.cost,
              status: "available",
              images,
              description: trailer.notes,
              createdBy: currentUser.id,
            },
          });
          newCount++;
          newVins.push(trailer.vin);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Error upserting VIN ${trailer.vin}:`, errorMsg);
        errors.push({ vin: trailer.vin, error: errorMsg });
      }
    }

    // Create upload report
    const report = await prisma.uploadReport.create({
      data: {
        fileName: file.name,
        manufacturer,
        uploadedBy: currentUser.id,
        totalInUpload: trailers.length,
        newTrailers: newCount,
        updatedTrailers: updatedCount,
        removedTrailers: 0,
        newVins,
        updatedVins,
        removedVins: [],
        errors: errors.length > 0 ? errors : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${trailers.length} trailers`,
      summary: {
        total: trailers.length,
        new: newCount,
        updated: updatedCount,
        errors: errors.length,
      },
      reportId: report.id,
      newVins,
      updatedVins,
      errors,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Upload failed", details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get upload history
    const reports = await prisma.uploadReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
