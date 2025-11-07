// Quick script to check if user exists
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node check-user.js <email>');
      process.exit(1);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (user) {
      console.log('✅ User found!');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Email Verified:', user.emailVerified ? 'Yes' : 'No');
      console.log('Has Password:', user.password ? 'Yes' : 'No');
      if (user.profile) {
        console.log('Role:', user.profile.role);
        console.log('Salesperson Code:', user.profile.salespersonCode);
        console.log('Member:', user.profile.member ? 'Yes' : 'No');
      } else {
        console.log('⚠️ No profile found');
      }
    } else {
      console.log('❌ No user found with email:', email);
      console.log('You need to sign up first!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
