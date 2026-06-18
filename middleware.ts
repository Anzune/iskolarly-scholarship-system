import { NextResponse, type NextRequest } from "next/server"

const COOKIE_NAME = "iskolarly_session"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = Boolean(req.cookies.get(COOKIE_NAME)?.value)

  if (hasSession) return NextResponse.next()

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
  if (pathname.startsWith("/superadmin")) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/superadmin/:path*"],
}
