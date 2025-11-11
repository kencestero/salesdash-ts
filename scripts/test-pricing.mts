/**
 * Test script to verify pricing logic
 *
 * Usage: npx tsx scripts/test-pricing.mts
 */

import { computeSellingPrice } from '../lib/pricing/compute.js';

console.log('\n🧪 Testing Pricing Logic\n');
console.log('Formula: MAX(cost × 1.25, cost + $1,400)\n');

// Test Case 1: Cost $3,425
console.log('Test 1: Cost $3,425');
const test1 = computeSellingPrice(3425);
console.log(`  Expected Price: $4,825`);
console.log(`  Actual Price: $${test1.price?.toFixed(2)}`);
console.log(`  Status: ${test1.pricingStatus}`);
console.log(`  Result: ${test1.price === 4825 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 2: Cost $18,425
console.log('Test 2: Cost $18,425');
const test2 = computeSellingPrice(18425);
console.log(`  Expected Price: $23,031`);
console.log(`  Actual Price: $${test2.price?.toFixed(2)}`);
console.log(`  Status: ${test2.pricingStatus}`);
console.log(`  Result: ${Math.round(test2.price!) === 23031 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 3: Textual cost
console.log('Test 3: Textual Cost "Call for Price"');
const test3 = computeSellingPrice('Call for Price');
console.log(`  Expected Price: null`);
console.log(`  Actual Price: ${test3.price}`);
console.log(`  Expected Status: ASK_FOR_PRICING`);
console.log(`  Actual Status: ${test3.pricingStatus}`);
console.log(`  Result: ${test3.price === null && test3.pricingStatus === 'ASK_FOR_PRICING' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 4: Another textual cost
console.log('Test 4: Textual Cost "Make an Offer"');
const test4 = computeSellingPrice('Make an Offer');
console.log(`  Expected Price: null`);
console.log(`  Actual Price: ${test4.price}`);
console.log(`  Expected Status: ASK_FOR_PRICING`);
console.log(`  Actual Status: ${test4.pricingStatus}`);
console.log(`  Result: ${test4.price === null && test4.pricingStatus === 'ASK_FOR_PRICING' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 5: Edge case - very low cost
console.log('Test 5: Low Cost $500');
const test5 = computeSellingPrice(500);
const expectedPrice5 = 500 + 1400; // Min profit path
console.log(`  Expected Price: $${expectedPrice5} (min profit path)`);
console.log(`  Actual Price: $${test5.price?.toFixed(2)}`);
console.log(`  Status: ${test5.pricingStatus}`);
console.log(`  Result: ${test5.price === expectedPrice5 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 6: Edge case - very high cost
console.log('Test 6: High Cost $50,000');
const test6 = computeSellingPrice(50000);
const expectedPrice6 = Math.round(50000 * 1.25); // 25% markup path
console.log(`  Expected Price: $${expectedPrice6} (25% markup path)`);
console.log(`  Actual Price: $${test6.price?.toFixed(2)}`);
console.log(`  Status: ${test6.pricingStatus}`);
console.log(`  Result: ${test6.price === expectedPrice6 ? '✅ PASS' : '❌ FAIL'}\n`);

console.log('✅ All core tests complete!\n');
