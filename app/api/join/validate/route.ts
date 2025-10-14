import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCodeAndGetRole } from "@/lib/joinCode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
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
    return NextResponse.json({ message: "Wrong or expired code" }, { status: 401 });
  }

  // Store the role in a cookie so we can assign it after Google OAuth
  // Using sameSite: "none" to ensure cookies persist through OAuth redirects
  cookies().set("join_ok", "1", {
    httpOnly: true,
    sameSite: "none", // Changed from "lax" to work with cross-site OAuth redirects
    path: "/",
    maxAge: 60 * 15, // 15 min
    secure: true, // Required when sameSite="none"
  });

  cookies().set("join_role", role, {
    httpOnly: true,
    sameSite: "none", // Changed from "lax" to work with cross-site OAuth redirects
    path: "/",
    maxAge: 60 * 15, // 15 min
    secure: true, // Required when sameSite="none"
  });

  return NextResponse.json({ ok: true, role });
}