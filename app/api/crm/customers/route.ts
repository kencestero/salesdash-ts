import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCustomerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper: Get team member IDs for a manager
async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const teamMembers = await prisma.userProfile.findMany({
    where: { managerId },
    select: { userId: true },
  });
  return teamMembers.map((m) => m.userId);
}

// GET /api/crm/customers - List customers with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user with profile for role-based filtering
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const userRole = currentUser.profile.role;
    const isCRMAdmin = currentUser.profile.canAdminCRM ?? false;
    const isOwnerOrDirector = ["owner", "director"].includes(userRole);
    const isManager = userRole === "manager";
    const isSalesperson = userRole === "salesperson" && !isCRMAdmin;

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);

    // Basic filters
    const search = searchParams.get("search");

    // People & Assignment filters
    const assignedToId = searchParams.get("assignedToId");
    const managerId = searchParams.get("managerId");
    const unassignedOnly = searchParams.get("unassignedOnly") === "true";
    const assignedTo = searchParams.get("assignedTo"); // Legacy support

    // Status filters (multi-select)
    const statuses = searchParams.getAll("status");
    const temperatures = searchParams.getAll("temperature");
    const priorities = searchParams.getAll("priority");
    const lostReason = searchParams.get("lostReason");

    // Financing filters
    const financingType = searchParams.get("financingType");
    const rtoApprovalStatus = searchParams.get("rtoApprovalStatus");
    const financeApprovalStatus = searchParams.get("financeApprovalStatus");
    const applied = searchParams.get("applied");

    // Location filters
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const zipcode = searchParams.get("zipcode");

    // Trailer filters
    const trailerType = searchParams.get("trailerType");
    const trailerSize = searchParams.get("trailerSize");
    const stockNumber = searchParams.get("stockNumber");
    const vin = searchParams.get("vin");

    // Time filters
    const createdAfter = searchParams.get("createdAfter");
    const createdBefore = searchParams.get("createdBefore");
    const lastContactedAfter = searchParams.get("lastContactedAfter");
    const lastContactedBefore = searchParams.get("lastContactedBefore");

    // Quick toggles
    const neverContacted = searchParams.get("neverContacted") === "true";
    const followUpOverdue = searchParams.get("followUpOverdue") === "true";

    // Build where clause
    const where: any = {};

    // === People & Assignment ===
    if (unassignedOnly) {
      where.assignedToId = null;
    } else {
      if (assignedToId) {
        where.assignedToId = assignedToId;
      }
      if (managerId) {
        where.managerId = managerId;
      }
    }

    // Legacy support
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // === Status filters ===
    if (statuses && statuses.length > 0) {
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    if (temperatures && temperatures.length > 0) {
      where.temperature = temperatures.length === 1 ? temperatures[0] : { in: temperatures };
    }

    if (priorities && priorities.length > 0) {
      where.priority = priorities.length === 1 ? priorities[0] : { in: priorities };
    }

    if (lostReason) {
      where.lostReason = lostReason;
    }

    // === Financing filters ===
    if (financingType) {
      where.financingType = financingType;
    }

    if (rtoApprovalStatus) {
      where.rtoApprovalStatus = rtoApprovalStatus;
    }

    if (financeApprovalStatus) {
      where.financeApprovalStatus = financeApprovalStatus;
    }

    if (applied === "true") {
      where.applied = true;
    } else if (applied === "false") {
      where.applied = false;
    }

    // === Location filters ===
    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (zipcode) {
      where.zipcode = { startsWith: zipcode };
    }

    // === Trailer filters ===
    if (trailerType) {
      where.trailerType = { contains: trailerType, mode: "insensitive" };
    }

    if (trailerSize) {
      where.trailerSize = { contains: trailerSize, mode: "insensitive" };
    }

    if (stockNumber) {
      where.stockNumber = { contains: stockNumber, mode: "insensitive" };
    }

    if (vin) {
      where.vin = { contains: vin.toUpperCase(), mode: "insensitive" };
    }

    // === Time filters ===
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) {
        where.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        where.createdAt.lte = new Date(createdBefore + "T23:59:59.999Z");
      }
    }

    if (lastContactedAfter || lastContactedBefore) {
      where.lastContactedAt = {};
      if (lastContactedAfter) {
        where.lastContactedAt.gte = new Date(lastContactedAfter);
      }
      if (lastContactedBefore) {
        where.lastContactedAt.lte = new Date(lastContactedBefore + "T23:59:59.999Z");
      }
    }

    // === Quick toggles ===
    if (neverContacted) {
      where.lastContactedAt = null;
    }

    if (followUpOverdue) {
      where.nextFollowUpDate = { lt: new Date() };
    }

    // === ROLE-BASED VISIBILITY (Critical Security Fix) ===
    // This MUST be applied to prevent reps from seeing other reps' customers
    if (isSalesperson) {
      // Salesperson: can ONLY see customers assigned to them
      where.assignedToId = currentUser.id;
    } else if (isManager && !isCRMAdmin) {
      // Manager: can see customers assigned to their team OR where managerId matches
      const teamMemberIds = await getTeamMemberIds(currentUser.id);
      // Include self in team for edge cases
      teamMemberIds.push(currentUser.id);

      where.OR = [
        { assignedToId: { in: teamMemberIds } },
        { managerId: currentUser.id },
      ];
    }
    // Owner/Director/CRM Admin: no filter applied - can see all

    // === Text search (OR across multiple fields) ===
    // Note: If search is used with role filtering, we need to combine properly
    if (search) {
      const searchConditions = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { companyName: { contains: search, mode: "insensitive" } },
        { vin: { contains: search.toUpperCase(), mode: "insensitive" } },
        { stockNumber: { contains: search, mode: "insensitive" } },
      ];

      // If we already have an OR clause from role filtering, we need to use AND
      if (where.OR) {
        // Wrap existing OR in AND with search OR
        const existingOR = where.OR;
        delete where.OR;
        where.AND = [
          { OR: existingOR },
          { OR: searchConditions },
        ];
      } else {
        where.OR = searchConditions;
      }
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
        street: true,  // FIX: Changed from 'address' to 'street' to match schema
        city: true,
        state: true,
        zipcode: true,
        status: true,
        source: true,
        assignedToId: true,
        assignedToName: true,
        salesRepName: true,
        temperature: true,
        priority: true,
        leadScore: true,
        creditAppStatus: true,
        tags: true,
        notes: true,
        repNotes: true,
        managerNotes: true,
        trailerSize: true,
        trailerType: true,
        financingType: true,
        applied: true,
        stockNumber: true,
        vin: true,
        managerId: true,
        lostReason: true,
        lostReasonNotes: true,
        rtoApprovalStatus: true,
        financeApprovalStatus: true,
        assignmentMethod: true,
        nextFollowUpDate: true,
        lastContactedAt: true,
        createdAt: true,
        updatedAt: true,
        // Related data with select projections
        deals: {
          select: {
            id: true,
            trailerId: true,
            status: true,
            finalPrice: true,
            offeredPrice: true,
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
  } catch (error: any) {
    // DETAILED ERROR LOGGING FOR PRODUCTION DEBUGGING
    console.error("═══════════════════════════════════════");
    console.error("PIPELINE_CUSTOMERS_ERROR - Full Details:");
    console.error("═══════════════════════════════════════");
    console.error("Error Message:", error?.message);
    console.error("Error Name:", error?.name);
    console.error("Error Code:", error?.code);
    console.error("Error Meta:", error?.meta);
    console.error("Full Error Object:", JSON.stringify(error, null, 2));
    console.error("Stack Trace:", error?.stack);
    console.error("═══════════════════════════════════════");

    // Return graceful error response
    return NextResponse.json(
      {
        error: "Failed to fetch customers",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
        code: error?.code
      },
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
      repCode,  // Rep code for auto-assignment
    } = validation.data;

    // Check if customer already exists (only if email provided)
    if (email) {
      const existing = await prisma.customer.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Customer with this email already exists" },
          { status: 400 }
        );
      }
    }

    // === BATCH 1: Auto-assignment logic ===
    let assignedToId: string | null = null;
    let assignedToName: string | null = null;
    let salesRepName: string | null = null;
    let managerId: string | null = null;
    let assignmentMethod: string = "manual";

    // Normalize VIN if provided
    const normalizedVin = body.vin?.trim().toUpperCase() || null;

    if (repCode) {
      // RepCode route: Find rep by repCode and assign to them + their manager
      const rep = await prisma.userProfile.findFirst({
        where: { repCode },
        include: { user: true },
      });

      if (rep) {
        assignedToId = rep.userId;
        assignedToName = rep.user.name || `${rep.firstName || ''} ${rep.lastName || ''}`.trim() || rep.user.email || null;
        salesRepName = assignedToName;
        managerId = rep.managerId;
        assignmentMethod = "repCode";

        // If rep has a manager, get manager's name
        if (rep.managerId) {
          const manager = await prisma.userProfile.findFirst({
            where: { userId: rep.managerId },
            include: { user: true },
          });
          if (manager) {
            // assignedToName is the manager for display purposes in some contexts
            // Keep salesRepName as the actual rep
          }
        }
      }
    } else {
      // Intake route: Assign to first available CRM Admin
      const crmAdmin = await prisma.userProfile.findFirst({
        where: { canAdminCRM: true, isActive: true },
        include: { user: true },
        orderBy: { createdAt: "asc" }, // Deterministic order - oldest first
      });

      if (crmAdmin) {
        assignedToId = crmAdmin.userId;
        assignedToName = crmAdmin.user.name || `${crmAdmin.firstName || ''} ${crmAdmin.lastName || ''}`.trim() || crmAdmin.user.email || null;
        salesRepName = assignedToName;
        managerId = crmAdmin.managerId;
        assignmentMethod = "intake";
      }
    }

    // Create customer with auto-assignment
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
        assignedToId,
        assignedToName,
        salesRepName,
        managerId,
        assignmentMethod,
        repCode: repCode || null,
        vin: normalizedVin,
        status: status || "new",
        tags: tags || [],
        notes,
        // lastContactedAt intentionally NOT set on creation
        // Will be set when actual contact happens (call/email/message logged)
      },
    });

    // Create initial activity log
    await prisma.activity.create({
      data: {
        customerId: customer.id,
        userId: session.user.id,
        type: "note",
        subject: "Customer Created",
        description: `New customer added to CRM by ${session.user.name || session.user.email}${assignmentMethod !== "manual" ? ` (Auto-assigned via ${assignmentMethod})` : ""}`,
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
