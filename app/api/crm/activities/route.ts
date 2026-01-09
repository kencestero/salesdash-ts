import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

// Helper: Check if user can access customer
async function canAccessCustomer(
  currentUser: { id: string; profile: { role: string; canAdminCRM?: boolean | null; managerId?: string | null } | null },
  customerId: string
): Promise<boolean> {
  const role = currentUser.profile?.role || "salesperson";
  const isCRMAdmin = currentUser.profile?.canAdminCRM ?? false;

  if (["owner", "director"].includes(role) || isCRMAdmin) {
    return true;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { assignedToId: true, managerId: true },
  });

  if (!customer) return false;

  if (role === "manager") {
    const teamMemberIds = await getTeamMemberIds(currentUser.id);
    teamMemberIds.push(currentUser.id);
    return (
      teamMemberIds.includes(customer.assignedToId || "") ||
      customer.managerId === currentUser.id
    );
  }

  // Salesperson
  return customer.assignedToId === currentUser.id;
}

// POST /api/crm/activities - Create new activity
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, type, subject, description, dueDate } = body;

    if (!customerId || !type || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user with profile for role-based access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // === ROLE-BASED VISIBILITY CHECK (Critical Security Fix) ===
    const hasAccess = await canAccessCustomer(user as any, customerId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const activity = await prisma.activity.create({
      data: {
        customerId,
        userId: user.id,
        type,
        subject,
        description,
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(type === "call" && { status: "completed", completedAt: new Date() }),
      },
    });

    // Update customer's lastContactedAt
    if (type === "call" || type === "email" || type === "meeting") {
      await prisma.customer.update({
        where: { id: customerId },
        data: { lastContactedAt: new Date() },
      });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}

// GET /api/crm/activities - Get activities with role-based visibility
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with profile for role-based access
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // If specific customer requested, verify access
    if (customerId) {
      const hasAccess = await canAccessCustomer(currentUser as any, customerId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }
    }

    // Build where clause with role-based visibility
    const role = currentUser.profile.role;
    const isCRMAdmin = currentUser.profile.canAdminCRM ?? false;
    const isOwnerOrDirector = ["owner", "director"].includes(role);

    let where: any = {};

    if (customerId) {
      where.customerId = customerId;
    } else if (!isOwnerOrDirector && !isCRMAdmin) {
      // Need to filter activities by accessible customers
      if (role === "manager") {
        const teamMemberIds = await getTeamMemberIds(currentUser.id);
        teamMemberIds.push(currentUser.id);
        where.customer = {
          OR: [
            { assignedToId: { in: teamMemberIds } },
            { managerId: currentUser.id },
          ],
        };
      } else {
        // Salesperson: only activities for their customers
        where.customer = {
          assignedToId: currentUser.id,
        };
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
