import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: { id: true, resetTokenExpiry: true },
    });

    if (!user || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
