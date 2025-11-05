const { PrismaClient } = require(@prisma/client');
const prisma = new PrismaClient();

async function quickCount() {
  const count = await prisma.customer.count();
  console.log(`Total leads: ${count}`);
  await prisma.$disconnect();
}

quickCount();
