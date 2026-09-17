import { notifyDestinations, wasenderApiKey, wasenderUrl } from "@/lib/env"
import { logError, logInfo } from "@/lib/log"

const WHATSAPP_TEXT_LIMIT = 4096
const WASENDER_ENDPOINT = "https://www.wasenderapi.com/api/send-message"

export function isWhatsappConfigured(): boolean {
  return Boolean(wasenderApiKey() && notifyDestinations().length)
}

export function normalizeWhatsappTo(raw: string): string {
  const value = raw.trim().replace(/^["']+|["']+$/g, "")
  if (!value) return value
  if (value.includes("@")) return value

  const compact = value.replace(/[^\d+]/g, "")
  if (!compact) return ""
  if (compact.startsWith("+")) return compact
  if (compact.startsWith("00")) return `+${compact.slice(2)}`
  if (compact.startsWith("972")) return `+${compact}`
  if (compact.startsWith("0")) return `+972${compact.slice(1)}`
  return `+${compact}`
}

export function isValidWhatsappTo(to: string): boolean {
  if (to.endsWith("@g.us") || to.endsWith("@s.whatsapp.net") || to.endsWith("@newsletter")) {
    return true
  }
  if (to.startsWith("@")) return true
  return /^\+\d{8,15}$/.test(to)
}

export function chunkWhatsappText(text: string, max = WHATSAPP_TEXT_LIMIT): string[] {
  const cleaned = text.trim()
  if (!cleaned) return []
  if (cleaned.length <= max) return [cleaned]

  const parts: string[] = []
  let rest = cleaned
  while (rest.length > max) {
    const window = rest.slice(0, max)
    const breakAt = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(" "))
    const cut = breakAt >= max * 0.5 ? breakAt : max
    parts.push(rest.slice(0, cut).trimEnd())
    rest = rest.slice(cut).trimStart()
  }
  if (rest) parts.push(rest)
  return parts
}

function endpoint(): string {
  const url = wasenderUrl() || WASENDER_ENDPOINT
  return url.replace(/\/+$/, "")
}

async function postMessage(key: string, to: string, text: string, part: number, total: number): Promise<void> {
  const url = endpoint()
  logInfo("wasender_request", {
    to,
    kind: to.endsWith("@g.us") ? "group" : "direct",
    part,
    total,
    textLength: text.length,
    url,
  })

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ to, text }),
  })
  const raw = await res.text()
  let parsed: { success?: boolean; message?: string; data?: { msgId?: number; jid?: string; status?: string } } = {}
  try {
    parsed = JSON.parse(raw) as typeof parsed
  } catch {
    parsed = {}
  }

  if (!res.ok || parsed.success === false) {
    logError("wasender_failed", {
      to,
      status: res.status,
      success: parsed.success ?? false,
      message: parsed.message ?? raw.slice(0, 300),
    })
    return
  }

  logInfo("wasender_sent", {
    to,
    msgId: parsed.data?.msgId ?? null,
    jid: parsed.data?.jid ?? to,
    status: parsed.data?.status ?? "ok",
    part,
    total,
  })
}

export async function sendWhatsapp(text: string): Promise<void> {
  const key = wasenderApiKey()
  const destinations = notifyDestinations()
    .map(normalizeWhatsappTo)
    .filter((to) => {
      if (isValidWhatsappTo(to)) return true
      logError("wasender_invalid_destination", { to })
      return false
    })

  if (!key) {
    logInfo("wasender_skipped", { reason: "missing_key" })
    return
  }
  if (!destinations.length) {
    logInfo("wasender_skipped", { reason: "missing_destination" })
    return
  }

  const chunks = chunkWhatsappText(text)
  if (!chunks.length) {
    logInfo("wasender_skipped", { reason: "empty_text" })
    return
  }

  logInfo("wasender_start", {
    destinations,
    chunks: chunks.length,
    textLength: text.length,
  })

  for (const to of destinations) {
    for (const [index, chunk] of chunks.entries()) {
      await postMessage(key, to, chunk, index + 1, chunks.length)
    }
  }
}

export async function notifyKaliFailure(body: string): Promise<void> {
  if (!isWhatsappConfigured()) return
  try {
    await sendWhatsapp(`לא נפתחה משימה בקאלי. הטופס נשמר אצל הקמפיינר.\n\n${body}`)
  } catch (error) {
    logError("wasender_failure_notify_failed", { error })
  }
}
