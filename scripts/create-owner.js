// Create owner account directly
const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createOwner() {
  try {
    const email = 'kencestero@gmail.com';
    const password = 'TempPass123!'; // Change this after first login
    const name = 'Kenneth Cesterol';

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('❌ User already exists with email:', email);
      console.log('User ID:', existing.id);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log('✅ Created user:', user.id);

    // Create profile with owner role
    const profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        firstName: 'Kenneth',
        lastName: 'Cesterol',
        role: 'owner',
        salespersonCode: 'OWNER-001',
        member: true,
      },
    });

    console.log('✅ Created owner profile');
    console.log('');
    console.log('🎉 Account created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: owner');
    console.log('');
    console.log('⚠️ CHANGE YOUR PASSWORD after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createOwner();
