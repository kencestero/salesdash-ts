import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { todayCode } from "@/lib/joinCode";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });

  if (code.trim().toUpperCase() !== todayCode()) {
    return NextResponse.json({ message: "Wrong or expired code" }, { status: 401 });
  }

  // mark session pre-auth
  cookies().set("join_ok", "1", {
    httpOnly: true, 
    sameSite: "lax", 
    path: "/", 
    maxAge: 60 * 15, // 15 min
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true });
}