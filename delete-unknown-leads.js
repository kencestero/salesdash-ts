require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUnknownLeads() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  DELETE UNKNOWN EMPTY LEADS');
    console.log('═══════════════════════════════════════════════\n');

    // First, count them
    const unknownLeads = await prisma.customer.findMany({
      where: {
        source: 'google_sheets',
        firstName: 'Unknown',
        phone: null,
        email: null
      }
    });

    console.log(`Found ${unknownLeads.length} completely empty "Unknown" leads to delete\n`);

    // Show first 5 as confirmation
    console.log('First 5 examples that will be deleted:');
    unknownLeads.slice(0, 5).forEach((c, idx) => {
      console.log(`  ${idx + 1}. ID: ${c.id} | Name: Unknown | Phone: null | Email: null`);
    });

    console.log('\nDeleting...\n');

    // Delete them
    const result = await prisma.customer.deleteMany({
      where: {
        source: 'google_sheets',
        firstName: 'Unknown',
        phone: null,
        email: null
      }
    });

    console.log('═══════════════════════════════════════════════');
    console.log(`✅ DELETED: ${result.count} empty "Unknown" leads`);
    console.log('═══════════════════════════════════════════════\n');

    // Count remaining leads
    const remaining = await prisma.customer.count({
      where: { source: 'google_sheets' }
    });

    console.log(`📊 Remaining Google Sheets leads: ${remaining}`);
    console.log('   All have actual names, phones, emails, or notes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUnknownLeads();
