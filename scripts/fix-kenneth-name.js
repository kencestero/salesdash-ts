// Fix Kenneth's name in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixKennethName() {
  try {
    const email = 'kencestero@gmail.com';

    console.log('🔍 Looking for user with email:', email);

    // Find Kenneth's user record
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('✅ Found user:', user.id);
    console.log('Current name:', user.name);
    console.log('Current profile:', user.profile?.firstName, user.profile?.lastName);

    // Update User table name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Kenneth Cestero' },
    });

    console.log('✅ Updated User.name to "Kenneth Cestero"');

    // Update UserProfile lastName
    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: { lastName: 'Cestero' },
      });

      console.log('✅ Updated UserProfile.lastName to "Cestero"');
    }

    console.log('');
    console.log('🎉 Name fixed successfully!');
    console.log('New name: Kenneth Cestero');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixKennethName();
