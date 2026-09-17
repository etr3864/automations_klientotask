import { fromHex, timingSafeEqual, toHex } from "@/lib/security/bytes"

export const AUTH_COOKIE = "winners_task_auth"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const SESSION_PAYLOAD = "winners-task-session-v1"

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  )
  return toHex(signature)
}

export async function createSessionToken(password: string): Promise<string> {
  return hmacHex(password, SESSION_PAYLOAD)
}

export async function isValidSessionToken(
  token: string,
  password: string,
): Promise<boolean> {
  if (!token || !password) return false
  try {
    const expected = await createSessionToken(password)
    return timingSafeEqual(fromHex(token), fromHex(expected))
  } catch {
    return false
  }
}

export async function passwordMatches(
  input: string,
  expected: string,
): Promise<boolean> {
  if (!input || !expected) return false
  const left = await hmacHex(input, "password-compare")
  const right = await hmacHex(expected, "password-compare")
  try {
    return timingSafeEqual(fromHex(left), fromHex(right))
  } catch {
    return false
  }
}
