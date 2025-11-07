import type { RawRow, NormalizedTrailer } from "./types";
import { parseSize, parseRear, calculateDiamondHeight } from "../parsers";

export function detectDiamond(sheetHeaders: string[]): boolean {
  // Diamond sheet has columns like: VIN #, MODEL, PRICE, REAR, HT
  const h = sheetHeaders.map(s => s.toLowerCase());
  return h.some(x => x.includes("vin")) &&
         h.some(x => x.includes("model")) &&
         (h.some(x => x.includes("price")) || h.some(x => x.includes("rear")));
}

/**
 * Parse Diamond Cargo Excel format with actual column names:
 * - VIN # (stock number, not real VIN)
 * - MODEL (contains size like 5X10SA, 8.5X34TA4)
 * - PRICE (dealer cost)
 * - REAR (rear door code: R, VN, N, FF, etc.)
 * - HT (height like 5'6", 7', 7'6", 8')
 * - NOTES/OPTIONS
 */
export function normalizeDiamond(row: RawRow): NormalizedTrailer | null {
  // VIN # column contains stock number (6 digits like 112962)
  const stockNum = String(row["VIN #"] || row["VIN#"] || row["Vin #"] || "").trim();
  if (!stockNum) return null;

  // Generate a fake VIN from stock number (Prisma requires unique VIN)
  const vin = `DC-${stockNum}`;

  const model = String(row["MODEL"] || row["Model"] || "").trim();
  const notes = String(row["NOTES/OPTIONS"] || row["Notes/Options"] || row["NOTES"] || "").trim();

  // PRICE column contains COST (not selling price)
  const priceStr = String(row["PRICE"] || row["Price"] || "").trim();
  const price = Number(priceStr.replace(/[^0-9.]/g,"")) || null;

  // REAR column has rear door codes
  const rearRaw = String(row["REAR"] || row["Rear"] || row["REA R"] || "").trim();
  const rearDoorType = rearRaw || parseRear(model) || parseRear(notes) || null;

  // HT column has heights like "5'6\"", "7'", "7'6\"", "8'"
  const htRaw = String(row["HT"] || row["Ht"] || row["HEIGHT"] || "").trim();
  let heightFeet: number | undefined = undefined;

  if (htRaw) {
    // Parse heights like "5'6\"", "7'", "7'6\""
    const match = htRaw.match(/(\d+)'(\d+)?"?/);
    if (match) {
      const feet = Number(match[1]);
      const inches = match[2] ? Number(match[2]) : 0;
      heightFeet = feet + (inches / 12);
    }
  }

  // Parse size from MODEL column (5X10SA → 5' x 10')
  const parsedSize = parseSize(model) || parseSize(notes);
  const widthFeet = parsedSize?.width;
  const lengthFeet = parsedSize?.length;

  // If no height from HT column, calculate from width
  if (!heightFeet && widthFeet) {
    heightFeet = calculateDiamondHeight(widthFeet);
  }

  // Parse axle type from model
  const axle = /TA4/i.test(model) ? "TA4" :
               /TA3/i.test(model) ? "TA3" :
               /TA|TANDEM/i.test(model) ? "TA" :
               /SA|SINGLE/i.test(model) ? "SA" : null;

  return {
    vin,
    stockNumber: stockNum,
    manufacturer: "Diamond Cargo",
    size: parsedSize ? `${parsedSize.width}x${parsedSize.length}` : model || undefined,
    axle,
    widthFeet,
    lengthFeet,
    heightFeet,
    rearDoorType,
    model: model || undefined,
    price,  // This is COST, will be used to calculate selling price
    status: "available",
    notes: notes || null,
  };
}
