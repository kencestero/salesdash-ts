/**
 * Simple Database Cleanup Script - Deletes all personal data
 */

const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('\n' + '='.repeat(80));
  console.log('STARTING DATABASE CLEANUP');
  console.log('='.repeat(80));

  try {
    // Get counts before
    console.log('\n📊 BEFORE CLEANUP:');
    const beforeUsers = await prisma.user.count();
    const beforeCustomers = await prisma.customer.count();
    const beforeActivities = await prisma.activity.count();
    const beforeTrailers = await prisma.trailer.count();

    console.log(`  Users: ${beforeUsers}`);
    console.log(`  Customers: ${beforeCustomers}`);
    console.log(`  Activities: ${beforeActivities}`);
    console.log(`  Trailers (should stay): ${beforeTrailers}`);

    console.log('\n🗑️  EXECUTING CLEANUP...\n');

    await prisma.$transaction(async (tx) => {
      // Phase 1: Delete dependent records
      console.log('Phase 1: Deleting dependent records...');

      const act = await tx.activity.deleteMany({});
      console.log(`  ✓ Deleted ${act.count} activities`);

      const lead = await tx.leadNote.deleteMany({});
      console.log(`  ✓ Deleted ${lead.count} lead notes`);

      const cal = await tx.calendarEvent.deleteMany({});
      console.log(`  ✓ Deleted ${cal.count} calendar events`);

      const email = await tx.email.deleteMany({});
      console.log(`  ✓ Deleted ${email.count} emails`);

      // Phase 2: Delete quote and deal data
      console.log('\nPhase 2: Deleting quotes and deals...');

      const qa = await tx.quoteActivity.deleteMany({});
      console.log(`  ✓ Deleted ${qa.count} quote activities`);

      const quote = await tx.quote.deleteMany({});
      console.log(`  ✓ Deleted ${quote.count} quotes`);

      const deal = await tx.deal.deleteMany({});
      console.log(`  ✓ Deleted ${deal.count} deals`);

      const credit = await tx.creditApplication.deleteMany({});
      console.log(`  ✓ Deleted ${credit.count} credit applications`);

      // Phase 3: Delete customer data
      console.log('\nPhase 3: Deleting customers...');

      const cust = await tx.customer.deleteMany({});
      console.log(`  ✓ Deleted ${cust.count} customers`);

      // Phase 4: Delete chat data using raw SQL (must come before users)
      console.log('\nPhase 4: Deleting chat data...');

      await tx.$executeRaw`DELETE FROM "ChatAttachment"`;
      console.log(`  ✓ Deleted chat attachments`);

      await tx.$executeRaw`DELETE FROM "ChatMessage"`;
      console.log(`  ✓ Deleted chat messages`);

      await tx.$executeRaw`DELETE FROM "ChatParticipant"`;
      console.log(`  ✓ Deleted chat participants`);

      await tx.$executeRaw`DELETE FROM "ChatThread"`;
      console.log(`  ✓ Deleted chat threads`);

      // Phase 5: Delete user data and sessions
      console.log('\nPhase 5: Deleting users and sessions...');

      const sess = await tx.session.deleteMany({});
      console.log(`  ✓ Deleted ${sess.count} sessions`);

      const acct = await tx.account.deleteMany({});
      console.log(`  ✓ Deleted ${acct.count} OAuth accounts`);

      const token = await tx.verificationToken.deleteMany({});
      console.log(`  ✓ Deleted ${token.count} verification tokens`);

      const pending = await tx.pendingUser.deleteMany({});
      console.log(`  ✓ Deleted ${pending.count} pending users`);

      const profile = await tx.userProfile.deleteMany({});
      console.log(`  ✓ Deleted ${profile.count} user profiles`);

      const user = await tx.user.deleteMany({});
      console.log(`  ✓ Deleted ${user.count} users`);

      console.log('\n✅ All deletions complete');
    });

    console.log('\n✅ CLEANUP COMPLETE!\n');

    // Get counts after
    console.log('📊 AFTER CLEANUP:');
    const afterUsers = await prisma.user.count();
    const afterCustomers = await prisma.customer.count();
    const afterActivities = await prisma.activity.count();
    const afterTrailers = await prisma.trailer.count();

    console.log(`  Users: ${afterUsers}`);
    console.log(`  Customers: ${afterCustomers}`);
    console.log(`  Activities: ${afterActivities}`);
    console.log(`  Trailers (preserved): ${afterTrailers}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL PERSONAL DATA HAS BEEN DELETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR DURING CLEANUP:');
    console.error(error);
    console.error('\n⚠️  Transaction was rolled back. No data was deleted.\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
