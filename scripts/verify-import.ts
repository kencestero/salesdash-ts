import { PrismaClient } from '../lib/generated/prisma/index.js';

const prisma = new PrismaClient();

async function verifyImport() {
  try {
    const totalCount = await prisma.trailer.count();
    console.log(`\nTotal trailers in database: ${totalCount}`);

    const diamondCargoCount = await prisma.trailer.count({
      where: { manufacturer: 'Diamond Cargo' }
    });
    console.log(`Diamond Cargo trailers: ${diamondCargoCount}`);

    const sampleTrailers = await prisma.trailer.findMany({
      where: { manufacturer: 'Diamond Cargo' },
      select: {
        vin: true,
        stockNumber: true,
        model: true,
        year: true,
        salePrice: true,
        status: true,
      },
      take: 5,
    });

    console.log('\nSample trailers imported:');
    sampleTrailers.forEach(trailer => {
      console.log(`  - ${trailer.stockNumber}: ${trailer.year} ${trailer.model} - $${trailer.salePrice} (${trailer.status})`);
    });

  } catch (error) {
    console.error('Error verifying import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyImport();
