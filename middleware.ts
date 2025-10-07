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

  // 2. Add /en prefix if missing
  if (!pathname.startsWith(`/${DEFAULT_LANG}`)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname}`;
    return NextResponse.redirect(url);
  }

  // 3. Auth check - Check for session cookie (database strategy)
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

  // 4. Authenticated users can't access marketing pages
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
