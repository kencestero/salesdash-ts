// Returns a standard image path for a trailer when no real image exists.
export function pickStandardImage(t: { size?: string; axle?: string|null }): string | null {
  const key = `${(t.size||"").replace(/\s+/g,'').toUpperCase()}-${(t.axle||"").toUpperCase()}`;
  const table: Record<string,string> = {
    "4X6-SA":  "/images/standardtrailerpics-webp/4X6SA.webp",
    "5X8-SA":  "/images/standardtrailerpics-webp/5X8SA.webp",
    "6X10-SA": "/images/standardtrailerpics-webp/6X10SA.webp",
    "6X10-TA": "/images/standardtrailerpics-webp/6X10TA.webp",
    "7X14-TA": "/images/standardtrailerpics-webp/7X14TA.webp",
    "7X16-TA": "/images/standardtrailerpics-webp/7X16TA.webp",
    "8.5X20-TA": "/images/standardtrailerpics-webp/8_5X20TA.webp",
    "8.5X24-TA": "/images/standardtrailerpics-webp/8_5X24TA.webp",
    // add more as needed (we can extend after first import)
  };
  return table[key] || null;
}
