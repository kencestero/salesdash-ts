import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/views - List saved views (user's + global)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's personal views + global views
    const views = await prisma.savedView.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { isGlobal: true },
        ],
      },
      orderBy: [
        { isGlobal: "desc" }, // Global views first
        { name: "asc" },
      ],
    });

    return NextResponse.json({ views });
  } catch (error) {
    console.error("Error fetching saved views:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved views" },
      { status: 500 }
    );
  }
}

// POST /api/crm/views - Create a new saved view
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

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, filters, isGlobal, isDefault } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: "Name and filters are required" },
        { status: 400 }
      );
    }

    // Only owners and directors can create global views
    const canCreateGlobal = ["owner", "director"].includes(
      currentUser.profile?.role || ""
    );

    if (isGlobal && !canCreateGlobal) {
      return NextResponse.json(
        { error: "Only owners and directors can create global views" },
        { status: 403 }
      );
    }

    // If setting as default, unset any existing default for this user
    if (isDefault) {
      await prisma.savedView.updateMany({
        where: {
          userId: currentUser.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const view = await prisma.savedView.create({
      data: {
        name,
        filters,
        userId: isGlobal ? null : currentUser.id,
        isGlobal: isGlobal || false,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ view }, { status: 201 });
  } catch (error) {
    console.error("Error creating saved view:", error);
    return NextResponse.json(
      { error: "Failed to create saved view" },
      { status: 500 }
    );
  }
}
