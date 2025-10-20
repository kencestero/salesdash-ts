// scripts/import-leads.ts
import { PrismaClient } from '../lib/generated/prisma/index.js';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

interface CSVRow {
  'Timestamp': string;
  'Rep Name': string;
  'Customer Name': string;
  'Customer Phone Number': string;
  'Trailer Size': string;
  'Assigned Manager': string;
  'Stock Number (If in stock) or Factory Order': string;
  'Applied': string;
  'Date of Submission': string;
  'Cash/Finance/Rent to Own': string;
  'Manager Notes': string;
  'Rep Notes': string;
  'Email': string;
  'Address': string;
  'Zip Code': string;
  'State': string;
}

interface ImportResult {
  success: number;
  failed: number;
  duplicates: number;
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
}

const BATCH_SIZE = 1000;

async function importLeads(): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
  };

  const csvFilePath = 'scripts/leads.csv';

  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Error: File not found at ${csvFilePath}`);
    console.log(`💡 Please place your CSV file at: ${csvFilePath}`);
    process.exit(1);
  }

  console.log('🔄 Starting CSV import...');
  console.log(`📁 Reading file: ${csvFilePath}`);

  const parser = fs.createReadStream(csvFilePath).pipe(
    parse({
      columns: true, // Use first row as headers
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Handle rows with missing columns
      bom: true, // Handle UTF-8 BOM from Excel/Google Sheets
    })
  );

  let batch: any[] = [];
  let rowNumber = 1; // Header is row 1

  for await (const record of parser as any) {
    rowNumber++;

    try {
      const row = record as CSVRow;

      // Parse customer name
      const nameParts = (row['Customer Name'] || '').trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Clean phone number
      const phone = (row['Customer Phone Number'] || '').replace(/[^\d+]/g, '') || 'Unknown';

      // Generate email if not provided
      const email = row['Email']?.trim() || `${phone}@placeholder.com`;

      // Determine status from notes
      let status = 'new';
      const managerNotes = (row['Manager Notes'] || '').toLowerCase();
      const repNotes = (row['Rep Notes'] || '').toLowerCase();
      const allNotes = `${managerNotes} ${repNotes}`;

      if (allNotes.includes('approved')) status = 'approved';
      else if (allNotes.includes('dead') || allNotes.includes('declined')) status = 'dead';
      else if (allNotes.includes('applied') || row['Applied']) status = 'applied';
      else if (allNotes.includes('contacted')) status = 'contacted';
      else if (allNotes.includes('qualified')) status = 'qualified';

      // Parse financing type
      let financingType: string | null = null;
      const financing = (row['Cash/Finance/Rent to Own'] || '').toLowerCase();
      if (financing.includes('cash')) financingType = 'cash';
      else if (financing.includes('finance')) financingType = 'finance';
      else if (financing.includes('rent') || financing.includes('rto')) financingType = 'rto';

      // Determine if factory order
      const stockNumberField = row['Stock Number (If in stock) or Factory Order'] || '';
      const isFactoryOrder = stockNumberField.toLowerCase().includes('factory') ||
                             stockNumberField.toLowerCase().includes('order');

      // Parse dates
      let createdAt = new Date();
      if (row['Timestamp']) {
        const parsed = new Date(row['Timestamp']);
        if (!isNaN(parsed.getTime())) {
          createdAt = parsed;
        }
      }

      let appliedDate: Date | null = null;
      if (row['Date of Submission']) {
        const parsed = new Date(row['Date of Submission']);
        if (!isNaN(parsed.getTime())) {
          appliedDate = parsed;
        }
      }

      // Prepare customer data
      const customerData = {
        firstName,
        lastName,
        email,
        phone,
        street: row['Address']?.trim() || null,
        state: row['State']?.trim() || null,
        zipcode: row['Zip Code']?.trim() || null,

        // Lead management fields (Column B - Sales Rep, Column F - Assigned Manager)
        salesRepName: row['Rep Name']?.trim() || null, // Column B
        assignedToName: row['Assigned Manager']?.trim() || null, // Column F
        trailerSize: row['Trailer Size']?.trim() || null,
        trailerType: null, // Can be derived from trailer size if needed
        stockNumber: stockNumberField.trim() || null,
        financingType, // Column J - Cash/Finance/RTO

        isFactoryOrder,

        // Status and tracking
        status,
        hasAppliedCredit: row['Applied'] ? true : false,
        applied: row['Applied'] ? true : false, // Column H - Applied
        dateApplied: appliedDate, // Column I - Date Applied
        lastContactDate: appliedDate,

        // Notes - Now separated (Column K - Manager Notes, Column L - Rep Notes)
        managerNotes: row['Manager Notes']?.trim() || null, // Column K
        repNotes: row['Rep Notes']?.trim() || null, // Column L
        notes: null, // Keep general notes field empty for now

        // Metadata
        source: 'csv_import',
        tags: ['csv_import', row['Assigned Manager']].filter(Boolean),
        createdAt, // Column A - Timestamp
      };

      batch.push(customerData);

      // Process batch when it reaches BATCH_SIZE
      if (batch.length >= BATCH_SIZE) {
        const batchResult = await processBatch(batch);
        result.success += batchResult.success;
        result.failed += batchResult.failed;
        result.duplicates += batchResult.duplicates;
        result.errors.push(...batchResult.errors);
        batch = [];

        console.log(`✅ Processed ${result.success + result.duplicates + result.failed} rows...`);
      }

    } catch (error) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        name: record['Customer Name'] || 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Process remaining batch
  if (batch.length > 0) {
    const batchResult = await processBatch(batch);
    result.success += batchResult.success;
    result.failed += batchResult.failed;
    result.duplicates += batchResult.duplicates;
    result.errors.push(...batchResult.errors);
  }

  return result;
}

async function processBatch(customers: any[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
  };

  try {
    // Check for existing customers by email or phone
    const emails = customers.map((c) => c.email);
    const phones = customers.map((c) => c.phone);

    const existing = await prisma.customer.findMany({
      where: {
        OR: [
          { email: { in: emails } },
          { phone: { in: phones } },
        ],
      },
      select: { email: true, phone: true },
    });

    const existingEmails = new Set(existing.map((c) => c.email));
    const existingPhones = new Set(existing.map((c) => c.phone));

    const newCustomers = customers.filter(
      (c) => !existingEmails.has(c.email) && !existingPhones.has(c.phone)
    );

    result.duplicates = customers.length - newCustomers.length;

    if (newCustomers.length > 0) {
      // Use createMany for batch insert
      const created = await prisma.customer.createMany({
        data: newCustomers,
        skipDuplicates: true,
      });
      result.success = created.count;
    }

  } catch (error) {
    console.error('⚠️  Batch insert failed, falling back to individual inserts:', error);

    // Fallback: Try individual inserts
    for (const customer of customers) {
      try {
        // Check if already exists
        const existing = await prisma.customer.findFirst({
          where: {
            OR: [
              { email: customer.email },
              { phone: customer.phone },
            ],
          },
        });

        if (existing) {
          result.duplicates++;
        } else {
          await prisma.customer.create({
            data: customer,
          });
          result.success++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push({
          row: 0,
          name: `${customer.firstName} ${customer.lastName}`,
          error: err instanceof Error ? err.message : 'Insert failed',
        });
      }
    }
  }

  return result;
}

// Main execution
async function main() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('  📊 MJ Cargo SalesDash - CSV Lead Import');
    console.log('═══════════════════════════════════════════\n');

    const startTime = Date.now();
    const result = await importLeads();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════');
    console.log('  📈 Import Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Successfully imported: ${result.success}`);
    console.log(`⏭️  Skipped (duplicates):  ${result.duplicates}`);
    console.log(`❌ Failed:                ${result.failed}`);
    console.log(`⏱️  Duration:              ${duration}s`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.slice(0, 10).forEach((err) => {
        console.log(`   Row ${err.row}: ${err.name} - ${err.error}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more errors`);
      }
    }

    console.log('\n═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
