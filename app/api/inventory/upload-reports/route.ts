import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/inventory/upload-reports
 *
 * Fetches all upload reports for inventory tracking
 */
export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Check user role - only owners and directors can view reports
    const userRole = (session.user as any).role;
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden - Only owners and directors can view upload reports' },
        { status: 403 }
      );
    }

    // 3. Fetch all upload reports, ordered by most recent first
    const reports = await prisma.uploadReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      reports,
      total: reports.length,
    });
  } catch (error: any) {
    console.error('❌ Error fetching upload reports:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch upload reports',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
