/**
 * Bulk Status Change API
 * PATCH /api/crm/bulk-actions/status
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission, validateStatusChange } from "@/lib/crm-permissions";
import { onStatusChange } from "@/lib/follow-up-engine";

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
    const { customerIds, status, lostReason } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "customerIds array is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ["new", "contacted", "qualified", "applied", "approved", "won", "dead"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Check edit permission for each customer
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });

    // Track validation failures
    const validationErrors: { customerId: string; name: string; error: string }[] = [];

    for (const customer of customers) {
      const canEdit = await checkCRMPermission(context, "edit", customer.id);
      if (!canEdit.allowed) {
        return NextResponse.json(
          { error: `Permission denied for customer ${customer.id}` },
          { status: 403 }
        );
      }

      // 🔒 ENFORCE CRM SETTINGS: Validate status change against configured rules
      const statusValidation = await validateStatusChange(
        {
          assignedToId: customer.assignedToId,
          phone: customer.phone,
          email: customer.email,
          trailerType: customer.trailerType,
          financingType: customer.financingType,
          trailerSize: customer.trailerSize,
          stockNumber: customer.stockNumber,
          lostReason: customer.lostReason,
        },
        status,
        lostReason
      );

      if (!statusValidation.valid) {
        validationErrors.push({
          customerId: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          error: statusValidation.error || "Validation failed",
        });
      }
    }

    // If any customer fails validation, return all errors
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Some customers cannot be updated to this status",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Update all customers
    const result = await prisma.customer.updateMany({
      where: { id: { in: customerIds } },
      data: {
        status,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
        // Update lostReason if marking as dead
        ...(status === "dead" && lostReason ? { lostReason } : {}),
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
            subject: "Bulk Status Change",
            description: `Status changed to "${status}" via bulk action by ${context.userEmail}`,
            status: "completed",
            completedAt: new Date(),
          },
        })
      )
    );

    // Create follow-ups for each customer
    await Promise.all(
      customerIds.map((customerId) => onStatusChange(customerId, status))
    );

    console.log(`✅ Bulk status change: ${result.count} leads updated to ${status}`);

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error in bulk status change:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
