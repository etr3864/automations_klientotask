import { notifyPhones, wasenderApiKey, wasenderUrl } from "@/lib/env"

export function isWhatsappConfigured(): boolean {
  return Boolean(wasenderApiKey() && notifyPhones().length)
}

export async function sendWhatsapp(text: string): Promise<void> {
  const key = wasenderApiKey()
  const phones = notifyPhones()
  if (!key || !phones.length) return

  try {
    await Promise.all(
      phones.map(async (to) => {
        await fetch(wasenderUrl(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to, text }),
        })
      }),
    )
  } catch {
    // Optional channel. Kali is the source of truth.
  }
}

export async function notifyKaliFailure(body: string): Promise<void> {
  if (!isWhatsappConfigured()) return
  await sendWhatsapp(`לא נפתחה משימה בקאלי. הטופס נשמר אצל הקמפיינר.\n\n${body}`)
}
