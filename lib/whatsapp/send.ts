import { notifyDestinations, wasenderApiKey, wasenderUrl } from "@/lib/env"

const WHATSAPP_TEXT_LIMIT = 4096

export function isWhatsappConfigured(): boolean {
  return Boolean(wasenderApiKey() && notifyDestinations().length)
}

export function normalizeWhatsappTo(raw: string): string {
  const value = raw.trim()
  if (!value) return value
  if (value.includes("@")) return value

  const compact = value.replace(/[^\d+]/g, "")
  if (compact.startsWith("+")) return compact
  if (compact.startsWith("00")) return `+${compact.slice(2)}`
  if (compact.startsWith("972")) return `+${compact}`
  if (compact.startsWith("0")) return `+972${compact.slice(1)}`
  return `+${compact}`
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

async function postMessage(key: string, to: string, text: string): Promise<void> {
  const res = await fetch(wasenderUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, text }),
  })
  const raw = await res.text()
  if (!res.ok) {
    console.error("wasender failed", res.status, raw.slice(0, 300))
    return
  }
  console.info("wasender sent", to)
}

export async function sendWhatsapp(text: string): Promise<void> {
  const key = wasenderApiKey()
  const destinations = notifyDestinations().map(normalizeWhatsappTo).filter(Boolean)
  if (!key || !destinations.length) {
    console.info("wasender skipped: missing key or destination")
    return
  }

  const chunks = chunkWhatsappText(text)
  if (!chunks.length) return

  for (const to of destinations) {
    for (const chunk of chunks) {
      await postMessage(key, to, chunk)
    }
  }
}

export async function notifyKaliFailure(body: string): Promise<void> {
  if (!isWhatsappConfigured()) return
  try {
    await sendWhatsapp(`לא נפתחה משימה בקאלי. הטופס נשמר אצל הקמפיינר.\n\n${body}`)
  } catch (error) {
    console.error("wasender failure notify failed", error)
  }
}
