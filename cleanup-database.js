/**
 * MJ SalesDash Database Cleanup Script
 *
 * PURPOSE: Remove all personal data, leads, and user information while
 *          preserving system tools, templates, and infrastructure
 *
 * USAGE: node cleanup-database.js [--dry-run] [--confirm]
 *
 * ⚠️  WARNING: THIS IS A DESTRUCTIVE OPERATION!
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --confirm    Skip confirmation prompt (use with caution!)
 */

const { PrismaClient } = require('./lib/generated/prisma');
const readline = require('readline');

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const autoConfirm = args.includes('--confirm');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

async function getCounts() {
  return {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    leads: await prisma.lead.count(),
    leadEvents: await prisma.leadEvent.count(),
    leadNotes: await prisma.leadNote.count(),
    activities: await prisma.activity.count(),
    emails: await prisma.email.count(),
    quotes: await prisma.quote.count(),
    quoteActivities: await prisma.quoteActivity.count(),
    creditApps: await prisma.creditApplication.count(),
    deals: await prisma.deal.count(),
    deliveryRecords: await prisma.deliveryRecord.count(),
    messages: await prisma.internalMessage.count(),
    chatMessages: await prisma.chatMessage.count(),
    chatThreads: await prisma.chatThread.count(),
    chatAttachments: await prisma.chatAttachment.count(),
    calendarEvents: await prisma.calendarEvent.count(),
    sessions: await prisma.session.count(),
    accounts: await prisma.account.count(),
    dashboardVisits: await prisma.dashboardVisit.count(),
    pushSubscriptions: await prisma.pushSubscription.count(),
    webAuthnCredentials: await prisma.webAuthnCredential.count(),
    trailerRequests: await prisma.trailerRequest.count(),

    // What should remain
    trailers: await prisma.trailer.count(),
    emailTemplates: await prisma.emailTemplate.count(),
    helpArticles: await prisma.helpArticle.count(),
    pricingPolicies: await prisma.pricingPolicy.count(),
    uploadReports: await prisma.uploadReport.count(),
  };
}

function displayCounts(counts, label) {
  logSection(label);

  log('\nData to be DELETED:', 'red');
  console.log(`  Users:                ${counts.users}`);
  console.log(`  Customers (CRM):      ${counts.customers}`);
  console.log(`  Leads:                ${counts.leads}`);
  console.log(`  Lead Events:          ${counts.leadEvents}`);
  console.log(`  Lead Notes:           ${counts.leadNotes}`);
  console.log(`  Activities:           ${counts.activities}`);
  console.log(`  Emails:               ${counts.emails}`);
  console.log(`  Quotes:               ${counts.quotes}`);
  console.log(`  Quote Activities:     ${counts.quoteActivities}`);
  console.log(`  Credit Apps:          ${counts.creditApps}`);
  console.log(`  Deals:                ${counts.deals}`);
  console.log(`  Delivery Records:     ${counts.deliveryRecords}`);
  console.log(`  Internal Messages:    ${counts.messages}`);
  console.log(`  Chat Messages:        ${counts.chatMessages}`);
  console.log(`  Chat Threads:         ${counts.chatThreads}`);
  console.log(`  Chat Attachments:     ${counts.chatAttachments}`);
  console.log(`  Trailer Requests:     ${counts.trailerRequests}`);
  console.log(`  Calendar Events:      ${counts.calendarEvents}`);
  console.log(`  Sessions:             ${counts.sessions}`);
  console.log(`  OAuth Accounts:       ${counts.accounts}`);
  console.log(`  Dashboard Visits:     ${counts.dashboardVisits}`);
  console.log(`  Push Subscriptions:   ${counts.pushSubscriptions}`);
  console.log(`  WebAuthn Credentials: ${counts.webAuthnCredentials}`);

  log('\nData to be PRESERVED:', 'green');
  console.log(`  Trailers:             ${counts.trailers}`);
  console.log(`  Email Templates:      ${counts.emailTemplates}`);
  console.log(`  Help Articles:        ${counts.helpArticles}`);
  console.log(`  Pricing Policies:     ${counts.pricingPolicies}`);
  console.log(`  Upload Reports:       ${counts.uploadReports}`);
}

async function askConfirmation(question) {
  if (autoConfirm) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function performCleanup() {
  logSection('Starting Database Cleanup');

  if (isDryRun) {
    log('🔍 DRY RUN MODE - No data will be deleted\n', 'yellow');
  } else {
    log('⚠️  LIVE MODE - Data will be permanently deleted!\n', 'red');
  }

  // Get current counts
  log('Fetching current database counts...', 'blue');
  const beforeCounts = await getCounts();
  displayCounts(beforeCounts, 'Current Database State');

  if (isDryRun) {
    log('\n✓ Dry run complete. No data was modified.', 'green');
    return;
  }

  // Confirmation
  console.log('\n');
  log('⚠️  FINAL WARNING ⚠️', 'red');
  log('This will permanently delete all personal data, users, and business records.', 'red');
  log('System tools, templates, and inventory will be preserved.\n', 'yellow');

  const confirmed = await askConfirmation('Are you absolutely sure you want to proceed?');

  if (!confirmed) {
    log('\n❌ Cleanup cancelled by user.', 'yellow');
    return;
  }

  // Second confirmation
  const doubleConfirmed = await askConfirmation('Type "yes" again to confirm deletion');

  if (!doubleConfirmed) {
    log('\n❌ Cleanup cancelled by user.', 'yellow');
    return;
  }

  // Perform cleanup in transaction
  logSection('Executing Cleanup');

  try {
    await prisma.$transaction(async (tx) => {
      log('Phase 1: Deleting most dependent records...', 'blue');

      const activityCount = await tx.activity.deleteMany({});
      log(`  ✓ Deleted ${activityCount.count} activities`, 'green');

      const leadEventCount = await tx.leadEvent.deleteMany({});
      log(`  ✓ Deleted ${leadEventCount.count} lead events`, 'green');

      const leadNoteCount = await tx.leadNote.deleteMany({});
      log(`  ✓ Deleted ${leadNoteCount.count} lead notes`, 'green');

      const calendarCount = await tx.calendarEvent.deleteMany({});
      log(`  ✓ Deleted ${calendarCount.count} calendar events`, 'green');

      const emailCount = await tx.email.deleteMany({});
      log(`  ✓ Deleted ${emailCount.count} emails`, 'green');

      const deliveryCount = await tx.deliveryRecord.deleteMany({});
      log(`  ✓ Deleted ${deliveryCount.count} delivery records`, 'green');

      const trailerReqCount = await tx.trailerRequest.deleteMany({});
      log(`  ✓ Deleted ${trailerReqCount.count} trailer requests`, 'green');

      log('\nPhase 2: Deleting quote and deal data...', 'blue');

      const quoteActivityCount = await tx.quoteActivity.deleteMany({});
      log(`  ✓ Deleted ${quoteActivityCount.count} quote activities`, 'green');

      const quoteCount = await tx.quote.deleteMany({});
      log(`  ✓ Deleted ${quoteCount.count} quotes`, 'green');

      const dealCount = await tx.deal.deleteMany({});
      log(`  ✓ Deleted ${dealCount.count} deals`, 'green');

      const creditAppCount = await tx.creditApplication.deleteMany({});
      log(`  ✓ Deleted ${creditAppCount.count} credit applications`, 'green');

      log('\nPhase 3: Deleting chat/message data...', 'blue');

      const chatAttachmentCount = await tx.chatAttachment.deleteMany({});
      log(`  ✓ Deleted ${chatAttachmentCount.count} chat attachments`, 'green');

      const chatMessageCount = await tx.chatMessage.deleteMany({});
      log(`  ✓ Deleted ${chatMessageCount.count} chat messages`, 'green');

      const chatParticipantCount = await tx.chatParticipant.deleteMany({});
      log(`  ✓ Deleted ${chatParticipantCount.count} chat participants`, 'green');

      const chatThreadCount = await tx.chatThread.deleteMany({});
      log(`  ✓ Deleted ${chatThreadCount.count} chat threads`, 'green');

      const messageCount = await tx.internalMessage.deleteMany({});
      log(`  ✓ Deleted ${messageCount.count} internal messages`, 'green');

      log('\nPhase 4: Deleting customer/lead data...', 'blue');

      const customerCount = await tx.customer.deleteMany({});
      log(`  ✓ Deleted ${customerCount.count} customers`, 'green');

      const leadCount = await tx.lead.deleteMany({});
      log(`  ✓ Deleted ${leadCount.count} leads`, 'green');

      log('\nPhase 5: Deleting user data and sessions...', 'blue');

      const visitCount = await tx.dashboardVisit.deleteMany({});
      log(`  ✓ Deleted ${visitCount.count} dashboard visits`, 'green');

      const pushSubCount = await tx.pushSubscription.deleteMany({});
      log(`  ✓ Deleted ${pushSubCount.count} push subscriptions`, 'green');

      const webauthnCount = await tx.webAuthnCredential.deleteMany({});
      log(`  ✓ Deleted ${webauthnCount.count} WebAuthn credentials`, 'green');

      const sessionCount = await tx.session.deleteMany({});
      log(`  ✓ Deleted ${sessionCount.count} sessions`, 'green');

      const accountCount = await tx.account.deleteMany({});
      log(`  ✓ Deleted ${accountCount.count} OAuth accounts`, 'green');

      const tokenCount = await tx.verificationToken.deleteMany({});
      log(`  ✓ Deleted ${tokenCount.count} verification tokens`, 'green');

      const pendingCount = await tx.pendingUser.deleteMany({});
      log(`  ✓ Deleted ${pendingCount.count} pending users`, 'green');

      const profileCount = await tx.userProfile.deleteMany({});
      log(`  ✓ Deleted ${profileCount.count} user profiles`, 'green');

      const userCount = await tx.user.deleteMany({});
      log(`  ✓ Deleted ${userCount.count} users`, 'green');

      log('\nPhase 6: Cleaning orphaned references...', 'blue');

      const trailerUpdate = await tx.trailer.updateMany({
        where: { assignedToUserId: { not: null } },
        data: { assignedToUserId: null },
      });
      log(`  ✓ Cleared ${trailerUpdate.count} trailer assignments`, 'green');
    });

    logSection('Cleanup Complete');
    log('✓ All personal data has been deleted successfully', 'green');

    // Get final counts
    log('\nFetching final database counts...', 'blue');
    const afterCounts = await getCounts();
    displayCounts(afterCounts, 'Final Database State');

    // Verify cleanup
    logSection('Verification');
    const allClean =
      afterCounts.users === 0 &&
      afterCounts.customers === 0 &&
      afterCounts.leads === 0 &&
      afterCounts.activities === 0;

    if (allClean) {
      log('✓ Verification passed: All personal data removed', 'green');
    } else {
      log('⚠️  Warning: Some data may remain. Please review counts above.', 'yellow');
    }

    log('\n✓ Database cleanup completed successfully!', 'green');

  } catch (error) {
    log('\n❌ Error during cleanup:', 'red');
    console.error(error);
    log('\n⚠️  Transaction was rolled back. No data was deleted.', 'yellow');
    throw error;
  }
}

async function main() {
  try {
    await performCleanup();
  } catch (error) {
    log('\n❌ Cleanup failed:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
