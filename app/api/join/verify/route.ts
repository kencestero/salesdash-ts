import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/join-code";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  const { code } = await req.json();
  const secret = process.env.ACCESS_JOIN_SECRET || "";
  if (!secret || !code || !verifyCode(secret, code)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const jwtSecret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ join: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(jwtSecret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("join_ok", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 2,
  });
  return res;
}