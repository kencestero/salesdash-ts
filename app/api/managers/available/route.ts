import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/managers/available
 *
 * Returns list of users who are available to be selected as managers during signup.
 *
 * Criteria:
 * - role IN ["owner", "director", "manager"]
 * - isAvailableAsManager = true
 * - isActive = true
 *
 * Public endpoint - no authentication required (used on signup page)
 */
export async function GET(req: NextRequest) {
  try {
    const availableManagers = await prisma.user.findMany({
      where: {
        profile: {
          role: {
            in: ["owner", "director", "manager"]
          },
          isAvailableAsManager: true,
          isActive: true,
        }
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: [
        { profile: { role: "asc" } }, // owners first, then directors, then managers
        { name: "asc" }
      ]
    });

    // Format for frontend consumption
    const formattedManagers = availableManagers.map(user => ({
      id: user.id,
      name: user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.name || "Unknown",
      role: user.profile?.role || "salesperson",
      email: user.email,
    }));

    return NextResponse.json({
      success: true,
      managers: formattedManagers,
      count: formattedManagers.length,
    });

  } catch (error) {
    console.error("❌ Error fetching available managers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available managers",
        managers: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
