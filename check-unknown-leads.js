require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUnknownLeads() {
  try {
    const unknownLeads = await prisma.customer.findMany({
      where: {
        source: 'google_sheets',
        firstName: 'Unknown'
      }
    });

    console.log('═══════════════════════════════════════════════');
    console.log('  UNKNOWN LEADS ANALYSIS');
    console.log('═══════════════════════════════════════════════\n');

    console.log(`Total "Unknown" leads: ${unknownLeads.length}`);

    console.log('\n📋 First 10 examples:\n');
    unknownLeads.slice(0, 10).forEach((c, idx) => {
      console.log(`${idx + 1}. ID: ${c.id}`);
      console.log(`   Phone: ${c.phone || 'NO PHONE'}`);
      console.log(`   Email: ${c.email || 'NO EMAIL'}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Manager Notes: ${c.managerNotes || 'none'}`);
      console.log(`   Rep Notes: ${c.repNotes || 'none'}`);
      console.log('');
    });

    // Count total Google Sheets leads
    const totalGoogleLeads = await prisma.customer.count({
      where: { source: 'google_sheets' }
    });

    console.log('═══════════════════════════════════════════════');
    console.log(`Total Google Sheets leads: ${totalGoogleLeads}`);
    console.log(`Unknown leads: ${unknownLeads.length}`);
    console.log(`Valid named leads: ${totalGoogleLeads - unknownLeads.length}`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnknownLeads();
