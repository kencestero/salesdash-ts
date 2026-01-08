import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Handle root and /en redirects FIRST (before auth check)
  if (url.pathname === "/" || url.pathname === "/en") {
    url.pathname = "/en/auth/login";
    return NextResponse.redirect(url, 307);
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthed = !!token?.id;

  const publicPaths = [
    "/en/auth",
    "/auth",
    "/session-expired",
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

  const isPublic = publicPaths.some((p) => url.pathname.startsWith(p));

  if (!isAuthed && !isPublic) {
    url.pathname = "/en/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*|sitemap\\.xml|robots\\.txt|favicon\\.ico).*)",
  ],
};
