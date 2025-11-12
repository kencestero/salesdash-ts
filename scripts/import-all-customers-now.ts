#!/usr/bin/env tsx
/**
 * Manual Import Script - Import ALL customers from Google Sheets NOW
 *
 * This bypasses the cron schedule and imports all 848+ leads immediately
 */

import { prisma } from '../lib/prisma';
import { fetchLeadsFromSheet, parseLeadForDatabase } from '../lib/google-sheets';

interface SyncStats {
  totalInSheet: number;
  newLeads: number;
  updatedLeads: number;
  duplicatesSkipped: number;
  errors: number;
  errorDetails: Array<{ phone: string; error: string }>;
}

async function importAllCustomers() {
  console.log('🚀 Starting MANUAL import of ALL customers from Google Sheets...\n');
  const startTime = Date.now();

  const stats: SyncStats = {
    totalInSheet: 0,
    newLeads: 0,
    updatedLeads: 0,
    duplicatesSkipped: 0,
    errors: 0,
    errorDetails: [],
  };

  try {
    // Fetch all leads from Google Sheets
    const sheetLeads = await fetchLeadsFromSheet();
    stats.totalInSheet = sheetLeads.length;

    console.log(`📊 Found ${sheetLeads.length} leads in Google Sheet\n`);

    // Process each lead
    for (let i = 0; i < sheetLeads.length; i++) {
      const sheetLead = sheetLeads[i];

      try {
        // Parse lead data
        const leadData = parseLeadForDatabase(sheetLead);

        // Skip if no phone number
        if (!leadData.phone || leadData.phone === 'Unknown') {
          stats.errors++;
          stats.errorDetails.push({
            phone: 'N/A',
            error: 'Missing phone number',
          });
          continue;
        }

        // Check if lead already exists (by phone OR email)
        const existing = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone: leadData.phone },
              { email: leadData.email || undefined },
            ],
          },
        });

        if (existing) {
          // Lead exists - check if we should update it
          const shouldUpdate =
            (leadData.managerNotes && leadData.managerNotes !== existing.managerNotes) ||
            (leadData.repNotes && leadData.repNotes !== existing.repNotes) ||
            leadData.applied !== existing.applied ||
            leadData.status !== existing.status;

          if (shouldUpdate) {
            await prisma.customer.update({
              where: { id: existing.id },
              data: {
                managerNotes: leadData.managerNotes || existing.managerNotes,
                repNotes: leadData.repNotes || existing.repNotes,
                applied: leadData.applied,
                dateApplied: leadData.dateApplied || existing.dateApplied,
                status: leadData.status,
                assignedToName: leadData.assignedToName || existing.assignedToName,
                salesRepName: leadData.salesRepName || existing.salesRepName,
                updatedAt: new Date(),
              },
            });
            stats.updatedLeads++;
            console.log(`✏️  [${i + 1}/${sheetLeads.length}] Updated: ${leadData.firstName} ${leadData.lastName} (${leadData.phone})`);
          } else {
            stats.duplicatesSkipped++;
            if (i % 50 === 0) {
              console.log(`⏭️  [${i + 1}/${sheetLeads.length}] Skipped duplicate: ${leadData.firstName} ${leadData.lastName}`);
            }
          }
        } else {
          // New lead - create it
          await prisma.customer.create({
            data: leadData,
          });
          stats.newLeads++;
          console.log(`✅ [${i + 1}/${sheetLeads.length}] Created: ${leadData.firstName} ${leadData.lastName} (${leadData.phone})`);
        }
      } catch (error) {
        stats.errors++;
        stats.errorDetails.push({
          phone: sheetLead.phone || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`❌ Error processing lead ${sheetLead.phone}:`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ Customer Import Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total in Sheet:     ${stats.totalInSheet}`);
    console.log(`✅ New Leads Created:  ${stats.newLeads}`);
    console.log(`✏️  Leads Updated:      ${stats.updatedLeads}`);
    console.log(`⏭️  Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`❌ Errors:             ${stats.errors}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log('═══════════════════════════════════════════\n');

    if (stats.errorDetails.length > 0) {
      console.log('⚠️  Error Details:');
      stats.errorDetails.slice(0, 10).forEach((err) => {
        console.log(`   - ${err.phone}: ${err.error}`);
      });
      if (stats.errorDetails.length > 10) {
        console.log(`   ... and ${stats.errorDetails.length - 10} more errors`);
      }
    }

    // Close Prisma connection
    await prisma.$disconnect();

    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the import
importAllCustomers();
