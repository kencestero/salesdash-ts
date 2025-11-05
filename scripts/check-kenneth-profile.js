const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'kencestero@gmail.com' },
    include: { profile: true }
  });
  
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  console.log('USER INFO:');
  console.log('- Email:', user.email);
  console.log('- Name:', user.name);
  console.log('\nPROFILE:');
  if (user.profile) {
    console.log('- Rep Code:', user.profile.repCode || 'MISSING!');
    console.log('- Salesperson Code:', user.profile.salespersonCode || 'N/A');
    console.log('- Role:', user.profile.role);
    console.log('- Status:', user.profile.status);
    console.log('- First Name:', user.profile.firstName);
    console.log('- Last Name:', user.profile.lastName);
  } else {
    console.log('NO PROFILE!');
  }
}

main().finally(() => prisma.$disconnect());
