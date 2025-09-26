import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && (pathname === "/" || pathname === "/en")) {
    return NextResponse.redirect(new URL("/en/dashboard", req.url));
  }
  if (!token && pathname.startsWith("/en/dashboard")) {
    return NextResponse.redirect(new URL("/en/auth/login", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/", "/en", "/en/:path*"] };
