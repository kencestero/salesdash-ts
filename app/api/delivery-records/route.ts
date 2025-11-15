import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createDeliveryRecord,
  listDeliveryRecords,
} from "@/lib/analytics/deliveries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/delivery-records - List delivery records
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    // Use helper function to fetch delivery records
    const deliveryRecords = await listDeliveryRecords({
      userId,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({ deliveryRecords });
  } catch (error) {
    console.error("Error fetching delivery records:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery records" },
      { status: 500 }
    );
  }
}

// POST /api/delivery-records - Create new delivery record
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const {
      customerName,
      trailerIdentifier,
      deliveryDate,
      commissionAmount,
      profitAmount,
    } = body;

    // Use helper function to create delivery record
    // The helper will handle validation and throw descriptive errors
    const deliveryRecord = await createDeliveryRecord({
      customerName,
      trailerIdentifier,
      deliveryDate,
      commissionAmount: Number(commissionAmount),
      profitAmount: Number(profitAmount),
      createdByUserId: currentUser.id,
    });

    return NextResponse.json({ deliveryRecord }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating delivery record:", error);
    // If it's a validation error from the helper, return 400 with the message
    const status = error.message?.includes("required") || error.message?.includes("must be") ? 400 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to create delivery record" },
      { status }
    );
  }
}

// DELETE /api/delivery-records - Delete multiple delivery records
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user and check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only owners, directors, and managers can delete records
    const allowedRoles = ["owner", "director", "manager"];
    if (!allowedRoles.includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only owners, directors, and managers can delete delivery records." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ids } = body;

    // Validate IDs array
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'ids' must be a non-empty array." },
        { status: 400 }
      );
    }

    // Delete records
    const result = await prisma.deliveryRecord.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} delivery record(s)`,
    });
  } catch (error: any) {
    console.error("Error deleting delivery records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete delivery records" },
      { status: 500 }
    );
  }
}
