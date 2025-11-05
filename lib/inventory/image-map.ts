// Returns a standard image path for a trailer when no real image exists.
export function pickStandardImage(t: {
  size?: string;
  axle?: string | null;
  blackout?: boolean;
  specialType?: "DUMP" | "RACING" | null;
}): string | null {
  // Normalize size (handle case variations: 5x8 vs 5X8)
  const sizeNorm = (t.size || "").replace(/\s+/g, '').toUpperCase();
  const axleNorm = (t.axle || "").toUpperCase();

  // Build lookup key with optional blackout/special type
  let key = `${sizeNorm}${axleNorm}`;
  if (t.specialType) key += ` ${t.specialType}`;
  if (t.blackout) key += " BLACKOUT";

  // Complete mapping table matching your WEBP files
  const table: Record<string, string> = {
    // Standard Single Axle
    "4X6SA": "/images/standardtrailerpics-webp/4X6SA.webp",
    "5X8SA": "/images/standardtrailerpics-webp/5x8SA.webp",
    "6X10SA": "/images/standardtrailerpics-webp/6X10SA.webp",
    "6X12SA": "/images/standardtrailerpics-webp/6X12SA.webp",
    "7X16SA": "/images/standardtrailerpics-webp/7X16SA.webp",

    // Standard Tandem Axle
    "6X10TA": "/images/standardtrailerpics-webp/6X10TA.webp",
    "6X12TA": "/images/standardtrailerpics-webp/6X12TA.webp",
    "7X16TA": "/images/standardtrailerpics-webp/7X16TA.webp",
    "7X20TA": "/images/standardtrailerpics-webp/7X20TA.webp",
    "8.5X18-20TA": "/images/standardtrailerpics-webp/8.5X18-20TA.webp",

    // Blackout Variants
    "6X10SA BLACKOUT": "/images/standardtrailerpics-webp/6X10SA BLACKOUT.webp",
    "6X12SA BLACKOUT": "/images/standardtrailerpics-webp/6X12SA BLACKOUT.webp",
    "6X12TA BLACKOUT": "/images/standardtrailerpics-webp/6X12TA BLACKOUT.webp",
    "7X16SA BLACKOUT": "/images/standardtrailerpics-webp/7X16SA BLACKOUT.webp",
    "7X16TA BLACKOUT": "/images/standardtrailerpics-webp/7X16TA BLACKOUT.webp",
    "8.5X18-20TA BLACKOUT": "/images/standardtrailerpics-webp/8.5X18-20TA BLACKOUT.webp",
    "8.5X22TA BLACKOUT": "/images/standardtrailerpics-webp/8.5X22TA BLACKOUT.webp",

    // Special Types
    "6X10TA DUMP": "/images/standardtrailerpics-webp/6X10TA DUMP.webp",
    "8.5X18TA RACING": "/images/standardtrailerpics-webp/8.5X18TA RACING.webp",
    "8.5X18TA RACING BLACKOUT": "/images/standardtrailerpics-webp/8.5X18TA RACING BLACKOUT.webp",
  };

  return table[key] || null;
}
