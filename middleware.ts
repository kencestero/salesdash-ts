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

  // Paths that should NOT get /en prefix (they exist at root level)
  const rootLevelPaths = [
    "/apply",
    "/demo-trailer-card",
    "/particle-demo",
    "/fire-demo",
    "/fire-badge-demo",
    "/playground",
    "/test-pdf",
    "/test/firebase-check",
    "/session-expired",
    "/credit-application",
    "/reply",
    "/onboarding", // Public onboarding flow (no auth required)
  ];

  // Add /en prefix to paths that don't have it (except root-level paths)
  const isRootLevel = rootLevelPaths.some((p) => url.pathname.startsWith(p));
  if (!url.pathname.startsWith("/en") && !isRootLevel && !url.pathname.startsWith("/api")) {
    url.pathname = `/en${url.pathname}`;
    return NextResponse.redirect(url);
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthed = !!token?.id;

  // Public paths - no auth required
  const publicPaths = [
    "/en/auth",
    "/auth",
    "/session-expired",
    "/api/health",
    "/api/auth",
    "/api/join",
    "/api/onboarding", // Daily code API
    "/apply",
    "/demo-trailer-card",
    "/particle-demo",
    "/fire-demo",
    "/fire-badge-demo",
    "/playground",
    "/test-pdf",
    "/test/firebase-check",
    "/credit-application",
    "/reply",
    "/onboarding", // Public onboarding flow
  ];

  const isPublic = publicPaths.some((p) => url.pathname.startsWith(p));

  if (!isAuthed && !isPublic) {
    url.pathname = "/en/auth/login";
    return NextResponse.redirect(url);
  }

  // PAYPLAN ENFORCEMENT DISABLED - Re-enable when admin-configurable payplan system is ready
  // const payplanBypassPaths = [
  //   "/en/auth/payplan",
  //   "/en/auth/account-disabled",
  //   "/en/auth/login",
  //   "/en/auth/logout",
  //   "/en/auth/join",
  //   "/api/auth/",
  //   "/api/contractor-docs/upload",
  // ];
  // const bypassesPayplanCheck = payplanBypassPaths.some((p) => url.pathname.startsWith(p));
  // if (isAuthed && !isPublic && !bypassesPayplanCheck) { ... }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*|sitemap\\.xml|robots\\.txt|favicon\\.ico).*)",
  ],
};
