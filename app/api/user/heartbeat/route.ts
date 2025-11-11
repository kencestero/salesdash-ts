import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/user/heartbeat - Update user's lastSeen timestamp
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's lastSeen timestamp and set isOnline to true
    await prisma.userProfile.updateMany({
      where: { userId: currentUser.id },
      data: {
        lastSeen: new Date(),
        isOnline: true,
      },
    });

    return NextResponse.json({ success: true, lastSeen: new Date() });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 }
    );
  }
}
