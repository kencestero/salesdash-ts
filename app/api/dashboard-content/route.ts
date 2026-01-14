/**
 * Dashboard Content API
 *
 * GET: Fetch active slideshow with slides (public for logged-in users)
 * POST: Create new slideshow (owner/director only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch active slideshow for dashboard display
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Get active slideshow with active slides
    const slideshow = await prisma.dashboardSlideshow.findFirst({
      where: { isActive: true },
      include: {
        slides: {
          where: {
            isActive: true,
            OR: [
              { startDate: null, endDate: null },
              { startDate: { lte: now }, endDate: null },
              { startDate: null, endDate: { gte: now } },
              { startDate: { lte: now }, endDate: { gte: now } },
            ],
          },
          orderBy: { displayOrder: "asc" },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      slideshow,
      hasContent: slideshow && slideshow.slides.length > 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard content:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard content" },
      { status: 500 }
    );
  }
}

// POST: Create new slideshow (owner/director only)
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
        { error: "Only owners and directors can create slideshows" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, rotationSpeed = 5000, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // If creating an active slideshow, deactivate others
    if (isActive) {
      await prisma.dashboardSlideshow.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const slideshow = await prisma.dashboardSlideshow.create({
      data: {
        name,
        rotationSpeed,
        isActive,
        createdById: currentUser.id,
      },
    });

    return NextResponse.json({ success: true, slideshow });
  } catch (error) {
    console.error("Error creating slideshow:", error);
    return NextResponse.json(
      { error: "Failed to create slideshow" },
      { status: 500 }
    );
  }
}
