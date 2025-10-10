import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCodeAndGetRole } from "@/lib/joinCode";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

  // DEBUG: Log what we're checking
  console.log('🔍 Validating code:', code.trim());
  console.log('📅 Checking against codes:', {
    salesperson: validateCodeAndGetRole('__SALESPERSON__'),
    manager: validateCodeAndGetRole('__MANAGER__'),
    owner: validateCodeAndGetRole('__OWNER__'),
  });

  // Validate code and get role
  const role = validateCodeAndGetRole(code.trim());
  console.log('✅ Role found:', role);

  if (!role) {
    return NextResponse.json({ message: "Wrong or expired code" }, { status: 401 });
  }

  // Store the role in a cookie so we can assign it after Google OAuth
  cookies().set("join_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 min
    secure: process.env.NODE_ENV === "production",
  });

  cookies().set("join_role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 min
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true, role });
}