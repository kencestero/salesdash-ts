/**
 * Find Duplicates API
 * GET /api/crm/duplicates/find
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildPermissionContext } from "@/lib/crm-permissions";
import { findDuplicates } from "@/lib/deduplication";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // Only allow managers and above to view duplicates
    if (!["owner", "director", "manager"].includes(context.role)) {
      return NextResponse.json(
        { error: "Only managers can access duplicate detection" },
        { status: 403 }
      );
    }

    console.log("🔍 Scanning for duplicate leads...");

    const duplicateGroups = await findDuplicates();

    console.log(`✅ Found ${duplicateGroups.length} duplicate groups`);

    return NextResponse.json({
      duplicateGroups,
      totalGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.leads.length, 0),
    });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return NextResponse.json(
      { error: "Failed to find duplicates" },
      { status: 500 }
    );
  }
}
