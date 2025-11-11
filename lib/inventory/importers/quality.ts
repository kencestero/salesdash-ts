import type { RawRow, NormalizedTrailer } from "./types";
import { parseSize, parseRear, parseHeightFeet, calculateDiamondHeight } from "../parsers";
import { computePrice } from "@/lib/pricing";

// Feature flag: enable/disable standard features injection
const ENABLE_STD = true;

/**
 * Alias helper - tries multiple column name variants, returns first non-empty value
 */
function alias(row: Record<string, any>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return undefined;
}

export function detectQuality(sheetHeaders: string[]): boolean {
  const h = sheetHeaders.map(s => s.toLowerCase().replace(/\s+/g, ' '));
  // QC export usually has "VIN", "STOCK" or "STOCK #", and quality-specific headers
  return h.some(x => x.includes("vin")) &&
         h.some(x => x.includes("stock")) &&
         (h.some(x => x.includes("open stock")) || h.some(x => x.includes("model")) || h.some(x => x.includes("body model")));
}

/**
 * Parse Quality Cargo Excel format with robust column name handling:
 * - VIN / VIN NUMBER / Vin / STOCK / STOCK # (real VIN or stock number)
 * - MODEL / BODY MODEL NAME / Body Model Name (contains size like 5X10SA, 8.5X34TA4)
 * - DISCOUNT / DISC PRICE / SELL PRICE / RETAIL / SALE (selling price)
 * - PRICE / DEALER PRICE / COST / WHOLESALE (dealer cost)
 * - DESCRIPTION / DESC / NOTES / OPTIONS
 * - HT / Ht / HEIGHT / Int HT / INT HEIGHT (height like 5'6", 7', 7'6", 8')
 * - EXT COLOR / Color (exterior color)
 * - FRONT / Front (FF for Flat Front, else V-Nose)
 */
export function normalizeQuality(row: RawRow): NormalizedTrailer | null {
  // VIN or STOCK - Quality uses real VINs more often than Diamond
  const vinRaw = alias(row, ["VIN", "VIN NUMBER", "Vin"]);
  const stock = alias(row, ["STOCK", "STOCK #", "STOCK NUMBER", "UNIT #", "Unit #"]);

  // Prefer VIN if present, else use stock
  const vin = vinRaw || (stock ? `QC-${stock}` : null);
  if (!vin) return null;

  const model = alias(row, ["MODEL", "BODY MODEL NAME", "Body Model Name"]) || "";
  const notes = alias(row, ["DESCRIPTION", "DESC", "NOTES", "OPTIONS"]);

  // Pricing: prioritize discounted > price > cost (same as Diamond)
  const num = (v: any) => {
    const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
    return n > 0 ? n : null;
  };

  const discounted = alias(row, ["DISCOUNT", "DISC PRICE", "SELL PRICE", "RETAIL", "SALE"]);
  const price = alias(row, ["PRICE", "DEALER PRICE", "MSRP"]);
  const cost = alias(row, ["COST", "WHOLESALE", "DEALER COST"]);

  // Find first non-empty price value: discounted > price > cost
  const rawPrice = num(discounted) ?? num(price) ?? num(cost) ?? null;
  const costValue = num(cost) ?? null;

  // If we have a discounted or price value, use it directly
  // If we only have cost, compute selling price
  const sellingPrice = (num(discounted) ?? num(price))
    ? rawPrice
    : (costValue ? computePrice(costValue) : null);

  // Parse heights like "7'", "6'6\""
  const ht = alias(row, ["HT", "Ht", "HEIGHT", "Int HT", "INT HEIGHT"]);
  let heightFeet = parseHeightFeet(ht);

  // Parse size from MODEL column (5X10SA → width: 5, length: 10)
  const parsedSize = parseSize(model) || parseSize(notes || "");
  const widthFeet = parsedSize?.widthFeet;
  const lengthFeet = parsedSize?.lengthFeet;

  // If no explicit height, calculate from width (Quality follows Diamond standards)
  if (!heightFeet && widthFeet) {
    heightFeet = calculateDiamondHeight(widthFeet);
  }

  // Parse axle type from model
  const axle = /TA4/i.test(model) ? "TA4" :
               /TA3/i.test(model) ? "TA3" :
               /\bTA\b|TANDEM/i.test(model) ? "TA" :
               /\bSA\b|SINGLE/i.test(model) ? "SA" : undefined;

  // Prefer explicit REAR cell; fall back to parser if empty
  const rearCell = alias(row, ["REAR", "Rear", "REAR DOOR"]);
  const rearDoorType = rearCell || parseRear(model) || parseRear(notes || "") || undefined;

  // Parse color and metal from EXT COLOR
  const colorRaw = alias(row, ["EXT COLOR", "Color", "EXTERIOR COLOR"]);
  const metal = colorRaw && /\.080/i.test(colorRaw) ? ".080 Polycore" : undefined;
  const color = colorRaw ? colorRaw.replace(/\.0(30|80).*/i, "").trim() : undefined;

  // Parse front type (FF = Flat Front, else V-Nose)
  const frontRaw = alias(row, ["FRONT", "Front"]);
  const front = frontRaw && /FF/i.test(frontRaw) ? "Flat Front" : "V-Nose";

  // Build normalized trailer object
  const normalized: NormalizedTrailer = {
    vin,
    stockNumber: stock || undefined,
    manufacturer: "Quality Cargo",
    size: parsedSize ? `${parsedSize.width}x${parsedSize.length}` : model || undefined,
    axle: axle || undefined,
    widthFeet,
    lengthFeet,
    heightFeet,
    rearDoorType,
    front,
    metal,
    color,
    model: model || undefined,
    price: costValue,  // Store dealer cost
    sellingPrice: sellingPrice || undefined,  // Computed or direct selling price
    status: "available",
    notes: notes || undefined,
  };

  // Standard features injection (if enabled)
  if (ENABLE_STD && widthFeet && lengthFeet && axle) {
    try {
      const std = require("@/data/standards/quality.json");
      const axleKey = axle === "SA" ? "SA" : "TA"; // Normalize axle to SA or TA
      const sizeKey = `${widthFeet}x${lengthFeet} ${axleKey}`;
      const standardFeatures = std[sizeKey];
      if (standardFeatures && Array.isArray(standardFeatures)) {
        (normalized as any).standard_features = standardFeatures;
      }
    } catch (err) {
      // Silently ignore if data file doesn't exist yet
    }
  }

  return normalized;
}
