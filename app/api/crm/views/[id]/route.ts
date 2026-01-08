import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/crm/views/[id] - Get a specific saved view
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const view = await prisma.savedView.findUnique({
      where: { id },
    });

    if (!view) {
      return NextResponse.json({ error: "View not found" }, { status: 404 });
    }

    return NextResponse.json({ view });
  } catch (error) {
    console.error("Error fetching saved view:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved view" },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/views/[id] - Update a saved view
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if view exists and user has permission to edit
    const existingView = await prisma.savedView.findUnique({
      where: { id },
    });

    if (!existingView) {
      return NextResponse.json({ error: "View not found" }, { status: 404 });
    }

    // Only owner of view or owners/directors can edit global views
    const canEdit =
      existingView.userId === currentUser.id ||
      (existingView.isGlobal &&
        ["owner", "director"].includes(currentUser.profile?.role || ""));

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this view" },
        { status: 403 }
      );
    }

    // If setting as default, unset any existing default for this user
    if (body.isDefault) {
      await prisma.savedView.updateMany({
        where: {
          userId: currentUser.id,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const view = await prisma.savedView.update({
      where: { id },
      data: {
        name: body.name,
        filters: body.filters,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json({ view });
  } catch (error) {
    console.error("Error updating saved view:", error);
    return NextResponse.json(
      { error: "Failed to update saved view" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/views/[id] - Delete a saved view
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Check if view exists and user has permission to delete
    const existingView = await prisma.savedView.findUnique({
      where: { id },
    });

    if (!existingView) {
      return NextResponse.json({ error: "View not found" }, { status: 404 });
    }

    // Only owner of view or owners/directors can delete global views
    const canDelete =
      existingView.userId === currentUser.id ||
      (existingView.isGlobal &&
        ["owner", "director"].includes(currentUser.profile?.role || ""));

    if (!canDelete) {
      return NextResponse.json(
        { error: "You don't have permission to delete this view" },
        { status: 403 }
      );
    }

    await prisma.savedView.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved view:", error);
    return NextResponse.json(
      { error: "Failed to delete saved view" },
      { status: 500 }
    );
  }
}
