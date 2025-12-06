/**
 * Configurable pricing calculation for trailer inventory
 *
 * Environment Variables:
 * - PRICE_MARKUP_MODE: 'multiplier' | 'percent'
 * - PRICE_MARKUP_VALUE: number (1.25 for 25% markup, or 0.015 for +1.50%)
 * - PRICE_MIN_ADD: number (minimum profit, default $2,000)
 */

export function computePrice(cost: number): number {
  const mode = process.env.PRICE_MARKUP_MODE ?? 'percent';
  const val = Number(process.env.PRICE_MARKUP_VALUE ?? 0.015);
  const minAdd = Number(process.env.PRICE_MIN_ADD ?? 2000);

  // Calculate price based on mode
  const byRule = mode === 'percent'
    ? cost * (1 + val)  // percent mode: cost × (1 + 0.015) = cost + 1.50%
    : cost * val;        // multiplier mode: cost × 1.25 = 25% markup

  // Enforce minimum profit: price must be at least (cost + minAdd)
  return Math.max(cost + minAdd, byRule);
}
