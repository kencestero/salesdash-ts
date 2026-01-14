/**
 * Individual Slideshow API
 *
 * GET: Fetch single slideshow
 * PATCH: Update slideshow settings
 * DELETE: Delete slideshow
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 };
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!currentUser?.profile || !["owner", "director"].includes(currentUser.profile.role)) {
    return { error: "Only owners and directors can manage slideshows", status: 403 };
  }

  return { user: currentUser };
}

// GET: Fetch single slideshow with slides
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await checkAdminAccess();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const slideshow = await prisma.dashboardSlideshow.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: { displayOrder: "asc" },
        },
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (!slideshow) {
      return NextResponse.json({ error: "Slideshow not found" }, { status: 404 });
    }

    return NextResponse.json({ slideshow });
  } catch (error) {
    console.error("Error fetching slideshow:", error);
    return NextResponse.json(
      { error: "Failed to fetch slideshow" },
      { status: 500 }
    );
  }
}

// PATCH: Update slideshow settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await checkAdminAccess();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { name, rotationSpeed, isActive } = body;

    // If making this slideshow active, deactivate others
    if (isActive === true) {
      await prisma.dashboardSlideshow.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    const slideshow = await prisma.dashboardSlideshow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(rotationSpeed !== undefined && { rotationSpeed }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, slideshow });
  } catch (error) {
    console.error("Error updating slideshow:", error);
    return NextResponse.json(
      { error: "Failed to update slideshow" },
      { status: 500 }
    );
  }
}

// DELETE: Delete slideshow and all its slides
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await checkAdminAccess();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await prisma.dashboardSlideshow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slideshow:", error);
    return NextResponse.json(
      { error: "Failed to delete slideshow" },
      { status: 500 }
    );
  }
}
