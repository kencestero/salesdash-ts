import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/crm/customers/[id] - Update customer (managers+ only)
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only managers and above can edit
    const canEdit = ["owner", "director", "manager"].includes(currentUser.profile.role);
    if (!canEdit) {
      return NextResponse.json(
        { error: "Only managers and above can edit leads" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    // Update customer with allowed fields
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        // Contact info
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        // Address
        ...(body.street !== undefined && { street: body.street }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.zipcode !== undefined && { zipcode: body.zipcode }),
        // Business details
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.businessType !== undefined && { businessType: body.businessType }),
        ...(body.source !== undefined && { source: body.source }),
        // Trailer details
        ...(body.trailerSize !== undefined && { trailerSize: body.trailerSize }),
        ...(body.trailerType !== undefined && { trailerType: body.trailerType }),
        ...(body.financingType !== undefined && { financingType: body.financingType }),
        ...(body.stockNumber !== undefined && { stockNumber: body.stockNumber }),
        // Lead status fields
        ...(body.temperature && { temperature: body.temperature }),
        ...(body.linkSentStatus && { linkSentStatus: body.linkSentStatus }),
        ...(body.approvalStatus && { approvalStatus: body.approvalStatus }),
        ...(body.status && { status: body.status }),
        ...(body.notes && { notes: body.notes }),
        ...(body.managerNotes && { managerNotes: body.managerNotes }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer", details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/crm/customers/[id] - Get single customer
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        deals: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        creditApps: true,
        quotes: true,
        _count: {
          select: {
            deals: true,
            activities: true,
            creditApps: true,
            quotes: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer", details: error.message },
      { status: 500 }
    );
  }
}
