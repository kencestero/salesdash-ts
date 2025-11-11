import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1) Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) Fetch all request logs submitted by this user
    const logs = await prisma.requestLog.findMany({
      where: {
        submittedByUserId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        email: true,
        fullName: true,
        manufacturer: true,
        purpose: true,
        message: true,
        status: true,
        repCode: true,
      },
    });

    return NextResponse.json(logs);
  } catch (err: unknown) {
    console.error("Error fetching request logs:", err);
    const msg = err instanceof Error ? err.message : "Failed to fetch request logs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
