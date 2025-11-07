/**
 * One-time script: Backfill zero prices to null
 *
 * Converts all trailers with salePrice = 0 to salePrice = null
 * so they display "Ask for Pricing" instead of $0.00
 *
 * Usage:
 *   npx tsx scripts/backfill-zero-prices.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding trailers with salePrice = 0...');

  const count = await prisma.trailer.count({
    where: { salePrice: 0 }
  });

  console.log(`📊 Found ${count} trailer(s) with $0 sale price`);

  if (count === 0) {
    console.log('✅ No trailers to update!');
    return;
  }

  console.log('🔄 Updating salePrice to null...');

  const result = await prisma.trailer.updateMany({
    where: { salePrice: 0 },
    data: { salePrice: null as any }
  });

  console.log(`✅ Updated ${result.count} trailer(s)`);
  console.log('✨ Backfill complete! Trailers will now show "Ask for Pricing"');
}

main()
  .catch((error) => {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
