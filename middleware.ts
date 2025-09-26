import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";

async function hasJoinCookie(req: NextRequest) {
  const joinCookie = req.cookies.get("join_ok")?.value;
  if (!joinCookie) return false;
  try {
    await jwtVerify(
      joinCookie,
      new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
    );
    return true;
  } catch { 
    return false; 
  }
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && (pathname === "/" || pathname === "/en")) {
    return NextResponse.redirect(new URL("/en/dashboard", req.url));
  }
  
  if (pathname.startsWith("/en/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/en/auth/login", req.url));
    const ok = await hasJoinCookie(req);
    if (!ok) return NextResponse.redirect(new URL("/en/auth/register", req.url));
  }
  
  return NextResponse.next();
}
export const config = { matcher: ["/", "/en", "/en/:path*"] };
