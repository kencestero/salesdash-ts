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

export function detectDiamond(sheetHeaders: string[]): boolean {
  // Diamond sheet has columns like: VIN #, MODEL, PRICE, REAR, HT
  const h = sheetHeaders.map(s => s.toLowerCase());
  return h.some(x => x.includes("vin")) &&
         h.some(x => x.includes("model")) &&
         (h.some(x => x.includes("price")) || h.some(x => x.includes("rear")));
}

/**
 * Parse Diamond Cargo Excel format with robust column name handling:
 * - VIN # / VIN# / Vin # / Stock # (stock number, not real VIN)
 * - MODEL / Model (contains size like 5X10SA, 8.5X34TA4)
 * - PRICE / Price / COST / Cost (dealer cost)
 * - REAR / Rear / REAR DOOR (rear door code: R, DD, etc.)
 * - HT / Ht / HEIGHT / Int HT / INT HEIGHT (height like 5'6", 7', 7'6", 8')
 * - EXT COLOR / Color (exterior color, may include metal spec like .080)
 * - FRONT / Front (FF for Flat Front, else V-Nose)
 * - NOTES/OPTIONS / Notes/Options / NOTES / Options
 */
export function normalizeDiamond(row: RawRow): NormalizedTrailer | null {
  // Accept VIN or VIN #; Diamond "VIN #" is often a stock number (6 digits)
  const stock = alias(row, ["VIN #", "VIN#", "Vin #", "Stock #", "STOCK #", "STK #"]);
  if (!stock) return null;

  // Check for real VIN first (length >= 8), else synthesize DC-<stock>
  const vinRaw = alias(row, ["VIN", "Vin"]);
  const vin = vinRaw && vinRaw.length >= 8 ? vinRaw : `DC-${stock}`;

  const model = alias(row, ["MODEL", "Model"]) || "";
  const notes = alias(row, ["NOTES/OPTIONS", "Notes/Options", "NOTES", "Options"]);

  // Pricing: prioritize discounted > price > cost
  // Helper to extract number from string
  const num = (v: any) => {
    const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
    return n > 0 ? n : null;
  };

  const discounted = alias(row, ["DISCOUNT", "DISC PRICE", "SELL PRICE", "RETAIL", "SALE"]);
  const price = alias(row, ["PRICE", "DEALER PRICE", "MSRP"]);
  const cost = alias(row, ["COST", "DEALER COST"]);

  // Find first non-empty price value: discounted > price > cost
  const rawPrice = num(discounted) ?? num(price) ?? num(cost) ?? null;
  const costValue = num(cost) ?? null;

  // If we have a discounted or price value, use it directly
  // If we only have cost, compute selling price
  const sellingPrice = (num(discounted) ?? num(price))
    ? rawPrice
    : (costValue ? computePrice(costValue) : null);

  // Prefer explicit REAR cell; fall back to parser if empty
  const rearCell = alias(row, ["REAR", "Rear", "REAR DOOR"]);
  const rearDoorType = rearCell || parseRear(model) || parseRear(notes || "") || undefined;

  // Parse heights like "7'", "6'6\""
  const ht = alias(row, ["HT", "Ht", "HEIGHT", "Int HT", "INT HEIGHT"]);
  let heightFeet = parseHeightFeet(ht);

  // Parse size from MODEL column (5X10SA → width: 5, length: 10)
  const parsedSize = parseSize(model) || parseSize(notes || "");
  const widthFeet = parsedSize?.width;
  const lengthFeet = parsedSize?.length;

  // If no explicit height, calculate from width (Diamond standard)
  if (!heightFeet && widthFeet) {
    heightFeet = calculateDiamondHeight(widthFeet);
  }

  // Parse axle type from model
  const axle = /TA4/i.test(model) ? "TA4" :
               /TA3/i.test(model) ? "TA3" :
               /\bTA\b|TANDEM/i.test(model) ? "TA" :
               /\bSA\b|SINGLE/i.test(model) ? "SA" : undefined;

  // Parse color and metal from EXT COLOR
  const colorRaw = alias(row, ["EXT COLOR", "Color"]);
  const metal = colorRaw && /\.080/i.test(colorRaw) ? ".080 Polycore" : undefined;
  const color = colorRaw ? colorRaw.replace(/\.0(30|80).*/i, "").trim() : undefined;

  // Parse front type (FF = Flat Front, else V-Nose)
  const frontRaw = alias(row, ["FRONT", "Front"]);
  const front = frontRaw && /FF/i.test(frontRaw) ? "Flat Front" : "V-Nose";

  // Build normalized trailer object
  const normalized: NormalizedTrailer = {
    vin,
    stockNumber: stock,
    manufacturer: "Diamond Cargo",
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
      const std = require("@/data/standards/diamond.json");
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
