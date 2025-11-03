import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LANG = "en";
const LOGIN = `/${DEFAULT_LANG}/login`;
const AUTH_PREFIX = `/${DEFAULT_LANG}/auth`;
const DASHBOARD = `/${DEFAULT_LANG}/dashboard`;

const ALLOW_STATIC = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images",
  "/icons",
  "/assets",
  "/public",
];

// Public demo pages (no auth required)
const PUBLIC_PAGES = [
  "/demo-trailer-card",
  "/particle-demo",
  "/fire-demo",
  "/fire-badge-demo",
  "/playground",
  "/apply", // Credit application pages - fully public
  "/test-pdf", // PDF test page
  "/test/firebase-check", // Firebase check page
];

// Optional: Block marketing pages once logged in
const MARKETING = new Set([
  `/${DEFAULT_LANG}/ecommerce`,
  `/${DEFAULT_LANG}/marketing`,
  `/${DEFAULT_LANG}/landing`,
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static files (skip middleware)
  if (ALLOW_STATIC.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Allow public demo pages (no auth required)
  if (PUBLIC_PAGES.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2.5. Redirect old auth pages to new login page
  if (pathname === "/auth/login") {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}/auth/login`;
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/auth/register") {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}/auth/register`;
    return NextResponse.redirect(url, 308);
  }

  // 3. Add /en prefix if missing (EXCEPT for /apply routes - they're at root)
  if (!pathname.startsWith(`/${DEFAULT_LANG}`) && !pathname.startsWith("/apply")) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3b. Also check PUBLIC_PAGES with /en prefix (after redirect)
  const pathnameWithoutLang = pathname.replace(`/${DEFAULT_LANG}`, '');
  if (PUBLIC_PAGES.some(path => pathnameWithoutLang.startsWith(path))) {
    return NextResponse.next();
  }

  // 4. Auth check - Check for session cookie (database strategy)
  const sessionToken = req.cookies.get("next-auth.session-token") ||
                       req.cookies.get("__Secure-next-auth.session-token");
  const isAuthRoute = pathname === LOGIN || pathname.startsWith(AUTH_PREFIX);

  if (!sessionToken) {
    if (!isAuthRoute) {
      const url = req.nextUrl.clone();
      url.pathname = LOGIN;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4b. Check if authenticated user needs to complete signup
  const completeSignupPath = `/${DEFAULT_LANG}/auth/complete-signup`;
  if (sessionToken && pathname !== completeSignupPath && !isAuthRoute) {
    try {
      // Check if user profile has needsJoinCode flag
      const checkResponse = await fetch(`${req.nextUrl.origin}/api/auth/check-status`, {
        headers: {
          'Cookie': req.headers.get('cookie') || ''
        }
      });

      if (checkResponse.ok) {
        const { needsJoinCode } = await checkResponse.json();
        if (needsJoinCode) {
          const url = req.nextUrl.clone();
          url.pathname = completeSignupPath;
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error('Failed to check user status:', error);
      // Continue on error to avoid blocking legitimate users
    }
  }

  // 5. Authenticated users can't access marketing pages
  if (MARKETING.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = DASHBOARD;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match everything under / except API and static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
