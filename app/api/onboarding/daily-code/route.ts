import { NextRequest, NextResponse } from "next/server";
import { getTodayCode, getNextResetTime, getTimeUntilReset } from "@/lib/daily-code";

// GET /api/onboarding/daily-code - Get today's invite code
export async function GET(req: NextRequest) {
  try {
    const code = getTodayCode();
    const expiresAt = getNextResetTime().toISOString();
    const timeUntilReset = getTimeUntilReset();

    return NextResponse.json({
      code,
      expiresAt,
      timeUntilReset,
    });
  } catch (error) {
    console.error("Error generating daily code:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
