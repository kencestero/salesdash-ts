/**
 * Payplan Guard - Server-side enforcement for API routes
 *
 * Use this helper in protected API routes to enforce:
 * 1. Account not disabled
 * 2. Payplan accepted
 *
 * This prevents bypass via direct API calls.
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface PayplanGuardResult {
  allowed: boolean;
  response?: NextResponse;
  profile?: {
    accountStatus: string | null;
    payplanStatus: string;
  };
}

/**
 * Check if a user is allowed to access protected resources
 *
 * @param userId - The user's ID
 * @returns PayplanGuardResult with allowed status and optional error response
 */
export async function checkPayplanAccess(userId: string): Promise<PayplanGuardResult> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        accountStatus: true,
        payplanStatus: true,
      },
    });

    if (!profile) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        ),
      };
    }

    const { accountStatus, payplanStatus } = profile;

    // Check if account is disabled (accountStatus starts with "disabled_")
    if (accountStatus?.startsWith("disabled_")) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Account disabled", code: "ACCOUNT_DISABLED" },
          { status: 403 }
        ),
        profile: { accountStatus, payplanStatus },
      };
    }

    // Check if account is banned
    if (accountStatus === "banned") {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Account banned", code: "ACCOUNT_BANNED" },
          { status: 403 }
        ),
        profile: { accountStatus, payplanStatus },
      };
    }

    // Check if payplan needs to be accepted
    if (payplanStatus !== "ACCEPTED") {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Payplan acceptance required", code: "PAYPLAN_REQUIRED" },
          { status: 403 }
        ),
        profile: { accountStatus, payplanStatus },
      };
    }

    // All checks passed
    return {
      allowed: true,
      profile: { accountStatus, payplanStatus },
    };
  } catch (error) {
    console.error("Payplan guard check failed:", error);
    // Fail open to avoid blocking all users on error
    return { allowed: true };
  }
}

/**
 * Quick check helper that returns just the response if access is denied
 * Use in API routes like:
 *
 * const guardResponse = await guardPayplanAccess(currentUser.id);
 * if (guardResponse) return guardResponse;
 */
export async function guardPayplanAccess(userId: string): Promise<NextResponse | null> {
  const result = await checkPayplanAccess(userId);
  return result.allowed ? null : result.response || null;
}
