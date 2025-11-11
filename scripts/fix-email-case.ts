import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fix Email Case Sensitivity Bug
 *
 * This script normalizes all emails in the database to lowercase.
 * This fixes the bug where users couldn't login because signup stored
 * mixed-case emails but login searched for lowercase emails.
 */
async function fixEmailCase() {
  console.log('🔧 Starting email normalization...\n');

  try {
    // 1. Fix User table
    console.log('📧 Normalizing User emails...');
    const users = await prisma.user.findMany();
    let userCount = 0;

    for (const user of users) {
      const normalizedEmail = user.email.toLowerCase().trim();
      if (user.email !== normalizedEmail) {
        console.log(`  Fixing: ${user.email} → ${normalizedEmail}`);

        // Check if normalized email already exists
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (existing && existing.id !== user.id) {
          console.log(`  ⚠️  SKIP: ${normalizedEmail} already exists (duplicate user)`);
          continue;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail }
        });
        userCount++;
      }
    }
    console.log(`✅ Fixed ${userCount} users\n`);

    // 2. Fix PendingUser table
    console.log('📧 Normalizing PendingUser emails...');
    const pendingUsers = await prisma.pendingUser.findMany();
    let pendingCount = 0;

    for (const pendingUser of pendingUsers) {
      const normalizedEmail = pendingUser.email.toLowerCase().trim();
      if (pendingUser.email !== normalizedEmail) {
        console.log(`  Fixing: ${pendingUser.email} → ${normalizedEmail}`);

        // Check if normalized email already exists
        const existing = await prisma.pendingUser.findUnique({
          where: { email: normalizedEmail }
        });

        if (existing && existing.id !== pendingUser.id) {
          console.log(`  ⚠️  SKIP: ${normalizedEmail} already exists in pending (duplicate)`);
          continue;
        }

        await prisma.pendingUser.update({
          where: { id: pendingUser.id },
          data: { email: normalizedEmail }
        });
        pendingCount++;
      }
    }
    console.log(`✅ Fixed ${pendingCount} pending users\n`);

    // 3. Summary
    console.log('🎉 Email normalization complete!');
    console.log(`   Users fixed: ${userCount}`);
    console.log(`   Pending users fixed: ${pendingCount}`);
    console.log(`   Total: ${userCount + pendingCount}`);

    if (userCount + pendingCount === 0) {
      console.log('\n✨ All emails already normalized!');
    }

  } catch (error: any) {
    console.error('❌ Error normalizing emails:', error);
    console.error('   Details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEmailCase();
