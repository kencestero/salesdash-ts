/**
 * Slides Reorder API
 *
 * POST: Reorder slides in a slideshow
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Reorder slides
export async function POST(req: NextRequest) {
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
        { error: "Only owners and directors can manage slides" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { slideIds } = body; // Array of slide IDs in new order

    if (!Array.isArray(slideIds)) {
      return NextResponse.json({ error: "slideIds must be an array" }, { status: 400 });
    }

    // Update each slide's display order
    await Promise.all(
      slideIds.map((id, index) =>
        prisma.dashboardSlide.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering slides:", error);
    return NextResponse.json(
      { error: "Failed to reorder slides" },
      { status: 500 }
    );
  }
}
