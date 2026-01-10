import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNextDealNumberPreview } from "@/lib/deal-number";

/**
 * GET /api/deals/next-number
 * Returns a preview of the next deal number (without incrementing)
 * Used for displaying in the Mark as Sold form
 */
export async function GET() {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nextNumber = await getNextDealNumberPreview();

    return NextResponse.json({ nextNumber });
  } catch (error) {
    console.error("[deals/next-number] Error:", error);
    return NextResponse.json(
      { error: "Failed to get next deal number" },
      { status: 500 }
    );
  }
}
