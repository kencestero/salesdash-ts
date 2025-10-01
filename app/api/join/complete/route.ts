import { NextResponse } from "next/server";

function validCode(input: string) {
  const list = (process.env.JOIN_CODES || process.env.INVITE_CODE || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.includes(input);
}

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));

  if (!code || !validCode(code)) {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // This cookie is read in your NextAuth jwt() callback (token.member)
  res.cookies.set("join_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes to finish sign-in
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
