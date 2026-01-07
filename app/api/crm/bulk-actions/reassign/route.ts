/**
 * Bulk Reassign API
 * PATCH /api/crm/bulk-actions/reassign
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission } from "@/lib/crm-permissions";
import { notifyCustomerAssigned } from "@/lib/in-app-notifications";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    const body = await req.json();
    const { customerIds, assignedToId } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "customerIds array is required" },
        { status: 400 }
      );
    }

    if (!assignedToId) {
      return NextResponse.json({ error: "assignedToId is required" }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: assignedToId },
      include: { profile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check reassign permission
    const canReassign = await checkCRMPermission(context, "reassign");
    if (!canReassign.allowed) {
      return NextResponse.json(
        { error: "You don't have permission to reassign leads" },
        { status: 403 }
      );
    }

    // Update all customers
    const result = await prisma.customer.updateMany({
      where: { id: { in: customerIds } },
      data: {
        assignedToId,
        assignedToName: targetUser.profile?.firstName || targetUser.email || "",
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log activity for each customer
    await Promise.all(
      customerIds.map((customerId) =>
        prisma.activity.create({
          data: {
            customerId,
            userId: context.userId,
            type: "note",
            subject: "Lead Reassigned",
            description: `Reassigned to ${targetUser.profile?.firstName || targetUser.email} via bulk action by ${context.userEmail}`,
            status: "completed",
            completedAt: new Date(),
          },
        })
      )
    );

    // Send in-app notifications for each reassigned customer
    try {
      const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, firstName: true, lastName: true },
      });

      await Promise.all(
        customers.map((customer) =>
          notifyCustomerAssigned({
            userId: assignedToId,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerId: customer.id,
            assignedBy: context.userEmail,
          })
        )
      );
      console.log(`✅ In-app notifications sent for ${customers.length} reassigned leads`);
    } catch (notifError) {
      console.error("Failed to send in-app notifications (non-blocking):", notifError);
    }

    console.log(`✅ Bulk reassign: ${result.count} leads assigned to ${targetUser.email}`);

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error in bulk reassign:", error);
    return NextResponse.json(
      { error: "Failed to reassign leads" },
      { status: 500 }
    );
  }
}
