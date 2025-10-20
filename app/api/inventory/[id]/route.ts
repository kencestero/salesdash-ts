import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/inventory/[id]
 * Fetch a single trailer by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trailer = await prisma.trailer.findUnique({
      where: { id: params.id },
    });

    if (!trailer) {
      return NextResponse.json(
        { error: 'Trailer not found' },
        { status: 404 }
      );
    }

    // Calculate days old
    const createdDate = new Date(trailer.createdAt);
    const now = new Date();
    const daysOld = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    const trailerWithAge = {
      ...trailer,
      daysOld,
    };

    return NextResponse.json({ trailer: trailerWithAge });
  } catch (error) {
    console.error('[GET /api/inventory/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trailer' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inventory/[id]
 * Update trailer details (Directors and Owners only)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Check user role - only owners and directors can edit
    const userRole = (session.user as any).role;
    if (userRole !== 'owner' && userRole !== 'director') {
      return NextResponse.json(
        { error: 'Forbidden - Only Directors and Owners can edit inventory' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { salePrice, makeOffer, status, location, description } = body;

    // 4. Validate required fields
    if (salePrice === undefined || makeOffer === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: salePrice, makeOffer, status' },
        { status: 400 }
      );
    }

    // 5. Update trailer in database
    const updatedTrailer = await prisma.trailer.update({
      where: { id: params.id },
      data: {
        salePrice: parseFloat(salePrice),
        makeOffer: Boolean(makeOffer),
        status: status,
        location: location || null,
        description: description || null,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Trailer ${updatedTrailer.stockNumber} updated by ${session.user.email} (${userRole})`);

    return NextResponse.json({
      success: true,
      trailer: updatedTrailer,
    });
  } catch (error) {
    console.error('[PATCH /api/inventory/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update trailer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inventory/[id]
 * Delete a trailer (Owners only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Check user role - only owners can delete
    const userRole = (session.user as any).role;
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden - Only Owners can delete inventory' },
        { status: 403 }
      );
    }

    // 3. Delete trailer
    await prisma.trailer.delete({
      where: { id: params.id },
    });

    console.log(`🗑️ Trailer deleted by ${session.user.email} (${userRole})`);

    return NextResponse.json({
      success: true,
      message: 'Trailer deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/inventory/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trailer' },
      { status: 500 }
    );
  }
}
