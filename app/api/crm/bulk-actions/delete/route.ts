/**
 * Bulk Delete API
 * DELETE /api/crm/bulk-actions/delete
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
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
    const { customerIds } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "customerIds array is required" },
        { status: 400 }
      );
    }

    // Check delete permission for each customer
    let deleteCount = 0;

    for (const customerId of customerIds) {
      const canDelete = await checkCRMPermission(context, "delete", customerId);
      if (!canDelete.allowed) {
        console.warn(`User ${context.userEmail} cannot delete customer ${customerId}`);
        continue;
      }

      // Delete customer (cascade deletes activities, deals, etc.)
      await prisma.customer.delete({
        where: { id: customerId },
      });

      deleteCount++;
    }

    console.log(`✅ Bulk delete: ${deleteCount} leads deleted by ${context.userEmail}`);

    return NextResponse.json({
      success: true,
      deleted: deleteCount,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 }
    );
  }
}
