import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session"

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

export { AUTH_COOKIE }
