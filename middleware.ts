import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthed = !!token?.id;
  const url = req.nextUrl;

  const publicPaths = [
    "/",
    "/en/auth/login",
    "/en/auth/join",
    "/en/auth/verify-email",
    "/en/auth/reset-password",
    "/en/auth/complete-signup",
    "/api/health",
    "/api/auth",
    "/api/join",
    "/apply",
    "/demo-trailer-card",
    "/particle-demo",
    "/fire-demo",
    "/fire-badge-demo",
    "/playground",
    "/test-pdf",
    "/test/firebase-check"
  ];

  const isPublic = publicPaths.some(p => url.pathname.startsWith(p));

  if (!isAuthed && !isPublic) {
    url.pathname = "/en/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:js|css|svg|png|jpg|jpeg|webp|ico|txt)).*)"],
};
