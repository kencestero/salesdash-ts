/**
 * Reusable parsers for trailer specifications
 */

/**
 * Parse size from model or description string
 * Handles variants like: 5X10SA, 6 x 12 TA, 7×16 TA3, 8.5X20TA, etc.
 *
 * @returns { width: number, length: number } or null if not found
 */
export function parseSize(modelOrDesc: string): { width: number; length: number } | null {
  if (!modelOrDesc) return null;

  // Normalize: remove all non-numeric and non-X characters, convert to uppercase
  const s = modelOrDesc.replace(/[^0-9.xX]/g, '').toUpperCase();

  // Match pattern like 5X10 or 8.5X20
  const match = s.match(/(\d+(?:\.\d+)?)X(\d+(?:\.\d+)?)/i);
  if (!match) return null;

  return {
    width: Number(match[1]),
    length: Number(match[2])
  };
}

/**
 * Parse rear door type from description
 * Codes: R (Ramp), DD (Double Door), HDR (HD Ramp), SRW (Spring Ramp), 8'P (8' Porch), R-RW (Ramp Rear Window)
 *
 * @returns rear door code or null if not found
 */
export function parseRear(desc: string): string | null {
  if (!desc) return null;

  const codes = ['R-RW', '8\'P', 'HDR', 'SRW', 'DD', 'R']; // Order matters: check longer codes first
  const upper = desc.toUpperCase();

  return codes.find(code => upper.includes(code)) ?? null;
}

/**
 * Calculate Diamond Cargo trailer height based on width
 * Diamond standard heights:
 * - Width <= 6' → Height = 5'6"
 * - Width >= 7' → Height = 6'3"
 *
 * @returns height in feet (as number with decimal, e.g., 5.5 for 5'6")
 */
export function calculateDiamondHeight(widthFeet: number): number {
  if (widthFeet <= 6) return 5.5; // 5'6"
  return 6.25; // 6'3"
}

/**
 * Parse height from string formats like "7'", "6'6\"", "5'6", etc.
 *
 * @param ht - Height string from Excel (e.g., "7'", "6'6\"", "5'6")
 * @returns Height in feet as decimal (e.g., 7.0, 6.5, 5.5) or undefined if unparseable
 */
export function parseHeightFeet(ht: string | undefined | null): number | undefined {
  if (!ht) return undefined;

  const htStr = String(ht).trim();
  if (!htStr) return undefined;

  // Parse heights like "5'6\"", "7'", "7'6\"", "8'"
  const match = htStr.match(/(\d+)'(\d+)?"?/);
  if (!match) return undefined;

  const feet = Number(match[1]);
  const inches = match[2] ? Number(match[2]) : 0;
  return feet + (inches / 12);
}

/**
 * Format height number to feet-inches string
 * Examples: 5.5 → "5'6\"", 6.25 → "6'3\""
 */
export function formatHeight(heightFeet: number): string {
  const feet = Math.floor(heightFeet);
  const inches = Math.round((heightFeet - feet) * 12);
  return `${feet}'${inches}"`;
}
