import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCodeAndGetRole } from "@/lib/joinCode";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

  // TEMPORARY: Accept any 6-character code for testing
  const testCode = code.trim().toUpperCase();
  let role = "salesperson"; // Default for testing

  if (testCode.length !== 6) {
    return NextResponse.json({ message: "Code must be 6 characters" }, { status: 401 });
  }

  // Still try to validate normally
  const validRole = validateCodeAndGetRole(testCode);
  if (validRole) {
    role = validRole;
  }

  console.log('✅ Accepting code for testing:', testCode, 'Role:', role);

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