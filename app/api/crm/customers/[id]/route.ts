import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper: Get team member IDs for a manager
async function getTeamMemberIds(managerId: string): Promise<string[]> {
  const teamMembers = await prisma.userProfile.findMany({
    where: { managerId },
    select: { userId: true },
  });
  return teamMembers.map((m) => m.userId);
}

// PATCH /api/crm/customers/[id] - Update customer with assignment controls
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

    const { id } = params;
    const body = await req.json();

    // Fetch existing customer for comparison (needed for assignment history)
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const userRole = currentUser.profile.role;
    const isOwnerOrDirector = ["owner", "director"].includes(userRole);
    const isManager = userRole === "manager";
    const isSalesperson = userRole === "salesperson";

    // === BATCH 1: Assignment permission enforcement ===
    const isAssignmentChange = body.assignedToId !== undefined || body.managerId !== undefined;

    if (isAssignmentChange) {
      // Salesperson cannot change assignments - server-side enforcement
      if (isSalesperson) {
        return NextResponse.json(
          { error: "Salespeople cannot reassign leads" },
          { status: 403 }
        );
      }

      // Manager can only reassign within their team
      if (isManager && body.assignedToId) {
        const teamMemberIds = await getTeamMemberIds(currentUser.id);
        // Include self in team for edge cases
        teamMemberIds.push(currentUser.id);

        // Check if target rep is in manager's team
        if (!teamMemberIds.includes(body.assignedToId)) {
          return NextResponse.json(
            { error: "Managers can only assign leads within their team" },
            { status: 403 }
          );
        }
      }
    }

    // Non-manager/director/owner editing restrictions
    if (isSalesperson) {
      // Salespeople can only edit their own leads' notes
      if (existingCustomer.assignedToId !== currentUser.id) {
        return NextResponse.json(
          { error: "Salespeople can only edit their own leads" },
          { status: 403 }
        );
      }
    }

    // === BATCH 1: Lost reason validation ===
    const lostReason = body.lostReason ?? existingCustomer.lostReason;
    const lostReasonNotes = body.lostReasonNotes ?? existingCustomer.lostReasonNotes;

    if (lostReason === "other" && !lostReasonNotes?.trim()) {
      return NextResponse.json(
        { error: "Notes are required when Lost Reason is 'Other'" },
        { status: 400 }
      );
    }

    // === BATCH 1: VIN normalization ===
    const normalizedVin = body.vin !== undefined
      ? (body.vin?.trim().toUpperCase() || null)
      : undefined;

    // === BATCH 1: Derive assignedToName/salesRepName from user lookup ===
    let assignedToName = existingCustomer.assignedToName;
    let salesRepName = existingCustomer.salesRepName;
    let newManagerId = body.managerId;

    if (body.assignedToId && body.assignedToId !== existingCustomer.assignedToId) {
      // Lookup the new rep's name from UserProfile
      const newRep = await prisma.userProfile.findFirst({
        where: { userId: body.assignedToId },
        include: { user: true },
      });

      if (newRep) {
        const repName = newRep.user.name || `${newRep.firstName || ''} ${newRep.lastName || ''}`.trim() || newRep.user.email || null;
        assignedToName = repName;
        salesRepName = repName;
        // Auto-populate manager from rep's profile if not explicitly set
        if (newManagerId === undefined) {
          newManagerId = newRep.managerId;
        }
      }
    }

    // Build update data
    const updateData: any = {
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
      // BATCH 1: VIN field (normalized)
      ...(normalizedVin !== undefined && { vin: normalizedVin }),
      // Lead status fields
      ...(body.temperature && { temperature: body.temperature }),
      ...(body.linkSentStatus && { linkSentStatus: body.linkSentStatus }),
      ...(body.approvalStatus && { approvalStatus: body.approvalStatus }),
      // Separate approval status fields
      ...(body.rtoApprovalStatus !== undefined && { rtoApprovalStatus: body.rtoApprovalStatus }),
      ...(body.financeApprovalStatus !== undefined && { financeApprovalStatus: body.financeApprovalStatus }),
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.managerNotes !== undefined && { managerNotes: body.managerNotes }),
      ...(body.repNotes !== undefined && { repNotes: body.repNotes }),
      // BATCH 1: Lost reason fields
      ...(body.lostReason !== undefined && { lostReason: body.lostReason }),
      ...(body.lostReasonNotes !== undefined && { lostReasonNotes: body.lostReasonNotes }),
      // BATCH 1: Assignment fields (derived names from server lookup)
      ...(body.assignedToId !== undefined && {
        assignedToId: body.assignedToId,
        assignedToName,
        salesRepName,
      }),
      ...(newManagerId !== undefined && { managerId: newManagerId }),
      // Mark as manual assignment when reassigned by user
      ...(isAssignmentChange && { assignmentMethod: "manual" }),
      updatedAt: new Date(),
    };

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    // === BATCH 1: Create assignment_change activity if rep/manager actually changed ===
    const repChanged = body.assignedToId !== undefined && body.assignedToId !== existingCustomer.assignedToId;
    const managerChanged = newManagerId !== undefined && newManagerId !== existingCustomer.managerId;

    if (repChanged || managerChanged) {
      // Lookup old rep/manager names for the activity
      let fromRepName = existingCustomer.assignedToName || "Unassigned";
      let toRepName = assignedToName || "Unassigned";
      let fromManagerName: string | null = null;
      let toManagerName: string | null = null;

      if (existingCustomer.managerId) {
        const oldManager = await prisma.userProfile.findFirst({
          where: { userId: existingCustomer.managerId },
          include: { user: true },
        });
        if (oldManager) {
          fromManagerName = oldManager.user.name || `${oldManager.firstName || ''} ${oldManager.lastName || ''}`.trim() || null;
        }
      }

      if (newManagerId) {
        const newManager = await prisma.userProfile.findFirst({
          where: { userId: newManagerId },
          include: { user: true },
        });
        if (newManager) {
          toManagerName = newManager.user.name || `${newManager.firstName || ''} ${newManager.lastName || ''}`.trim() || null;
        }
      }

      await prisma.activity.create({
        data: {
          customerId: id,
          userId: currentUser.id,
          type: "assignment_change",
          subject: "Lead reassigned",
          description: JSON.stringify({
            fromAssignedToId: existingCustomer.assignedToId,
            toAssignedToId: body.assignedToId || existingCustomer.assignedToId,
            fromAssignedToName: fromRepName,
            toAssignedToName: toRepName,
            fromManagerId: existingCustomer.managerId,
            toManagerId: newManagerId || existingCustomer.managerId,
            fromManagerName,
            toManagerName,
            changedBy: currentUser.name || currentUser.email,
            changedByRole: currentUser.profile.role,
            reason: body.reassignReason || null,
            method: "manual",
          }),
          status: "completed",
          completedAt: new Date(),
        },
      });
    }

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
