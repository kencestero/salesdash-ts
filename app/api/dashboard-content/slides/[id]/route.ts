/**
 * Individual Slide API
 *
 * PATCH: Update slide
 * DELETE: Delete slide
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
    return { error: "Only owners and directors can manage slides", status: 403 };
  }

  return { user: currentUser };
}

// PATCH: Update slide
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
    const {
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
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = body;

    const slide = await prisma.dashboardSlide.update({
      where: { id },
      data: {
        ...(contentType !== undefined && { contentType }),
        ...(layoutType !== undefined && { layoutType }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(mediaDriveId !== undefined && { mediaDriveId }),
        ...(mediaAlt !== undefined && { mediaAlt }),
        ...(youtubeId !== undefined && { youtubeId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(textColor !== undefined && { textColor }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(linkText !== undefined && { linkText }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json({ success: true, slide });
  } catch (error) {
    console.error("Error updating slide:", error);
    return NextResponse.json(
      { error: "Failed to update slide" },
      { status: 500 }
    );
  }
}

// DELETE: Delete slide
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

    await prisma.dashboardSlide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slide:", error);
    return NextResponse.json(
      { error: "Failed to delete slide" },
      { status: 500 }
    );
  }
}
