import { NextRequest, NextResponse } from "next/server";
import { validateDailyCode } from "@/lib/daily-code";

// POST /api/onboarding/validate-code - Validate an invite code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code is required" },
        { status: 400 }
      );
    }

    // Validate with grace period (accepts yesterday's code too)
    const isValid = validateDailyCode(code, true);

    return NextResponse.json({
      valid: isValid,
      error: isValid ? null : "Invalid or expired invite code",
    });
  } catch (error) {
    console.error("Error validating code:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
