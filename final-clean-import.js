require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

const prisma = new PrismaClient();
const SHEET_ID = '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';

async function finalImport() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  FINAL CLEAN IMPORT - DELETING ALL DUPES');
    console.log('═══════════════════════════════════════════════\n');

    // STEP 1: DELETE EVERYTHING
    console.log('STEP 1: Deleting ALL Google Sheets imports...');
    const deleted = await prisma.customer.deleteMany({
      where: { source: 'google_sheets' }
    });
    console.log(`✅ Deleted ${deleted.count} records\n`);

    // STEP 2: Fetch from Google Sheets
    console.log('STEP 2: Fetching from Google Sheets...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Leads!A:Z',
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const dataRows = rows.slice(1);
    console.log(`📊 Found ${dataRows.length} rows\n`);

    // STEP 3: Import with STRICT deduplication
    console.log('STEP 3: Importing with deduplication...\n');

    const seen = new Set(); // Track phones we've already imported
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      const getCol = (name) => {
        const idx = headers.findIndex(h => h?.toLowerCase().trim() === name.toLowerCase().trim());
        return idx >= 0 ? (row[idx] || '').toString().trim() : '';
      };

      // Get phone
      const phoneRaw = getCol('Customer Phone Number');
      const digits = phoneRaw.replace(/\D/g, '');
      const phone = digits.length >= 10 ? digits.slice(-10) : null;

      // Skip if no phone OR already imported this phone
      if (!phone) {
        skipped++;
        continue;
      }

      if (seen.has(phone)) {
        skipped++;
        continue; // SKIP DUPLICATE
      }

      seen.add(phone); // Mark as imported

      // Get name
      const customerNames = getCol('Customer Names');
      let firstName = 'Unknown';
      let lastName = '';
      if (customerNames) {
        const parts = customerNames.trim().split(/\s+/);
        firstName = parts[0] || 'Unknown';
        lastName = parts.slice(1).join(' ') || '';
      }

      // Get other fields
      const email = getCol('Email');
      const repFullName = getCol('Rep Full  Name') || getCol('Rep Full Name');
      const assignedManager = getCol('Assigned Manager');
      const status = getCol('Status') || 'Needs Attention – No Contact';
      const applied = getCol('Applied')?.toLowerCase() === 'yes';
      const trailerSize = getCol('Trailer Size');
      const stockNumber = getCol('Stock Number (If in stock) or Factory Order');
      const financingType = getCol('Cash/Finance/Rent to Own');
      const dateAppliedRaw = getCol('Date of Submission');
      const managerNotes = getCol('Manager Notes');
      const repNotes = getCol('Rep Notes');

      // Parse date
      let dateApplied = null;
      if (dateAppliedRaw) {
        try {
          const parsedDate = new Date(dateAppliedRaw);
          if (!isNaN(parsedDate.getTime())) dateApplied = parsedDate;
        } catch (e) {}
      }

      // Create customer (skip if email duplicate)
      try {
        await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email: (email && email.includes('@') && email !== '@leads.mjcargotrailers.com') ? email : null,
          phone,
          source: 'google_sheets',
          status,
          salesRepName: repFullName || null,
          assignedToName: assignedManager || null,
          applied,
          trailerSize: trailerSize || null,
          stockNumber: stockNumber || null,
          financingType: financingType || null,
          dateApplied,
          managerNotes: managerNotes || null,
          repNotes: repNotes || null,
          lastContactedAt: new Date(),
        }
        });

        imported++;

        if (imported % 100 === 0) {
          console.log(`  ✅ Imported ${imported} leads...`);
        }
      } catch (error) {
        // Skip if duplicate email
        if (error.code === 'P2002') {
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ FINAL IMPORT COMPLETE');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ Imported: ${imported} UNIQUE leads`);
    console.log(`⏭️  Skipped: ${skipped} (no phone or duplicate)`);
    console.log('═══════════════════════════════════════════════\n');

    const finalCount = await prisma.customer.count({ where: { source: 'google_sheets' } });
    console.log(`📊 Final database count: ${finalCount} customers\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

finalImport();
