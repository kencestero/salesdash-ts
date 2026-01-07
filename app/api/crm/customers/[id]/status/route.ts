/**
 * Update Customer/Lead Status API
 *
 * PATCH /api/crm/customers/[id]/status
 * Updates lead status with permissions + bidirectional sync
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission } from "@/lib/crm-permissions";
import { syncCustomerFieldsToSheet } from "@/lib/google-sheets-sync";
import {
  calculateLeadScore,
  getLeadTemperature,
  determinePriority,
  calculateDaysInStage,
} from "@/lib/lead-scoring";
import { notifyStatusChange } from "@/lib/notifications";
import { onStatusChange } from "@/lib/follow-up-engine";
import { notifyStatusChanged } from "@/lib/in-app-notifications";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build permission context
    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // Check edit permission
    const canEdit = await checkCRMPermission(context, "edit", params.id);
    if (!canEdit.allowed) {
      return NextResponse.json({ error: canEdit.reason || "Permission denied" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ["new", "contacted", "qualified", "applied", "approved", "won", "dead"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch current customer data
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Recalculate lead score and related fields
    const { score } = calculateLeadScore(customer);
    const temperature = getLeadTemperature(score);
    const priority = determinePriority(customer, score);
    const daysInStage = 0; // Reset when status changes

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        status,
        leadScore: score,
        temperature,
        priority,
        daysInStage,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
        syncStatus: "pending", // Mark for sync
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        customerId: params.id,
        userId: context.userId,
        type: "note",
        subject: "Status Changed",
        description: `Status changed from "${customer.status}" to "${status}" by ${context.userEmail}`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // 🚀 BIDIRECTIONAL SYNC: Update Google Sheets
    if (customer.phone) {
      try {
        await syncCustomerFieldsToSheet(customer.phone, { status });

        await prisma.customer.update({
          where: { id: params.id },
          data: {
            syncStatus: "synced",
            lastSyncedToSheets: new Date(),
          },
        });
      } catch (syncError) {
        console.error("Failed to sync status to Google Sheets:", syncError);
        // Don't fail the whole request
      }
    }

    // 📧 SEND EMAIL NOTIFICATION: Notify assigned rep about status change
    try {
      const assignedRep = await prisma.user.findUnique({
        where: { id: customer.assignedToId! },
        include: { profile: true },
      });

      if (assignedRep?.email && assignedRep.profile) {
        // Send email notification
        await notifyStatusChange({
          repEmail: assignedRep.email,
          repName: assignedRep.profile.firstName || assignedRep.email,
          leadName: `${customer.firstName} ${customer.lastName}`,
          oldStatus: customer.status,
          newStatus: status,
          changedBy: context.userEmail,
        });

        // Send in-app notification
        await notifyStatusChanged({
          userId: customer.assignedToId!,
          customerName: `${customer.firstName} ${customer.lastName}`,
          oldStatus: customer.status,
          newStatus: status,
          changedBy: context.userEmail,
          customerId: params.id,
        });

        console.log(`✅ Status change notification sent to ${assignedRep.email}`);
      }
    } catch (notifError) {
      console.error("Failed to send status notification (non-blocking):", notifError);
      // Don't fail the whole request if notification fails
    }

    // 🤖 AUTO-CREATE FOLLOW-UPS: Create follow-up tasks based on new status
    try {
      await onStatusChange(params.id, status);
      console.log(`✅ Auto-created follow-ups for new status: ${status}`);
    } catch (followUpError) {
      console.error("Failed to create follow-ups (non-blocking):", followUpError);
      // Don't fail the whole request if follow-up creation fails
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
