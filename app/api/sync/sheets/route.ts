/**
 * Google Sheets CRM Sync API
 *
 * User-friendly endpoint for syncing leads from Google Sheets
 *
 * GET  /api/sync/sheets?dryRun=1 - Preview what would be synced (no database changes)
 * POST /api/sync/sheets           - Actually sync the leads to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchLeadsFromSheet, parseLeadForDatabase } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SyncStats {
  totalInSheet: number;
  newLeads: number;
  updatedLeads: number;
  duplicatesSkipped: number;
  errors: number;
  errorDetails: Array<{ phone: string; error: string }>;
  preview?: Array<{
    action: 'create' | 'update' | 'skip';
    phone: string;
    firstName: string;
    lastName: string;
    reason?: string;
  }>;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Role check - only owners/directors can sync
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser || !['owner', 'director'].includes(currentUser.profile?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions - Only owners/directors can sync' },
        { status: 403 }
      );
    }

    console.log('🔍 DRY RUN: Previewing Google Sheets sync...');

    const stats: SyncStats = {
      totalInSheet: 0,
      newLeads: 0,
      updatedLeads: 0,
      duplicatesSkipped: 0,
      errors: 0,
      errorDetails: [],
      preview: [],
    };

    // Fetch leads from sheet
    const sheetLeads = await fetchLeadsFromSheet();
    stats.totalInSheet = sheetLeads.length;

    console.log(`📊 Found ${sheetLeads.length} leads in Google Sheet`);

    // Preview each lead (no database changes)
    for (const sheetLead of sheetLeads) {
      try {
        const leadData = parseLeadForDatabase(sheetLead);

        if (!leadData.phone || leadData.phone === 'Unknown') {
          stats.errors++;
          stats.preview?.push({
            action: 'skip',
            phone: leadData.phone || 'N/A',
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            reason: 'Missing phone number',
          });
          continue;
        }

        // Check if lead exists
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone: leadData.phone },
              {
                AND: [
                  { email: { not: null } },
                  { email: { equals: leadData.email || '' } },
                ],
              },
            ],
          },
        });

        if (existingCustomer) {
          // Would be updated
          stats.updatedLeads++;
          stats.preview?.push({
            action: 'update',
            phone: leadData.phone,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            reason: 'Existing customer - would update notes/status',
          });
        } else {
          // Would be created
          stats.newLeads++;
          stats.preview?.push({
            action: 'create',
            phone: leadData.phone,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
          });
        }
      } catch (error: any) {
        stats.errors++;
        stats.errorDetails.push({
          phone: sheetLead.phone || 'Unknown',
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      dryRun: true,
      message: 'Preview complete - no database changes made',
      stats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Dry run failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sync preview failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Role check - only owners/directors can sync
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser || !['owner', 'director'].includes(currentUser.profile?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions - Only owners/directors can sync' },
        { status: 403 }
      );
    }

    console.log('🚀 LIVE SYNC: Importing leads from Google Sheets...');

    const stats: SyncStats = {
      totalInSheet: 0,
      newLeads: 0,
      updatedLeads: 0,
      duplicatesSkipped: 0,
      errors: 0,
      errorDetails: [],
    };

    // Fetch leads from sheet
    const sheetLeads = await fetchLeadsFromSheet();
    stats.totalInSheet = sheetLeads.length;

    console.log(`📊 Processing ${sheetLeads.length} leads...`);

    // Process each lead
    for (const sheetLead of sheetLeads) {
      try {
        const leadData = parseLeadForDatabase(sheetLead);

        if (!leadData.phone || leadData.phone === 'Unknown') {
          stats.errors++;
          stats.errorDetails.push({
            phone: leadData.phone || 'N/A',
            error: 'Missing phone number',
          });
          continue;
        }

        // Check for existing customer
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              { phone: leadData.phone },
              {
                AND: [
                  { email: { not: null } },
                  { email: { equals: leadData.email || '' } },
                ],
              },
            ],
          },
        });

        if (existingCustomer) {
          // Update existing customer
          const updates: any = {};
          if (leadData.managerNotes) updates.managerNotes = leadData.managerNotes;
          if (leadData.repNotes) updates.repNotes = leadData.repNotes;
          if (leadData.status) updates.status = leadData.status;
          if (leadData.salesRepName) updates.salesRepName = leadData.salesRepName;

          if (Object.keys(updates).length > 0) {
            await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: updates,
            });
            stats.updatedLeads++;
          } else {
            stats.duplicatesSkipped++;
          }
        } else {
          // Create new customer
          await prisma.customer.create({
            data: leadData,
          });
          stats.newLeads++;
        }
      } catch (error: any) {
        stats.errors++;
        stats.errorDetails.push({
          phone: sheetLead.phone || 'Unknown',
          error: error.message,
        });
        console.error(`❌ Error processing lead ${sheetLead.phone}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    console.log('✅ Sync complete!', stats);

    return NextResponse.json({
      success: true,
      message: 'Google Sheets sync completed successfully',
      stats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
