import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/interests - List interests (optionally filter by customerId, stockNumber, or vin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const stockNumber = searchParams.get("stockNumber");
    const vin = searchParams.get("vin");

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (stockNumber) {
      where.stockNumber = { contains: stockNumber, mode: "insensitive" };
    }

    if (vin) {
      where.vin = { contains: vin.toUpperCase(), mode: "insensitive" };
    }

    const interests = await prisma.customerInterest.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Error fetching customer interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer interests" },
      { status: 500 }
    );
  }
}

// POST /api/crm/interests - Add a customer interest
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, stockNumber, vin, notes } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    if (!stockNumber && !vin) {
      return NextResponse.json(
        { error: "Stock number or VIN is required" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check for duplicate interest
    const existingInterest = await prisma.customerInterest.findFirst({
      where: {
        customerId,
        OR: [
          stockNumber ? { stockNumber: { equals: stockNumber, mode: "insensitive" } } : {},
          vin ? { vin: { equals: vin.toUpperCase(), mode: "insensitive" } } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });

    if (existingInterest) {
      return NextResponse.json(
        { error: "Customer already has interest in this unit" },
        { status: 400 }
      );
    }

    const interest = await prisma.customerInterest.create({
      data: {
        customerId,
        stockNumber: stockNumber || null,
        vin: vin ? vin.trim().toUpperCase() : null,
        notes: notes || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ interest }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer interest:", error);
    return NextResponse.json(
      { error: "Failed to create customer interest" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/interests - Delete a customer interest
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Interest ID is required" },
        { status: 400 }
      );
    }

    await prisma.customerInterest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer interest:", error);
    return NextResponse.json(
      { error: "Failed to delete customer interest" },
      { status: 500 }
    );
  }
}
