const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  const email = 'kencestero@gmail.com';

  try {
    // Find user first
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('Found user:', user.id, user.email);

    // Delete user profile first (foreign key constraint)
    if (user.profile) {
      await prisma.userProfile.delete({
        where: { userId: user.id }
      });
      console.log('✅ Deleted user profile');
    }

    // Delete verification tokens
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });
    console.log('✅ Deleted verification tokens');

    // Delete user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('✅ Deleted user account');

    console.log('🎉 Successfully deleted:', email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
