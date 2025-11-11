/**
 * Pricing computation utility for trailer inventory
 *
 * Formula:
 * - target = cost × 1.25 (25% markup, i.e., 125% of cost)
 * - minProfit = cost + $1,400 (minimum $1,400 profit)
 * - price = MAX(target, minProfit)
 *
 * Examples:
 * - Cost $3,425 → target $4,281.25, minProfit $4,825 → Price $4,825
 * - Cost $18,425 → target $23,031.25, minProfit $19,825 → Price $23,031
 */

export interface PricingResult {
  price: number | null;
  pricingStatus: 'PRICED' | 'ASK_FOR_PRICING';
}

/**
 * Compute selling price from cost value
 * Handles both numeric and textual costs
 */
export function computeSellingPrice(costRaw: any): PricingResult {
  // 1) If cost is missing or textual, mark as ASK_FOR_PRICING
  if (
    !costRaw ||
    (typeof costRaw === 'string' &&
      /call|offer|tbd|n\/a|price|contact/i.test(costRaw))
  ) {
    return { price: null, pricingStatus: 'ASK_FOR_PRICING' };
  }

  // 2) Parse to float
  const cost = typeof costRaw === 'number'
    ? costRaw
    : parseFloat(String(costRaw).replace(/[^0-9.]/g, ''));

  if (isNaN(cost) || cost <= 0) {
    return { price: null, pricingStatus: 'ASK_FOR_PRICING' };
  }

  // 3) Compute target = cost * 1.25 (25% markup)
  const target = cost * 1.25;

  // 4) Compute minProfit = cost + 1400
  const minProfit = cost + 1400;

  // 5) Price = max of the two
  const price = Math.max(target, minProfit);

  return { price, pricingStatus: 'PRICED' };
}
