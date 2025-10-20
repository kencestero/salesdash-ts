/**
 * Vercel Cron Job: Google Sheets CRM Sync
 *
 * Runs every hour to sync leads from Google Sheets to SalesDash CRM
 *
 * Endpoint: GET /api/cron/sync-sheets
 * Schedule: Every hour (configured in vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchLeadsFromSheet, parseLeadForDatabase } from '@/lib/google-sheets';

// Force dynamic rendering (required for API routes with headers)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Track sync statistics
interface SyncStats {
  totalInSheet: number;
  newLeads: number;
  updatedLeads: number;
  duplicatesSkipped: number;
  errors: number;
  errorDetails: Array<{ phone: string; error: string }>;
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting Google Sheets CRM sync...');
    const startTime = Date.now();

    // Initialize stats
    const stats: SyncStats = {
      totalInSheet: 0,
      newLeads: 0,
      updatedLeads: 0,
      duplicatesSkipped: 0,
      errors: 0,
      errorDetails: [],
    };

    // Fetch all leads from Google Sheets
    const sheetLeads = await fetchLeadsFromSheet();
    stats.totalInSheet = sheetLeads.length;

    console.log(`📊 Found ${sheetLeads.length} leads in Google Sheet`);

    // Process each lead
    for (const sheetLead of sheetLeads) {
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
              { email: leadData.email },
            ],
          },
        });

        if (existing) {
          // Lead exists - check if we should update it
          // Only update if sheet data is newer or has more info
          const shouldUpdate =
            leadData.managerNotes && leadData.managerNotes !== existing.managerNotes ||
            leadData.repNotes && leadData.repNotes !== existing.repNotes ||
            leadData.applied !== existing.applied ||
            leadData.status !== existing.status;

          if (shouldUpdate) {
            await prisma.customer.update({
              where: { id: existing.id },
              data: {
                // Update fields that may have changed
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
            console.log(`✏️  Updated: ${leadData.firstName} ${leadData.lastName} (${leadData.phone})`);
          } else {
            stats.duplicatesSkipped++;
          }
        } else {
          // New lead - create it
          await prisma.customer.create({
            data: leadData,
          });
          stats.newLeads++;
          console.log(`✅ Created: ${leadData.firstName} ${leadData.lastName} (${leadData.phone})`);
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
    console.log('  ✅ Google Sheets CRM Sync Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total in Sheet:     ${stats.totalInSheet}`);
    console.log(`✅ New Leads Created:  ${stats.newLeads}`);
    console.log(`✏️  Leads Updated:      ${stats.updatedLeads}`);
    console.log(`⏭️  Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`❌ Errors:             ${stats.errors}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log('═══════════════════════════════════════════\n');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Google Sheets sync completed',
      stats,
      duration: `${duration}s`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('💥 Fatal error in Google Sheets sync:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
