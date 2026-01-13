import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCodeAndGetRole, getAllTodayCodes } from "@/lib/joinCode";
import { checkRateLimit, resetRateLimit, sendRateLimitAlert } from "@/lib/rate-limiter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Validate a one-time signup code from the onboarding flow
 * Returns the role and marks the code as used
 */
async function validateSignupCode(code: string): Promise<{ valid: boolean; role?: string; signupCodeId?: string }> {
  try {
    // Find the signup code (case-insensitive)
    const signupCode = await prisma.signupCode.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!signupCode) {
      return { valid: false };
    }

    // Check if already used
    if (signupCode.used) {
      console.log('⚠️ Signup code already used:', code.substring(0, 2) + '***');
      return { valid: false };
    }

    // Check if expired (24 hours)
    if (new Date() > signupCode.expiresAt) {
      console.log('⚠️ Signup code expired:', code.substring(0, 2) + '***');
      return { valid: false };
    }

    // Valid code - return it (will be marked as used after account creation)
    return {
      valid: true,
      role: 'salesperson', // One-time signup codes always create salesperson accounts
      signupCodeId: signupCode.id,
    };
  } catch (error) {
    console.error('Error validating signup code:', error);
    return { valid: false };
  }
}

export async function POST(req: Request) {
  // Get IP address for rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
             req.headers.get("x-real-ip") ||
             "unknown";

  console.log('🔐 Secret code validation attempt from IP:', ip);

  // Check rate limit BEFORE processing
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    console.log(`🚫 Rate limit exceeded for IP: ${ip}`);

    // Send alert email to Kenneth & Matt (only when first blocked)
    if (rateLimit.blockedUntil) {
      await sendRateLimitAlert(ip, 7); // They hit the 7 attempt limit
    }

    return NextResponse.json(
      {
        message: rateLimit.message || "Too many attempts. Please try again later.",
        blockedUntil: rateLimit.blockedUntil
      },
      { status: 429 } // 429 Too Many Requests
    );
  }

  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

  // Mask code in production (first 2 chars + ***)
  const maskedCode = process.env.NODE_ENV === 'production'
    ? code.substring(0, 2) + '***'
    : code;

  // DEBUG LOGGING - Remove after testing
  const nowNY = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const expectedCodes = getAllTodayCodes();
  console.log('[REG-SECRET] Server time (NY):', nowNY);
  console.log('[REG-SECRET] Expected codes:', expectedCodes);
  console.log('[REG-SECRET] Entered code:', maskedCode);

  // TEMPORARY: Manual override for testing
  const testCodes: Record<string, string> = {
    'OWNER1': 'owner',
    'MGR001': 'manager',
    'REP001': 'salesperson'
  };

  let role = validateCodeAndGetRole(code);
  let signupCodeId: string | undefined;

  // If normal validation fails, check test codes
  if (!role && testCodes[code.toUpperCase()]) {
    role = testCodes[code.toUpperCase()];
    console.log('✅ Using test code:', maskedCode, '→', role);
  }

  // If still no role, check if it's a valid one-time signup code (from onboarding flow)
  if (!role) {
    const signupResult = await validateSignupCode(code);
    if (signupResult.valid) {
      role = signupResult.role;
      signupCodeId = signupResult.signupCodeId;
      console.log('✅ Using one-time signup code:', maskedCode, '→', role);
    }
  }

  if (!role) {
    console.log(`❌ Invalid code attempt from IP: ${ip} (${rateLimit.remaining} attempts remaining)`);
    return NextResponse.json({
      message: "Wrong or expired code",
      attemptsRemaining: rateLimit.remaining
    }, { status: 401 });
  }

  // If using a one-time signup code, mark it as used NOW
  // This prevents the code from being reused even if registration fails
  if (signupCodeId) {
    try {
      await prisma.signupCode.update({
        where: { id: signupCodeId },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });
      console.log('🔒 Signup code marked as used:', maskedCode);
    } catch (error) {
      console.error('Failed to mark signup code as used:', error);
      // Continue anyway - the code was valid
    }
  }

  // SUCCESS - Reset rate limit for this IP
  console.log(`✅ Valid code from IP: ${ip} - Resetting rate limit`);
  resetRateLimit(ip);

  // Store the role in a cookie so we can assign it after Google OAuth
  (await cookies()).set("join_ok", "1", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === 'production',
  });

  (await cookies()).set("join_role", role, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true, role });
}