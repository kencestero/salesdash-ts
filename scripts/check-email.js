const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { contains: 'kencestero', mode: 'insensitive' }
    },
    select: { email: true, name: true }
  });
  
  console.log('Found', users.length, 'Kenneth accounts:');
  users.forEach(user => {
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('---');
  });
}

main().finally(() => prisma.$disconnect());
