require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

const prisma = new PrismaClient();
const SHEET_ID = '1T9PRlXBS1LBlB5VL9nwn_m3AIcT6KIjqg5lk3Xy1le8';

async function diagnoseImport() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('  IMPORT DIAGNOSTICS - ANALYZING ALL ROWS');
    console.log('═══════════════════════════════════════════════\n');

    // Fetch from Google Sheets
    console.log('Fetching from Google Sheets...');
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
    console.log(`📊 Total rows in sheet: ${dataRows.length}\n`);

    // Get existing customers from DB
    const existingCustomers = await prisma.customer.findMany({
      select: { phone: true, email: true, source: true }
    });

    const existingPhones = new Set(existingCustomers.map(c => c.phone).filter(Boolean));
    const existingEmails = new Set(existingCustomers.map(c => c.email).filter(Boolean));

    // Categorize each row
    const categories = {
      validImportable: [],
      noPhone: [],
      invalidPhone: [],
      duplicatePhoneInSheet: [],
      duplicatePhoneInDB: [],
      duplicateEmailInDB: [],
    };

    const seenPhones = new Set();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // +2 because Excel is 1-indexed and we skip header

      const getCol = (name) => {
        const idx = headers.findIndex(h => h?.toLowerCase().trim() === name.toLowerCase().trim());
        return idx >= 0 ? (row[idx] || '').toString().trim() : '';
      };

      const customerNames = getCol('Customer Names');
      const phoneRaw = getCol('Customer Phone Number');
      const email = getCol('Email');
      const status = getCol('Status');

      // Parse phone
      const digits = phoneRaw.replace(/\D/g, '');
      const phone = digits.length >= 10 ? digits.slice(-10) : null;

      const rowData = {
        rowNum,
        name: customerNames || 'NO NAME',
        phoneRaw,
        phone,
        email,
        status,
      };

      // Categorize
      if (!phoneRaw || phoneRaw.trim() === '') {
        categories.noPhone.push(rowData);
      } else if (!phone) {
        categories.invalidPhone.push(rowData);
      } else if (seenPhones.has(phone)) {
        categories.duplicatePhoneInSheet.push(rowData);
      } else if (existingPhones.has(phone)) {
        categories.duplicatePhoneInDB.push(rowData);
        seenPhones.add(phone); // Still mark as seen
      } else if (email && email.includes('@') && email !== '@leads.mjcargotrailers.com' && existingEmails.has(email)) {
        categories.duplicateEmailInDB.push(rowData);
        seenPhones.add(phone); // Mark as seen even if skipped
      } else {
        categories.validImportable.push(rowData);
        seenPhones.add(phone);
      }
    }

    // Print detailed breakdown
    console.log('═══════════════════════════════════════════════');
    console.log('  DETAILED BREAKDOWN');
    console.log('═══════════════════════════════════════════════\n');

    console.log(`✅ VALID & IMPORTABLE: ${categories.validImportable.length}`);
    console.log(`   These would be successfully imported\n`);

    console.log(`❌ NO PHONE NUMBER: ${categories.noPhone.length}`);
    if (categories.noPhone.length > 0) {
      console.log(`   First 5 examples:`);
      categories.noPhone.slice(0, 5).forEach(r => {
        console.log(`   - Row ${r.rowNum}: ${r.name} | Status: ${r.status}`);
      });
      console.log('');
    }

    console.log(`❌ INVALID PHONE (less than 10 digits): ${categories.invalidPhone.length}`);
    if (categories.invalidPhone.length > 0) {
      console.log(`   First 5 examples:`);
      categories.invalidPhone.slice(0, 5).forEach(r => {
        console.log(`   - Row ${r.rowNum}: ${r.name} | Phone: "${r.phoneRaw}" | Status: ${r.status}`);
      });
      console.log('');
    }

    console.log(`❌ DUPLICATE PHONE (within sheet): ${categories.duplicatePhoneInSheet.length}`);
    if (categories.duplicatePhoneInSheet.length > 0) {
      console.log(`   First 5 examples:`);
      categories.duplicatePhoneInSheet.slice(0, 5).forEach(r => {
        console.log(`   - Row ${r.rowNum}: ${r.name} | Phone: ${r.phone} | Status: ${r.status}`);
      });
      console.log('');
    }

    console.log(`❌ DUPLICATE PHONE (already in database): ${categories.duplicatePhoneInDB.length}`);
    if (categories.duplicatePhoneInDB.length > 0) {
      console.log(`   First 5 examples:`);
      categories.duplicatePhoneInDB.slice(0, 5).forEach(r => {
        console.log(`   - Row ${r.rowNum}: ${r.name} | Phone: ${r.phone} | Status: ${r.status}`);
      });
      console.log('');
    }

    console.log(`❌ DUPLICATE EMAIL (already in database): ${categories.duplicateEmailInDB.length}`);
    if (categories.duplicateEmailInDB.length > 0) {
      console.log(`   First 5 examples:`);
      categories.duplicateEmailInDB.slice(0, 5).forEach(r => {
        console.log(`   - Row ${r.rowNum}: ${r.name} | Email: ${r.email} | Status: ${r.status}`);
      });
      console.log('');
    }

    console.log('═══════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total rows in Google Sheet: ${dataRows.length}`);
    console.log(`Valid & importable: ${categories.validImportable.length}`);
    console.log(`Total skipped: ${dataRows.length - categories.validImportable.length}`);
    console.log('');
    console.log('Breakdown of skipped rows:');
    console.log(`  - No phone number: ${categories.noPhone.length}`);
    console.log(`  - Invalid phone: ${categories.invalidPhone.length}`);
    console.log(`  - Duplicate phone (in sheet): ${categories.duplicatePhoneInSheet.length}`);
    console.log(`  - Duplicate phone (in DB): ${categories.duplicatePhoneInDB.length}`);
    console.log(`  - Duplicate email (in DB): ${categories.duplicateEmailInDB.length}`);
    console.log('═══════════════════════════════════════════════\n');

    // Check current database count
    const dbCount = await prisma.customer.count({ where: { source: 'google_sheets' } });
    console.log(`📊 Current database count (google_sheets source): ${dbCount}\n`);

    if (categories.validImportable.length !== dbCount) {
      console.log(`⚠️  WARNING: Valid importable (${categories.validImportable.length}) doesn't match DB count (${dbCount})`);
      console.log(`   This could mean some valid rows failed to import due to other constraints.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseImport();
