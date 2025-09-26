import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow auth pages
  if (pathname.startsWith("/en/auth")) return NextResponse.next();
  
  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  
  // Redirect root to dashboard if logged in
  if (token && (pathname === "/" || pathname === "/en")) {
    return NextResponse.redirect(new URL("/en/dashboard", req.url));
  }
  
  // Check for dashboard access
  if (pathname.startsWith("/en/dashboard") || pathname.startsWith("/en/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/en/auth/register", req.url));
    }
    
    // Check if user has member access via JWT token
    const member = (token as any).member === true;
    if (!member) {
      const url = new URL("/en/auth/register", req.url);
      url.searchParams.set("error", "NO_ACCESS");
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}
export const config = { matcher: ["/", "/en", "/en/:path*"] };
