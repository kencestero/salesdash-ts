import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCustomerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/customers - List customers with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // lead, contacted, qualified, etc.
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search"); // Search name/email/phone

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch customers with related data using tight select projections
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        status: true,
        leadSource: true,
        assignedTo: true,
        lastContactedAt: true,
        createdAt: true,
        updatedAt: true,
        // Related data with select projections
        deals: {
          select: {
            id: true,
            trailerId: true,
            status: true,
            value: true,
            expectedCloseDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1, // Most recent deal
        },
        activities: {
          select: {
            id: true,
            type: true,
            subject: true,
            description: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5, // Recent activities
        },
        _count: {
          select: {
            deals: true,
            activities: true,
            quotes: true,
          },
        },
      },
      orderBy: [
        { lastContactedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/crm/customers - Create new customer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate with Zod schema
    const validation = CreateCustomerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

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
      salesRepName,      // Sales Rep assignment
      assignedToName,    // Manager assignment
    } = validation.data;

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zipcode,
        companyName,
        businessType: businessType || "individual",
        source: source || "website",
        assignedTo,
        status: status || "lead",
        tags: tags || [],
        notes,
        salesRepName,
        assignedToName,
        lastContactedAt: new Date(),
      },
    });

    // Create initial activity log
    await prisma.activity.create({
      data: {
        customerId: customer.id,
        userId: session.user.id,
        type: "note",
        subject: "Customer Created",
        description: `New customer added to CRM by ${session.user.name || session.user.email}`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
