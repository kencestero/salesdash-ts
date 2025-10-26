const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function checkLeads() {
  const count = await prisma.customer.count();
  console.log('Total leads in database:', count);

  const recent = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true
    }
  });

  console.log('\nMost recent 5 leads:');
  recent.forEach(lead => {
    console.log(`- ${lead.firstName} ${lead.lastName} (${lead.email}) - Status: ${lead.status} - Created: ${lead.createdAt}`);
  });

  await prisma.$disconnect();
}

checkLeads();
