const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function quickCount() {
  const count = await prisma.customer.count();
  console.log(`Total leads: ${count}`);
  await prisma.$disconnect();
}

quickCount();
