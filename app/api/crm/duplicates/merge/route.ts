/**
 * Merge Duplicates API
 * POST /api/crm/duplicates/merge
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildPermissionContext } from "@/lib/crm-permissions";
import { mergeDuplicates } from "@/lib/deduplication";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // Only allow managers and above to merge duplicates
    if (!["owner", "director", "manager"].includes(context.role)) {
      return NextResponse.json(
        { error: "Only managers can merge duplicates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { masterLeadId, duplicateLeadIds } = body;

    if (!masterLeadId || !duplicateLeadIds || !Array.isArray(duplicateLeadIds)) {
      return NextResponse.json(
        { error: "masterLeadId and duplicateLeadIds array are required" },
        { status: 400 }
      );
    }

    if (duplicateLeadIds.length === 0) {
      return NextResponse.json(
        { error: "No duplicate IDs provided" },
        { status: 400 }
      );
    }

    console.log(`🔀 Merging ${duplicateLeadIds.length} duplicates into ${masterLeadId}...`);

    await mergeDuplicates(masterLeadId, duplicateLeadIds);

    console.log(`✅ Successfully merged ${duplicateLeadIds.length} duplicate leads`);

    return NextResponse.json({
      success: true,
      merged: duplicateLeadIds.length,
      masterId: masterLeadId,
    });
  } catch (error) {
    console.error("Error merging duplicates:", error);
    return NextResponse.json(
      { error: "Failed to merge duplicates" },
      { status: 500 }
    );
  }
}
