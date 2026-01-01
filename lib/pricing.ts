/**
 * Pricing calculation for trailer inventory
 *
 * Formula: cost × 1.5 with minimum $1,500 profit
 * Example: Cost $3,000 → Price = $4,500 (50% markup = $1,500 profit)
 *
 * Environment Variables (optional overrides):
 * - PRICE_MARKUP: number (default 1.5 for 50% markup)
 * - PRICE_MIN_PROFIT: number (minimum profit, default $1,500)
 */

export function computePrice(cost: number): number {
  const markup = Number(process.env.PRICE_MARKUP ?? 1.5);
  const minProfit = Number(process.env.PRICE_MIN_PROFIT ?? 1500);

  // Calculate price with markup
  let sellingPrice = cost * markup;
  let profit = sellingPrice - cost;

  // Ensure minimum profit requirement
  if (profit < minProfit) {
    sellingPrice = cost + minProfit;
  }

  return Math.round(sellingPrice); // Round to nearest dollar
}
