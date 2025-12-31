// Quick diagnostic script to check trailer counts
// Run with: node check-inventory-count.js

const { PrismaClient } = require("./lib/generated/prisma");
const prisma = new PrismaClient();

async function checkInventory() {
  try {
    console.log("📊 Checking trailer inventory counts...\n");

    // Total count
    const totalCount = await prisma.trailer.count();
    console.log(`Total trailers in database: ${totalCount}`);

    // Count by status
    const byStatus = await prisma.trailer.groupBy({
      by: ["status"],
      _count: true,
    });
    console.log("\n📋 By Status:");
    byStatus.forEach((s) => {
      console.log(`  ${s.status}: ${s._count}`);
    });

    // Count by manufacturer
    const byManufacturer = await prisma.trailer.groupBy({
      by: ["manufacturer"],
      _count: true,
    });
    console.log("\n🏭 By Manufacturer:");
    byManufacturer.forEach((m) => {
      console.log(`  ${m.manufacturer}: ${m._count}`);
    });

    // Check for duplicates
    const duplicateVins = await prisma.$queryRaw`
      SELECT vin, COUNT(*) as count
      FROM "Trailer"
      GROUP BY vin
      HAVING COUNT(*) > 1
    `;
    console.log("\n🔍 Duplicate VINs:");
    if (duplicateVins.length > 0) {
      duplicateVins.forEach((d) => {
        console.log(`  ${d.vin}: ${d.count} instances`);
      });
    } else {
      console.log("  None found ✅");
    }

    // Check for duplicatestock numbers
    const duplicateStocks = await prisma.$queryRaw`
      SELECT "stockNumber", COUNT(*) as count
      FROM "Trailer"
      GROUP BY "stockNumber"
      HAVING COUNT(*) > 1
    `;
    console.log("\n🔍 Duplicate Stock Numbers:");
    if (duplicateStocks.length > 0) {
      duplicateStocks.forEach((d) => {
        console.log(`  ${d.stockNumber}: ${d.count} instances`);
      });
    } else {
      console.log("  None found ✅");
    }

    // Recent uploads
    const recentTrailers = await prisma.trailer.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        stockNumber: true,
        vin: true,
        manufacturer: true,
        status: true,
        createdAt: true,
      },
    });
    console.log("\n📅 Most Recent Trailers:");
    recentTrailers.forEach((t) => {
      console.log(
        `  ${t.stockNumber} (${t.manufacturer}) - ${t.status} - ${new Date(
          t.createdAt
        ).toLocaleDateString()}`
      );
    });

    console.log("\n✅ Diagnostic complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory();
