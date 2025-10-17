import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/customers/[id] - Get single customer with all related data
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        deals: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        creditApps: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
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
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/customers/[id] - Update customer
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      companyName,
      businessType,
      source,
      assignedTo,
      status,
      tags,
      notes,
    } = body;

    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If email is being changed, check for duplicates
    if (email && email !== existing.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use by another customer" },
          { status: 400 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipcode !== undefined && { zipcode }),
        ...(companyName !== undefined && { companyName }),
        ...(businessType && { businessType }),
        ...(source !== undefined && { source }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status && { status }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      },
      include: {
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

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/customers/[id] - Delete customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if customer exists
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete customer (CASCADE will handle related records)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
