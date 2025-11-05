import type { RawRow, NormalizedTrailer } from "./types";

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
  const price = Number(String(row["PRICE"] || row["Price"] || "").replace(/[^0-9.]/g,"")) || null;
  const stock = String(row["STOCK #"] || row["Stock #"] || row["Stock"] || "").trim();

  // parse size like "7x16" or "8.5x20"
  const m = sizeRaw.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  const widthFeet = m ? Number(m[1]) : undefined;
  const lengthFeet = m ? Number(m[2]) : undefined;

  const axle = /TA4/i.test(model) ? "TA4" :
               /TA3/i.test(model) ? "TA3" :
               /TA|TANDEM/i.test(model) ? "TA" :
               /SA|SINGLE/i.test(model) ? "SA" : null;

  return {
    vin,
    stockNumber: stock || undefined,
    manufacturer: "Diamond Cargo",
    size: sizeRaw || undefined,
    axle,
    widthFeet, lengthFeet,
    model: model || undefined,
    price,
    status: "available",
    notes: null,
  };
}
