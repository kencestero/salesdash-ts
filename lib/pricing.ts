/**
 * Configurable pricing calculation for trailer inventory
 *
 * Environment Variables:
 * - PRICE_MARKUP_MODE: 'multiplier' | 'percent'
 * - PRICE_MARKUP_VALUE: number (1.25 for 25% markup, or 0.0125 for +1.25%)
 * - PRICE_MIN_ADD: number (minimum profit, default $1,400)
 */

export function computePrice(cost: number): number {
  const mode = process.env.PRICE_MARKUP_MODE ?? 'multiplier';
  const val = Number(process.env.PRICE_MARKUP_VALUE ?? 1.25);
  const minAdd = Number(process.env.PRICE_MIN_ADD ?? 1400);

  // Calculate price based on mode
  const byRule = mode === 'percent'
    ? cost * (1 + val)  // percent mode: cost × (1 + 0.0125) = cost + 1.25%
    : cost * val;        // multiplier mode: cost × 1.25 = 25% markup

  // Enforce minimum profit: price must be at least (cost + minAdd)
  return Math.max(cost + minAdd, byRule);
}
