import type { RawRow, NormalizedTrailer } from "./types";

export function detectQuality(sheetHeaders: string[]): boolean {
  const h = sheetHeaders.map(s => s.toLowerCase());
  // QC export usually has "VIN NUMBER" and "STOCK NUMBER"
  return h.some(x=>x.includes("vin")) && h.some(x=>x.includes("stock")) && h.some(x=>x.includes("open stock"));
}

export function normalizeQuality(row: RawRow): NormalizedTrailer | null {
  const vin = String(row["VIN"] || row["VIN NUMBER"] || row["Vin"] || "").trim();
  if (!vin) return null;

  const stock = String(row["STOCK"] || row["STOCK NUMBER"] || "").trim();
  const sizeRaw = String(row["SIZE"] || row["Size"] || row["DIMENSIONS"] || "").trim();
  const model = String(row["MODEL"] || row["Model"] || "").trim();
  const price = Number(String(row["PRICE"] || "").replace(/[^0-9.]/g,"")) || null;

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
    manufacturer: "Quality Cargo",
    size: sizeRaw || undefined,
    axle,
    widthFeet, lengthFeet,
    model: model || undefined,
    price,
    status: "available",
    notes: null,
  };
}
