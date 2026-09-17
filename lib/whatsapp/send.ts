import { notifyPhones, wasenderApiKey, wasenderUrl } from "@/lib/env"

export async function sendWhatsapp(text: string): Promise<void> {
  const key = wasenderApiKey()
  const phones = notifyPhones()
  if (!key || !phones.length) {
    console.warn("whatsapp skipped: missing key or phones")
    return
  }

  const results = await Promise.allSettled(
    phones.map(async (to) => {
      const res = await fetch(wasenderUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, text }),
      })
      if (!res.ok) {
        throw new Error(`wasender ${res.status}`)
      }
    }),
  )

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("whatsapp failed", result.reason)
    }
  }
}

export async function notifyKaliFailure(body: string): Promise<void> {
  try {
    await sendWhatsapp(`לא נפתחה משימה בקאלי. הטופס נשמר אצל הקמפיינר.\n\n${body}`)
  } catch (error) {
    console.error("failure notify failed", error)
  }
}
