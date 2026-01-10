import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, applyPermissionFilter, hasFullCRMVisibility } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/interests - List interests (optionally filter by customerId, stockNumber, or vin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build permission context
    const permContext = await buildPermissionContext(session.user.email);
    if (!permContext) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const stockNumber = searchParams.get("stockNumber");
    const vin = searchParams.get("vin");

    // If querying by specific customerId, verify access first
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true, managerId: true },
      });

      if (!customer) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Check access based on role
      // Owners, Directors, CRM Admins: full access
      // Managers: team customers (assignedToId in team OR managerId = self)
      // Salespeople: only their own (assignedToId = self)
      const hasAccess = await checkCustomerAccess(permContext, customer);
      if (!hasAccess) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // User has access, return interests for this customer
      const interests = await prisma.customerInterest.findMany({
        where: {
          customerId,
          ...(stockNumber && { stockNumber: { contains: stockNumber, mode: "insensitive" } }),
          ...(vin && { vin: { contains: vin.toUpperCase(), mode: "insensitive" } }),
        },
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
    }

    // No specific customerId - return interests for accessible customers only
    // Build customer filter based on permissions
    const customerFilter = applyPermissionFilter(permContext);

    const where: any = {
      customer: customerFilter,
    };

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

/**
 * Check if user has access to a customer based on role
 */
async function checkCustomerAccess(
  permContext: { role: string; userId: string; canAdminCRM: boolean; teamMemberIds?: string[] },
  customer: { assignedToId: string | null; managerId?: string | null }
): Promise<boolean> {
  // Owners, Directors, CRM Admins have full access
  if (
    permContext.role === "owner" ||
    permContext.role === "director" ||
    permContext.canAdminCRM
  ) {
    return true;
  }

  // Managers: team customers (assignedToId in team OR managerId = self)
  if (permContext.role === "manager") {
    if (permContext.teamMemberIds?.includes(customer.assignedToId || "")) {
      return true;
    }
    if (customer.managerId === permContext.userId) {
      return true;
    }
    return false;
  }

  // Salespeople: only their own customers
  if (permContext.role === "salesperson") {
    return customer.assignedToId === permContext.userId;
  }

  return false;
}

// POST /api/crm/interests - Add a customer interest
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build permission context
    const permContext = await buildPermissionContext(session.user.email);
    if (!permContext) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    // Verify customer exists and check access
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, assignedToId: true, managerId: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user has access to this customer
    const hasAccess = await checkCustomerAccess(permContext, customer);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    // Build permission context
    const permContext = await buildPermissionContext(session.user.email);
    if (!permContext) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Interest ID is required" },
        { status: 400 }
      );
    }

    // Fetch interest and verify access to the customer
    const interest = await prisma.customerInterest.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, assignedToId: true, managerId: true },
        },
      },
    });

    if (!interest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user has access to this customer
    const hasAccess = await checkCustomerAccess(permContext, interest.customer);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
