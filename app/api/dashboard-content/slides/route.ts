/**
 * Slides Management API
 *
 * POST: Create new slide in a slideshow
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Create new slide
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
    const {
      slideshowId,
      contentType,
      layoutType = "FULL_MEDIA",
      mediaUrl,
      mediaDriveId,
      mediaAlt,
      youtubeId,
      title,
      description,
      textColor = "#FFFFFF",
      backgroundColor = "#000000",
      linkUrl,
      linkText,
      displayOrder,
      startDate,
      endDate,
    } = body;

    if (!slideshowId) {
      return NextResponse.json({ error: "Slideshow ID is required" }, { status: 400 });
    }

    if (!contentType) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 });
    }

    // Get max display order if not provided
    let order = displayOrder;
    if (order === undefined) {
      const maxOrder = await prisma.dashboardSlide.findFirst({
        where: { slideshowId },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      order = (maxOrder?.displayOrder ?? -1) + 1;
    }

    const slide = await prisma.dashboardSlide.create({
      data: {
        slideshowId,
        contentType,
        layoutType,
        mediaUrl,
        mediaDriveId,
        mediaAlt,
        youtubeId,
        title,
        description,
        textColor,
        backgroundColor,
        linkUrl,
        linkText,
        displayOrder: order,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, slide });
  } catch (error) {
    console.error("Error creating slide:", error);
    return NextResponse.json(
      { error: "Failed to create slide" },
      { status: 500 }
    );
  }
}
