import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Only protect admin routes for now
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = req.cookies.get("next-auth.session-token") || 
                  req.cookies.get("__Secure-next-auth.session-token")
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*"
  ]
}