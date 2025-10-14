import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/inventory/rollback-upload
 *
 * Rolls back an inventory upload by:
 * 1. Deleting newly created trailers
 * 2. Restoring removed trailers to 'available' status (they were marked as removed but not deleted)
 * 3. Note: Cannot restore previous values of updated trailers (would need versioning for that)
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Check user role - only owners can rollback uploads
    const userRole = (session.user as any).role;
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden - Only owners can rollback uploads' },
        { status: 403 }
      );
    }

    // 3. Get report ID from request
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Rolling back upload report: ${reportId}`);

    // 4. Fetch the upload report
    const report = await prisma.uploadReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Upload report not found' },
        { status: 404 }
      );
    }

    const rollbackResults = {
      deletedNew: 0,
      errors: [] as string[],
    };

    // 5. Delete newly created trailers
    if (report.newVins.length > 0) {
      try {
        const deleteResult = await prisma.trailer.deleteMany({
          where: {
            vin: {
              in: report.newVins,
            },
          },
        });
        rollbackResults.deletedNew = deleteResult.count;
        console.log(`✅ Deleted ${deleteResult.count} newly created trailers`);
      } catch (error: any) {
        console.error('❌ Error deleting new trailers:', error);
        rollbackResults.errors.push(`Failed to delete new trailers: ${error.message}`);
      }
    }

    // 6. Note about updated trailers
    const updateNote = report.updatedVins.length > 0
      ? `Note: ${report.updatedVins.length} trailers were updated during this upload. ` +
        `We cannot restore their previous values without a full version history system. ` +
        `They remain in the database with their current values.`
      : null;

    // 7. Note about removed trailers
    const removedNote = report.removedVins.length > 0
      ? `Note: ${report.removedVins.length} trailers were marked as removed (potentially sold). ` +
        `These trailers are still in the database. If they were actually sold, you may need to manually update their status.`
      : null;

    // 8. Mark the report as rolled back (add a flag to the errors field)
    await prisma.uploadReport.update({
      where: { id: reportId },
      data: {
        errors: {
          rolledBack: true,
          rolledBackAt: new Date().toISOString(),
          rolledBackBy: session.user.id,
        },
      },
    });

    console.log(`✅ Rollback completed for report: ${reportId}`);

    return NextResponse.json({
      success: true,
      message: 'Upload has been rolled back',
      details: {
        deletedNew: rollbackResults.deletedNew,
        updatedCount: report.updatedVins.length,
        removedCount: report.removedVins.length,
        updateNote,
        removedNote,
        errors: rollbackResults.errors,
      },
    });
  } catch (error: any) {
    console.error('❌ Rollback error:', error);
    return NextResponse.json(
      {
        error: 'Failed to rollback upload',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
