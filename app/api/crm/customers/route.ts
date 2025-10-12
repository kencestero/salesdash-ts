import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/generated/prisma";

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

    // Fetch customers with related data
    const customers = await prisma.customer.findMany({
      where,
      include: {
        deals: {
          orderBy: { createdAt: "desc" },
          take: 1, // Most recent deal
        },
        activities: {
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

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, phone" },
        { status: 400 }
      );
    }

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
        lastContactedAt: new Date(),
      },
    });

    // Create initial activity log
    await prisma.activity.create({
      data: {
        customerId: customer.id,
        userId: session.user.email, // Store email as userId
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
