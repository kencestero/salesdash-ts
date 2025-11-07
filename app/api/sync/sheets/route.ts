/**
 * Google Sheets CRM Sync API (Header-Mapped)
 *
 * Uses header-based column mapping, splits full names, allows no-contact leads
 *
 * GET  /api/sync/sheets?token=XXX - Preview sync (dry run)
 * POST /api/sync/sheets?token=XXX - Actually sync leads
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchRawRowsFromSheet } from '@/lib/google-sheets';
import { parseSheet } from '@/lib/sync/fromSheet';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SyncStats {
  totalInSheet: number;
  newLeads: number;
  updatedLeads: number;
  duplicatesSkipped: number;
  errors: number;
  noContactLeads: number;
  errorDetails: Array<{ name: string; error: string }>;
  preview?: Array<{
    action: 'create' | 'update' | 'skip';
    name: string;
    firstName: string;
    lastName: string;
    status: string;
    reason?: string;
  }>;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let actor = 'unknown';

  try {
    // Check for token-based authentication (bypass session check)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const syncToken = process.env.SYNC_TOKEN;

    if (syncToken && token === syncToken) {
      console.log('✅ Token authentication successful - bypassing role check');
      actor = 'token';
    } else {
      // Session-based authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Please login or provide valid token' },
          { status: 401 }
        );
      }

      actor = session.user.email;

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
    }

    console.log('🔍 DRY RUN: Previewing Google Sheets sync...');

    const stats: SyncStats = {
      totalInSheet: 0,
      newLeads: 0,
      updatedLeads: 0,
      duplicatesSkipped: 0,
      noContactLeads: 0,
      errors: 0,
      errorDetails: [],
      preview: [],
    };

    // Fetch raw rows from sheet (includes header)
    const rawRows = await fetchRawRowsFromSheet();
    if (rawRows.length === 0) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: 'Sheet is empty',
        stats,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // Parse rows using header-mapped logic
    const parsedLeads = parseSheet(rawRows);
    stats.totalInSheet = parsedLeads.length;

    console.log(`📊 Found ${parsedLeads.length} leads in Google Sheet`);

    // Preview each lead (no database changes)
    for (const { lead, status, makeTask } of parsedLeads) {
      try {
        const fullName = `${lead.firstName} ${lead.lastName}`.trim() || 'Unknown';

        // Track no-contact leads
        if (!lead.phone && !lead.email) {
          stats.noContactLeads++;
        }

        // Check if lead exists by phone or email (simplified OR lookup)
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              lead.phone ? { phone: lead.phone } : undefined,
              lead.email ? { email: lead.email } : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (existingCustomer) {
          stats.updatedLeads++;
          stats.preview?.push({
            action: 'update',
            name: fullName,
            firstName: lead.firstName,
            lastName: lead.lastName,
            status,
            reason: 'Existing customer - would update notes/status',
          });
        } else {
          stats.newLeads++;
          stats.preview?.push({
            action: 'create',
            name: fullName,
            firstName: lead.firstName,
            lastName: lead.lastName,
            status,
            reason: makeTask ? 'No contact info - follow-up task needed' : undefined,
          });
        }
      } catch (error: any) {
        stats.errors++;
        stats.errorDetails.push({
          name: `${lead.firstName} ${lead.lastName}`.trim() || 'Unknown',
          error: error.message,
        });
      }
    }

    const duration = Date.now() - startTime;

    // Get last sync log for display (skip if table doesn't exist)
    let lastSync = null;
    try {
      lastSync = await prisma.syncLog.findFirst({
        where: { source: 'google_sheets' },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.warn('⚠️ SyncLog table missing, skipping');
    }

    return NextResponse.json({
      success: true,
      dryRun: true,
      message: 'Preview complete - no database changes made',
      stats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      lastSync: lastSync ? {
        timestamp: lastSync.createdAt.toISOString(),
        scanned: lastSync.scanned,
        inserted: lastSync.inserted,
        updated: lastSync.updated,
        errors: lastSync.errors,
        actor: lastSync.actor,
      } : null,
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
  const startedAt = new Date();
  let actor = 'unknown';

  try {
    // Check for token-based authentication (bypass session check)
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const syncToken = process.env.SYNC_TOKEN;

    if (syncToken && token === syncToken) {
      console.log('✅ Token authentication successful - bypassing role check');
      actor = 'token';
    } else {
      // Session-based authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Please login or provide valid token' },
          { status: 401 }
        );
      }

      actor = session.user.email;

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
    }

    console.log('🚀 LIVE SYNC: Importing leads from Google Sheets...');

    const stats: SyncStats = {
      totalInSheet: 0,
      newLeads: 0,
      updatedLeads: 0,
      duplicatesSkipped: 0,
      noContactLeads: 0,
      errors: 0,
      errorDetails: [],
    };

    // Fetch raw rows from sheet (includes header)
    const rawRows = await fetchRawRowsFromSheet();
    if (rawRows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Sheet is empty - nothing to sync',
        stats,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // Parse rows using header-mapped logic
    const parsedLeads = parseSheet(rawRows);
    stats.totalInSheet = parsedLeads.length;

    console.log(`📊 Processing ${parsedLeads.length} leads...`);

    // Process each lead
    for (const { lead, status, makeTask } of parsedLeads) {
      try {
        const fullName = `${lead.firstName} ${lead.lastName}`.trim() || 'Unknown';

        // Track no-contact leads
        if (!lead.phone && !lead.email) {
          stats.noContactLeads++;
        }

        // Prepare database record
        const dbLead: any = {
          firstName: lead.firstName || 'Unknown',
          lastName: lead.lastName || '',
          phone: lead.phone || null,
          email: lead.email || null,
          street: lead.street || null,
          state: lead.state || null,
          zipcode: lead.zipcode || null,
          salesRepName: lead.salesRepName || null,
          assignedToName: lead.assignedToName || null,
          trailerSize: lead.trailerSize || null,
          stockNumber: lead.stockNumber || null,
          managerNotes: lead.managerNotes || null,
          repNotes: lead.repNotes || null,
          status,
          source: 'google_sheets',
          tags: ['google_sheets'],
        };

        // Parse dates
        if (lead.createdAt) {
          const parsed = new Date(lead.createdAt);
          if (!isNaN(parsed.getTime())) {
            dbLead.createdAt = parsed;
          }
        }

        if (lead.dateApplied) {
          const parsed = new Date(lead.dateApplied);
          if (!isNaN(parsed.getTime())) {
            dbLead.dateApplied = parsed;
            dbLead.applied = true;
            dbLead.hasAppliedCredit = true;
          }
        }

        // Parse financing type
        if (lead.financingType) {
          const financing = lead.financingType.toLowerCase();
          if (financing.includes('cash')) dbLead.financingType = 'cash';
          else if (financing.includes('finance')) dbLead.financingType = 'finance';
          else if (financing.includes('rent') || financing.includes('rto')) dbLead.financingType = 'rto';
        }

        // Check for existing customer by phone or email (simplified OR lookup)
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              lead.phone ? { phone: lead.phone } : undefined,
              lead.email ? { email: lead.email } : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (existingCustomer) {
          // Update existing customer
          const updates: any = {};
          if (lead.managerNotes) updates.managerNotes = lead.managerNotes;
          if (lead.repNotes) updates.repNotes = lead.repNotes;
          if (status && status !== existingCustomer.status) updates.status = status;
          if (lead.salesRepName) updates.salesRepName = lead.salesRepName;

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
          const newCustomer = await prisma.customer.create({
            data: dbLead,
          });
          stats.newLeads++;

          // Create follow-up task for no-contact leads
          if (makeTask) {
            try {
              await prisma.activity.create({
                data: {
                  customerId: newCustomer.id,
                  type: 'task',
                  title: 'Find Contact Info',
                  description: `Lead imported without phone/email. Full name: ${fullName}`,
                  status: 'pending',
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                },
              });
            } catch (taskError) {
              console.warn(`⚠️ Could not create task for ${fullName}:`, taskError);
            }
          }
        }
      } catch (error: any) {
        stats.errors++;
        stats.errorDetails.push({
          name: `${lead.firstName} ${lead.lastName}`.trim() || 'Unknown',
          error: error.message,
        });
        console.error(`❌ Error processing lead:`, error);
      }
    }

    const duration = Date.now() - startTime;

    // Log the sync run (skip if table doesn't exist)
    try {
      await prisma.syncLog.create({
        data: {
          startedAt,
          durationMs: duration,
          scanned: stats.totalInSheet,
          inserted: stats.newLeads,
          updated: stats.updatedLeads,
          skipped: stats.duplicatesSkipped,
          errors: stats.errors,
          errorDetails: stats.errorDetails.length > 0 ? stats.errorDetails : undefined,
          actor,
          source: 'google_sheets',
        },
      });
    } catch (err) {
      console.warn('⚠️ SyncLog table missing, skipping');
    }

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

    // Log failed sync (skip if table doesn't exist)
    const duration = Date.now() - startTime;
    try {
      await prisma.syncLog.create({
        data: {
          startedAt,
          durationMs: duration,
          scanned: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
          errorDetails: [{ error: error.message }],
          actor,
          source: 'google_sheets',
        },
      });
    } catch (err) {
      console.warn('⚠️ SyncLog table missing, skipping');
    }

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
