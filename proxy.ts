import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE } from "@/lib/auth/cookie"
import { isValidSessionToken } from "@/lib/auth/session"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const password = process.env.APP_PASSWORD ?? ""
  const token = req.cookies.get(AUTH_COOKIE)?.value ?? ""
  const valid = password ? await isValidSessionToken(token, password) : false

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth/login")) {
    if (valid && pathname === "/login") {
      const next = req.nextUrl.searchParams.get("next") || "/"
      return NextResponse.redirect(new URL(next, req.url))
    }
    return NextResponse.next()
  }

  if (valid) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "נדרשת כניסה" }, { status: 401 })
  }

  const login = new URL("/login", req.url)
  login.searchParams.set("next", pathname)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
