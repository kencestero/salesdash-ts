const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'kencestero@gmail.com';
  const password = 'pENOSKY77200@@';
  
  console.log('🔍 Looking for user:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('✅ User found!');
  console.log('- Email verified:', user.emailVerified ? 'YES' : 'NO');
  console.log('- Has password:', user.password ? 'YES' : 'NO');
  console.log('- Profile:', user.profile ? 'EXISTS' : 'MISSING');
  
  if (user.password) {
    console.log('⚠️  User already has a password! Updating...');
  }
  
  // Hash the password
  console.log('🔐 Hashing password...');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Update user with password and verify email
  console.log('💾 Updating user account...');
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      emailVerified: new Date(), // Ensure email is verified
    }
  });
  
  console.log('✅ SUCCESS! Password added to account!');
  console.log('\n🎉 Kenneth can now login with:');
  console.log('   Email:', email);
  console.log('   Password: pENOSKY77200@@');
  console.log('\n🔗 Login URL: https://mjsalesdash.com/en/auth/login');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
