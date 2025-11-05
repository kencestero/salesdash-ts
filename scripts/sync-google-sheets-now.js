/**
 * Manual Google Sheets Sync Script
 *
 * Run this to immediately import all leads from Google Sheets
 * Usage: node scripts/sync-google-sheets-now.js
 */

const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

const prisma = new PrismaClient();

// Google Sheets configuration
const SHEET_ID = '1LDdEt-0OvJaIdZCoo1r1bF24yVwBP14fO9bPGfO_5jA';
const SHEET_NAME = 'Form Responses 1';
const RANGE = `${SHEET_NAME}!A:T`;

async function main() {
  console.log('\n🔄 Starting Google Sheets CRM sync...\n');

  // Check environment variables
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    console.error('❌ Missing Google Sheets credentials!');
    console.error('Please set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY in .env');
    process.exit(1);
  }

  const startTime = Date.now();
  const stats = {
    totalInSheet: 0,
    newLeads: 0,
    updatedLeads: 0,
    duplicatesSkipped: 0,
    errors: 0,
  };

  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from sheet
    console.log('📥 Fetching data from Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('⚠️  No data found in Google Sheet');
      return;
    }

    // Skip header row
    const dataRows = rows.slice(1);
    stats.totalInSheet = dataRows.length;

    console.log(`📊 Found ${dataRows.length} leads in Google Sheet\n`);

    // Process each lead
    for (const row of dataRows) {
      try {
        const leadData = {
          timestamp: row[0] || '',           // A - Timestamp
          salesRep: row[1] || '',            // B - Rep Full Name
          customerNames: row[2] || '',       // C - Customer Names
          phone: row[3] || '',               // D - Customer Phone Number ✅
          trailerSize: row[4] || '',         // E - Trailer Size
          assignedManager: row[5] || '',     // F - Assigned Manager
          stockNumber: row[6] || '',         // G - Stock Number
          applied: row[7] || '',             // H - Applied
          dateApplied: row[8] || '',         // I - Date of Submission
          financingType: row[9] || '',       // J - Cash/Finance/RTO
          firstName: row[10] || '',          // K - Customer First Name ✅
          lastName: row[11] || '',           // L - Customer Last Name ✅
          managerNotes: row[12] || '',       // M - Manager Notes
          repNotes: row[13] || '',           // N - Rep Notes
          email: row[14] || '',              // O - Email
          address: row[15] || '',            // P - Address
          zipCode: row[16] || '',            // Q - Zip Code
          state: row[17] || '',              // R - State
        };

        // Clean phone number
        const phone = leadData.phone.replace(/[^\d+]/g, '');
        if (!phone || phone === 'Unknown') {
          stats.errors++;
          continue;
        }

        // Use actual email or generate placeholder
        const email = leadData.email?.trim() || `${phone}@placeholder.com`;

        // Parse financing type
        let financingType = null;
        const financing = leadData.financingType.toLowerCase();
        if (financing.includes('cash')) financingType = 'cash';
        else if (financing.includes('finance')) financingType = 'finance';
        else if (financing.includes('rent') || financing.includes('rto')) financingType = 'rto';

        // Determine status
        let status = 'new';
        const allNotes = `${leadData.managerNotes} ${leadData.repNotes}`.toLowerCase();
        if (allNotes.includes('approved')) status = 'approved';
        else if (allNotes.includes('dead') || allNotes.includes('declined')) status = 'dead';
        else if (leadData.applied || allNotes.includes('applied')) status = 'applied';
        else if (allNotes.includes('contacted')) status = 'contacted';
        else if (allNotes.includes('qualified')) status = 'qualified';

        // Check if lead exists
        const existing = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone },
              { email },
            ],
          },
        });

        if (existing) {
          // Update if needed
          const shouldUpdate =
            leadData.managerNotes && leadData.managerNotes !== existing.managerNotes ||
            leadData.repNotes && leadData.repNotes !== existing.repNotes ||
            leadData.applied !== existing.applied ||
            status !== existing.status;

          if (shouldUpdate) {
            await prisma.customer.update({
              where: { id: existing.id },
              data: {
                managerNotes: leadData.managerNotes || existing.managerNotes,
                repNotes: leadData.repNotes || existing.repNotes,
                applied: leadData.applied ? true : false,
                status,
                updatedAt: new Date(),
              },
            });
            stats.updatedLeads++;
            console.log(`✏️  Updated: ${leadData.firstName} ${leadData.lastName} (${phone})`);
          } else {
            stats.duplicatesSkipped++;
          }
        } else {
          // Create new lead
          await prisma.customer.create({
            data: {
              firstName: leadData.firstName.trim() || 'Unknown',
              lastName: leadData.lastName.trim() || '',
              email,
              phone,
              street: leadData.address?.trim() || null,
              state: leadData.state?.trim() || null,
              zipcode: leadData.zipCode?.trim() || null,
              salesRepName: leadData.salesRep?.trim() || null,
              assignedToName: leadData.assignedManager?.trim() || null,
              trailerSize: leadData.trailerSize?.trim() || null,
              stockNumber: leadData.stockNumber?.trim() || null,
              financingType,
              status,
              applied: leadData.applied ? true : false,
              hasAppliedCredit: leadData.applied ? true : false,
              managerNotes: leadData.managerNotes?.trim() || null,
              repNotes: leadData.repNotes?.trim() || null,
              source: 'google_sheets',
              tags: ['google_sheets', leadData.assignedManager].filter(Boolean),
            },
          });
          stats.newLeads++;
          console.log(`✅ Created: ${leadData.firstName} ${leadData.lastName} (${phone})`);
        }
      } catch (error) {
        stats.errors++;
        const name = `${leadData.firstName || 'Unknown'} ${leadData.lastName || ''}`.trim();
        console.error(`❌ Error processing lead ${name}:`, error.message);
        if (stats.errors <= 5) {
          console.error('   Full error:', error);
          console.error('   Lead data:', JSON.stringify(leadData, null, 2));
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Google Sheets CRM Sync Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total in Sheet:     ${stats.totalInSheet}`);
    console.log(`✅ New Leads Created:  ${stats.newLeads}`);
    console.log(`✏️  Leads Updated:      ${stats.updatedLeads}`);
    console.log(`⏭️  Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`❌ Errors:             ${stats.errors}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
