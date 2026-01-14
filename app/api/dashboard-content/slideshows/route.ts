/**
 * Slideshows Management API
 *
 * GET: List all slideshows (owner/director only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all slideshows for management
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile || !["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Only owners and directors can manage slideshows" },
        { status: 403 }
      );
    }

    const slideshows = await prisma.dashboardSlideshow.findMany({
      include: {
        slides: {
          orderBy: { displayOrder: "asc" },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ slideshows });
  } catch (error) {
    console.error("Error fetching slideshows:", error);
    return NextResponse.json(
      { error: "Failed to fetch slideshows" },
      { status: 500 }
    );
  }
}
