// Quick script to add test data to your database
import { prisma } from "../lib/prisma";

async function seedTestData() {
  console.log("🌱 Seeding test data...");

  // Add 5 test customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "555-0101",
        status: "lead",
        source: "website",
        city: "Austin",
        state: "TX",
        zipcode: "78701",
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "555-0102",
        status: "contacted",
        source: "referral",
        city: "Houston",
        state: "TX",
        zipcode: "77001",
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        phone: "555-0103",
        status: "Applied",
        source: "google",
        city: "Dallas",
        state: "TX",
        zipcode: "75201",
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "555-0104",
        status: "Approved",
        source: "website",
        city: "San Antonio",
        state: "TX",
        zipcode: "78201",
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Bob",
        lastName: "Brown",
        email: "bob.brown@example.com",
        phone: "555-0105",
        status: "lead",
        source: "facebook",
        city: "El Paso",
        state: "TX",
        zipcode: "79901",
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Add 5 test trailers
  const trailers = await Promise.all([
    prisma.trailer.create({
      data: {
        vin: "TEST-VIN-001",
        manufacturer: "Diamond Cargo",
        model: "8.5x20 TA3",
        year: 2024,
        cost: 8500,
        price: 9900, // Calculated: 8500 * 1.0125 = 8606.25, but min profit is $1400, so 8500 + 1400 = 9900
        status: "available",
        length: 20,
        width: 8.5,
        height: 7,
        axles: 2,
        description: "Enclosed cargo trailer, 8.5x20, tandem axle",
      },
    }),
    prisma.trailer.create({
      data: {
        vin: "TEST-VIN-002",
        manufacturer: "Quality Trailers",
        model: "7x16 SA",
        year: 2024,
        cost: 5200,
        price: 6600, // 5200 + 1400 = 6600
        status: "available",
        length: 16,
        width: 7,
        height: 6.5,
        axles: 1,
        description: "Single axle cargo trailer, perfect for small loads",
      },
    }),
    prisma.trailer.create({
      data: {
        vin: "TEST-VIN-003",
        manufacturer: "Panther Cargo",
        model: "8.5x24 TA3",
        year: 2024,
        cost: 12000,
        price: 13400, // 12000 + 1400 = 13400
        status: "available",
        length: 24,
        width: 8.5,
        height: 7,
        axles: 2,
        description: "Large enclosed trailer with ramp door",
      },
    }),
    prisma.trailer.create({
      data: {
        vin: "TEST-VIN-004",
        manufacturer: "Diamond Cargo",
        model: "6x12 SA",
        year: 2023,
        cost: 3800,
        price: 5200, // 3800 + 1400 = 5200
        status: "sold",
        length: 12,
        width: 6,
        height: 6,
        axles: 1,
        description: "Compact cargo trailer, recently sold",
      },
    }),
    prisma.trailer.create({
      data: {
        vin: "TEST-VIN-005",
        manufacturer: "Quality Trailers",
        model: "8.5x18 TA2",
        year: 2024,
        cost: 7200,
        price: 8600, // 7200 + 1400 = 8600
        status: "reserved",
        length: 18,
        width: 8.5,
        height: 6.5,
        axles: 2,
        description: "Mid-size enclosed trailer, currently reserved",
      },
    }),
  ]);

  console.log(`✅ Created ${trailers.length} trailers`);

  console.log("\n🎉 Test data seeded successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Trailers: ${trailers.length}`);
  console.log(`\nRefresh your dashboard to see the new data!`);
}

seedTestData()
  .catch((error) => {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
