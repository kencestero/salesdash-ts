import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

/**
 * POST /api/onboarding/generate-token
 * Generates a one-time entry token for rep onboarding
 * Only owners and directors can generate tokens
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with profile to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser || !currentUser.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only owners and directors can generate tokens
    if (!["owner", "director"].includes(currentUser.profile.role)) {
      return NextResponse.json(
        { error: "Only owners and directors can generate onboarding links" },
        { status: 403 }
      );
    }

    // Parse request body for optional type (default: "rep")
    let type = "rep";
    try {
      const body = await req.json();
      if (body.type && ["rep", "manager"].includes(body.type)) {
        type = body.type;
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Generate unique token (21 chars, URL-safe)
    const token = nanoid(21);

    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create the token in database
    const onboardingToken = await prisma.onboardingToken.create({
      data: {
        token,
        type,
        createdBy: currentUser.id,
        expiresAt,
      },
    });

    // Build the full URL - using clean path format that won't break in messages
    const baseUrl = process.env.NEXTAUTH_URL || "https://saleshub.remotivelogistics.com";
    const fullUrl = `${baseUrl}/join/${token}`;

    return NextResponse.json({
      success: true,
      token: onboardingToken.token,
      url: fullUrl,
      expiresAt: onboardingToken.expiresAt,
      type: onboardingToken.type,
    });
  } catch (error) {
    console.error("Failed to generate onboarding token:", error);
    return NextResponse.json(
      { error: "Failed to generate onboarding token" },
      { status: 500 }
    );
  }
}
