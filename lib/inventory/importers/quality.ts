import type { RawRow, NormalizedTrailer } from "./types";
import { parseSize, parseRear, calculateDiamondHeight } from "../parsers";

export function detectQuality(sheetHeaders: string[]): boolean {
  const h = sheetHeaders.map(s => s.toLowerCase().replace(/\s+/g, ' '));
  // QC export usually has "VIN", "STOCK" or "STOCK #", and quality-specific headers
  return h.some(x => x.includes("vin")) &&
         h.some(x => x.includes("stock")) &&
         (h.some(x => x.includes("open stock")) || h.some(x => x.includes("model")) || h.some(x => x.includes("body model")));
}

/**
 * Find column value using flexible aliases
 */
function findColumn(row: RawRow, aliases: string[]): string {
  for (const alias of aliases) {
    const normalized = alias.toLowerCase().replace(/\s+/g, ' ');

    // Try exact match first
    for (const key of Object.keys(row)) {
      const keyNormalized = key.toLowerCase().replace(/\s+/g, ' ');
      if (keyNormalized === normalized || keyNormalized.includes(normalized)) {
        const val = row[key];
        if (val !== null && val !== undefined) {
          return String(val).trim();
        }
      }
    }
  }
  return "";
}

export function normalizeQuality(row: RawRow): NormalizedTrailer | null {
  // Flexible header matching with aliases
  const vin = findColumn(row, ["VIN", "VIN NUMBER", "Vin"]);
  if (!vin) return null;

  const stock = findColumn(row, ["STOCK", "STOCK #", "STOCK NUMBER", "UNIT #", "Unit #"]);
  const model = findColumn(row, ["MODEL", "BODY MODEL NAME", "Body Model Name"]);
  const description = findColumn(row, ["DESCRIPTION", "DESC", "NOTES"]);

  // Quality Cargo sheets have COST and RETAIL columns
  const costStr = findColumn(row, ["COST", "WHOLESALE", "DEALER COST", "Wholesale"]);
  const price = Number(costStr.replace(/[^0-9.]/g,"")) || null;

  // Parse size from MODEL column (QC doesn't have separate SIZE column typically)
  // Fallback to description if not in model
  const parsedSize = parseSize(model) || parseSize(description);
  const widthFeet = parsedSize?.width;
  const lengthFeet = parsedSize?.length;

  // Calculate height based on width (assuming Quality Cargo follows Diamond standard)
  const heightFeet = widthFeet ? calculateDiamondHeight(widthFeet) : undefined;

  // Parse rear door type from MODEL or DESCRIPTION
  const rearDoorType = parseRear(model) || parseRear(description) || null;

  // Parse axle type from model
  const axle = /TA4/i.test(model) ? "TA4" :
               /TA3/i.test(model) ? "TA3" :
               /TA|TANDEM/i.test(model) ? "TA" :
               /SA|SINGLE/i.test(model) ? "SA" : null;

  return {
    vin,
    stockNumber: stock || undefined,
    manufacturer: "Quality Cargo",
    size: parsedSize ? `${parsedSize.width}x${parsedSize.length}` : undefined,
    axle,
    widthFeet,
    lengthFeet,
    heightFeet,
    rearDoorType,
    model: model || undefined,
    price,
    status: "available",
    notes: description || null,
  };
}
