import type { RawRow, NormalizedTrailer } from "./types";
import { parseSize, parseRear, calculateDiamondHeight } from "../parsers";

export function detectDiamond(sheetHeaders: string[]): boolean {
  // Diamond sheet has columns like: VIN, STOCK #, SIZE, MODEL, PRICE
  const h = sheetHeaders.map(s => s.toLowerCase());
  return h.includes("vin") && h.some(x => x.includes("stock")) && h.some(x => x.includes("size"));
}

export function normalizeDiamond(row: RawRow): NormalizedTrailer | null {
  const vin = String(row["VIN"] || row["Vin"] || "").trim();
  if (!vin) return null;

  const sizeRaw = String(row["SIZE"] || row["Size"] || row["Dimensions"] || "").trim();
  const model = String(row["MODEL"] || row["Model"] || "").trim();
  const description = String(row["DESCRIPTION"] || row["Description"] || "").trim();
  const notes = String(row["NOTES"] || row["Notes"] || "").trim();
  const price = Number(String(row["PRICE"] || row["Price"] || row["COST"] || row["Cost"] || "").replace(/[^0-9.]/g,"")) || null;
  const stock = String(row["STOCK #"] || row["Stock #"] || row["Stock"] || "").trim();

  // Parse size from SIZE column first, then fallback to MODEL, then DESCRIPTION
  const parsedSize = parseSize(sizeRaw) || parseSize(model) || parseSize(description);
  const widthFeet = parsedSize?.width;
  const lengthFeet = parsedSize?.length;

  // Calculate height based on width (Diamond standard)
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
    manufacturer: "Diamond Cargo",
    size: parsedSize ? `${parsedSize.width}x${parsedSize.length}` : sizeRaw || undefined,
    axle,
    widthFeet,
    lengthFeet,
    heightFeet,
    rearDoorType,
    model: model || undefined,
    price,
    status: "available",
    notes: notes || description || null,
  };
}
