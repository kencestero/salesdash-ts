require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

const prisma = new PrismaClient();
const SHEET_ID = '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';

async function importAllLeads() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  IMPORT ALL LEADS - NO SKIPPING');
    console.log('═══════════════════════════════════════════════\n');

    // STEP 1: DELETE ALL Google Sheets imports
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
    console.log(`📊 Found ${dataRows.length} rows in Google Sheet\n`);

    // STEP 3: Import ALL leads with smart deduplication
    console.log('STEP 3: Importing ALL leads (no skipping based on phone)...\n');

    const seenPhones = new Set(); // Track phone numbers
    const seenEmails = new Set(); // Track emails
    const seenNames = new Set();  // Track name combinations

    let imported = 0;
    let skippedDuplicatePhone = 0;
    let skippedDuplicateEmail = 0;
    let skippedDuplicateName = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      const getCol = (name) => {
        const idx = headers.findIndex(h => h?.toLowerCase().trim() === name.toLowerCase().trim());
        return idx >= 0 ? (row[idx] || '').toString().trim() : '';
      };

      // Get ALL fields
      const customerNames = getCol('Customer Names');
      const phoneRaw = getCol('Customer Phone Number');
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

      // Parse phone - accept ANY value (including "Na", "Unknown", etc.)
      const digits = phoneRaw.replace(/\D/g, '');
      const phone = digits.length >= 10 ? digits.slice(-10) : (phoneRaw ? phoneRaw : null);

      // Parse name
      let firstName = 'Unknown';
      let lastName = '';
      if (customerNames) {
        const parts = customerNames.trim().split(/\s+/);
        firstName = parts[0] || 'Unknown';
        lastName = parts.slice(1).join(' ') || '';
      }

      // Create unique identifier for deduplication
      const nameKey = `${firstName}_${lastName}_${email || 'no-email'}`;

      // Smart deduplication strategy
      let skipReason = null;

      // Priority 1: Check phone duplicates (if valid 10-digit phone)
      if (digits.length >= 10) {
        if (seenPhones.has(phone)) {
          skipReason = 'duplicate_phone';
          skippedDuplicatePhone++;
        } else {
          seenPhones.add(phone);
        }
      }

      // Priority 2: Check email duplicates (if no phone or invalid phone)
      if (!skipReason && email && email.includes('@') && email !== '@leads.mjcargotrailers.com') {
        if (seenEmails.has(email)) {
          skipReason = 'duplicate_email';
          skippedDuplicateEmail++;
        } else {
          seenEmails.add(email);
        }
      }

      // Priority 3: Check name duplicates (if no phone and no email)
      if (!skipReason && !email && digits.length < 10) {
        if (seenNames.has(nameKey)) {
          skipReason = 'duplicate_name';
          skippedDuplicateName++;
        } else {
          seenNames.add(nameKey);
        }
      }

      // Skip if duplicate
      if (skipReason) {
        continue;
      }

      // Parse date
      let dateApplied = null;
      if (dateAppliedRaw) {
        try {
          const parsedDate = new Date(dateAppliedRaw);
          if (!isNaN(parsedDate.getTime())) dateApplied = parsedDate;
        } catch (e) {}
      }

      // Create customer - IMPORT EVERYTHING
      try {
        await prisma.customer.create({
          data: {
            firstName,
            lastName,
            email: (email && email.includes('@') && email !== '@leads.mjcargotrailers.com') ? email : null,
            phone,  // Store ANY phone value, including "Na", "Unknown", etc.
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
        // Only skip if Prisma throws unique constraint error (email duplicate in DB)
        if (error.code === 'P2002') {
          console.log(`  ⚠️  Skipped row ${rowNum} - duplicate email in database: ${email}`);
        } else {
          console.error(`  ❌ Error importing row ${rowNum}:`, error.message);
          // Don't throw - continue importing other rows
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ IMPORT COMPLETE - ALL LEADS IMPORTED');
    console.log('═══════════════════════════════════════════════');
    console.log(`📊 Total rows in sheet: ${dataRows.length}`);
    console.log(`✅ Imported: ${imported} UNIQUE leads`);
    console.log(`\n📋 Skipped duplicates:`);
    console.log(`   - Duplicate phone: ${skippedDuplicatePhone}`);
    console.log(`   - Duplicate email: ${skippedDuplicateEmail}`);
    console.log(`   - Duplicate name: ${skippedDuplicateName}`);
    console.log(`   - Total skipped: ${skippedDuplicatePhone + skippedDuplicateEmail + skippedDuplicateName}`);
    console.log('═══════════════════════════════════════════════\n');

    const finalCount = await prisma.customer.count({ where: { source: 'google_sheets' } });
    console.log(`📊 Final database count: ${finalCount} customers\n`);

    if (finalCount !== imported) {
      console.log(`⚠️  WARNING: Database count (${finalCount}) doesn't match imported count (${imported})`);
      console.log(`   This could mean some leads failed to save.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

importAllLeads();
