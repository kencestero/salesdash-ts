const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'kencestero@gmail.com' },
    include: { userProfile: true }
  });

  if (user) {
    console.log('\n✅ User exists:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Email Verified:', user.emailVerified);
    console.log('Name:', user.name);
    console.log('\nProfile:');
    console.log('Salesperson Code:', user.userProfile?.salespersonCode);
    console.log('Role:', user.userProfile?.role);
    console.log('Member:', user.userProfile?.member);
  } else {
    console.log('\n❌ User does not exist');
  }

  // Check for verification token
  const token = await prisma.verificationToken.findFirst({
    where: { identifier: 'kencestero@gmail.com' },
    orderBy: { expires: 'desc' }
  });

  if (token) {
    console.log('\n✅ Verification token exists:');
    console.log('Token:', token.token);
    console.log('Expires:', token.expires);
  } else {
    console.log('\n❌ No verification token found');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
