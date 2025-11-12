/**
 * Bulk Tag API
 * PATCH /api/crm/bulk-actions/tag
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission } from "@/lib/crm-permissions";

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
    const { customerIds, tag, action } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "customerIds array is required" },
        { status: 400 }
      );
    }

    if (!tag) {
      return NextResponse.json({ error: "tag is required" }, { status: 400 });
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, tags: true },
    });

    let updated = 0;

    for (const customer of customers) {
      const canEdit = await checkCRMPermission(context, "edit", customer.id);
      if (!canEdit.allowed) continue;

      const currentTags = customer.tags || [];
      let newTags: string[];

      if (action === "remove") {
        newTags = currentTags.filter((t: string) => t !== tag);
      } else {
        // Add tag (default action)
        if (!currentTags.includes(tag)) {
          newTags = [...currentTags, tag];
        } else {
          continue; // Skip if tag already exists
        }
      }

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          tags: newTags,
          updatedAt: new Date(),
        },
      });

      updated++;
    }

    console.log(`✅ Bulk tag: ${updated} leads tagged with "${tag}"`);

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error("Error in bulk tag:", error);
    return NextResponse.json(
      { error: "Failed to tag leads" },
      { status: 500 }
    );
  }
}
