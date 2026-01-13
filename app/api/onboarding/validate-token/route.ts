import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/onboarding/validate-token
 * Validates an entry token for onboarding access
 * Public endpoint - no auth required
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Find the token
    const onboardingToken = await prisma.onboardingToken.findUnique({
      where: { token },
    });

    // Token doesn't exist
    if (!onboardingToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 404 }
      );
    }

    // Token already used
    if (onboardingToken.used) {
      return NextResponse.json(
        { valid: false, error: "This link has already been used" },
        { status: 410 } // Gone
      );
    }

    // Token expired (24 hours)
    if (new Date() > onboardingToken.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This link has expired" },
        { status: 410 } // Gone
      );
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      type: onboardingToken.type,
      expiresAt: onboardingToken.expiresAt,
    });
  } catch (error) {
    console.error("Failed to validate onboarding token:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate token" },
      { status: 500 }
    );
  }
}
