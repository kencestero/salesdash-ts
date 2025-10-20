/**
 * Test Kenneth's Pricing Formula
 *
 * Formula:
 * - Base: Cost × 1.0125 (1.25% markup)
 * - If profit < $1,400, use: Cost + $1,400
 */

function calculateSalePrice(cost) {
  const markup = cost * 0.0125; // 1.25%
  const priceWithMarkup = cost + markup;
  const profit = priceWithMarkup - cost;

  if (profit < 1400) {
    // Minimum $1,400 profit
    return cost + 1400;
  }

  return priceWithMarkup;
}

console.log('🧮 Testing Kenneth\'s Pricing Formula');
console.log('=====================================\n');

const testCases = [
  10000,  // Low cost
  20000,
  30000,
  40000,
  50000,
  75000,
  100000,
  112000,  // Break-even point (~$112,000)
  120000,
  150000,
  200000,
  300000,
];

console.log('Cost       →  Price      | Profit    | Formula Used');
console.log('---------------------------------------------------');

testCases.forEach(cost => {
  const price = calculateSalePrice(cost);
  const profit = price - cost;
  const formulaUsed = profit === 1400 ? 'Cost + $1,400' : 'Cost × 1.0125';

  console.log(
    `$${cost.toLocaleString().padEnd(9)} → $${price.toLocaleString().padEnd(10)} | $${profit.toLocaleString().padEnd(8)} | ${formulaUsed}`
  );
});

console.log('\n📊 Break-even Point:');
console.log('At ~$112,000 cost, both formulas give same result ($1,400 profit)');
console.log('Below $112,000: Use Cost + $1,400');
console.log('Above $112,000: Use Cost × 1.0125\n');

console.log('✅ Formula Test Complete!');
