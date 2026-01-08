import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/users - Get all users (for messaging purposes)
// Query params:
//   includeSelf=true - Include current user in results (for assignment dropdowns)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if self should be included (for assignment dropdowns)
    const { searchParams } = new URL(req.url);
    const includeSelf = searchParams.get("includeSelf") === "true";

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause - optionally exclude current user
    const whereClause: any = {
      profile: {
        isActive: true,
      },
    };

    // Only exclude current user if includeSelf is not true
    if (!includeSelf) {
      whereClause.id = { not: currentUser.id };
    }

    // Fetch all active users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
