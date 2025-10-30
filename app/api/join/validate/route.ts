import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCodeAndGetRole } from "@/lib/joinCode";
import { checkRateLimit, resetRateLimit, sendRateLimitAlert } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // TEMPORARY: Manual override for testing
  const testCodes: Record<string, string> = {
    'OWNER1': 'owner',
    'MGR001': 'manager',
    'REP001': 'salesperson'
  };

  let role = validateCodeAndGetRole(code);

  // If normal validation fails, check test codes
  if (!role && testCodes[code.toUpperCase()]) {
    role = testCodes[code.toUpperCase()];
    console.log('✅ Using test code:', code, '→', role);
  }

  if (!role) {
    console.log(`❌ Invalid code attempt from IP: ${ip} (${rateLimit.remaining} attempts remaining)`);
    return NextResponse.json({
      message: "Wrong or expired code",
      attemptsRemaining: rateLimit.remaining
    }, { status: 401 });
  }

  // SUCCESS - Reset rate limit for this IP
  console.log(`✅ Valid code from IP: ${ip} - Resetting rate limit`);
  resetRateLimit(ip);

  // Store the role in a cookie so we can assign it after Google OAuth
  cookies().set("join_ok", "1", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === 'production',
  });

  cookies().set("join_role", role, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.json({ ok: true, role });
}