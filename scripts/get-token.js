const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getToken() {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: 'kencestero@gmail.com' },
      orderBy: { expires: 'desc' }
    });

    if (token) {
      const verificationUrl = `https://salesdash-ts.vercel.app/api/auth/verify?token=${token.token}`;
      console.log('\n✅ VERIFICATION LINK:');
      console.log(verificationUrl);
      console.log('\nClick this link to verify your email!\n');
    } else {
      console.log('❌ No verification token found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getToken();
