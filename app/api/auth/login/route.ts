import { NextResponse } from "next/server"
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/cookie"
import { createSessionToken, passwordMatches } from "@/lib/auth/session"
import { appPassword } from "@/lib/env"
import { jsonError } from "@/lib/http/json"
import { logError, logInfo } from "@/lib/log"
import { clientKey, tooManyRequests } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

export async function POST(req: Request) {
  if (tooManyRequests(`login:${clientKey(req)}`, 8, 10 * 60 * 1000)) {
    logInfo("login_rate_limited")
    return jsonError("יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.", 429)
  }

  let password = ""
  try {
    const body = (await req.json()) as { password?: string }
    password = String(body.password ?? "")
  } catch {
    return jsonError("בקשה לא תקינה")
  }

  let expected = ""
  try {
    expected = appPassword()
  } catch (error) {
    logError("login_server_misconfigured", { error })
    return jsonError("השרת לא מוגדר", 500)
  }
  if (!(await passwordMatches(password, expected))) {
    logInfo("login_rejected")
    return jsonError("הסיסמה לא נכונה", 401)
  }

  const token = await createSessionToken(expected)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions())
  logInfo("login_ok")
  return res
}
