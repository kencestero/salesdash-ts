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

  // Public paths - no auth required
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

  // Paths that bypass payplan/disabled check (avoid redirect loops)
  // These are allowed even if payplan not accepted or account disabled
  const payplanBypassPaths = [
    "/en/auth/payplan",
    "/en/auth/account-disabled",
    "/en/auth/login",
    "/en/auth/logout",
    "/en/auth/join",
    "/api/auth/",
    "/api/contractor-docs/upload", // Allow contractor doc upload before full access
  ];

  const bypassesPayplanCheck = payplanBypassPaths.some((p) => url.pathname.startsWith(p));

  // For authenticated users on protected routes, check payplan/disabled status
  if (isAuthed && !isPublic && !bypassesPayplanCheck) {
    try {
      // Build the check-status URL
      const checkStatusUrl = new URL("/api/auth/check-status", req.url);

      // Forward the cookies for auth
      const response = await fetch(checkStatusUrl.toString(), {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { accountStatus, payplanStatus } = data;

        // Check if account is disabled (accountStatus starts with "disabled_")
        if (accountStatus && accountStatus.startsWith("disabled_")) {
          url.pathname = "/en/auth/account-disabled";
          return NextResponse.redirect(url);
        }

        // Check if account is banned
        if (accountStatus === "banned") {
          url.pathname = "/en/auth/account-disabled";
          return NextResponse.redirect(url);
        }

        // Check if payplan needs to be accepted
        if (payplanStatus && payplanStatus !== "ACCEPTED") {
          url.pathname = "/en/auth/payplan";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // If check fails, allow through (fail open to avoid blocking all users)
      console.error("Payplan check failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*|sitemap\\.xml|robots\\.txt|favicon\\.ico).*)",
  ],
};
