import { openaiApiKey, openaiModel } from "@/lib/env"
import { withoutEmDash } from "@/lib/text/clean"

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"

export async function completeJson<T>(
  system: string,
  user: string,
  timeoutMs: number,
): Promise<T> {
  const key = openaiApiKey()
  if (!key) {
    throw new Error("missing-openai")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openaiModel(),
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`openai ${res.status}`)
    }

    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = body.choices?.[0]?.message?.content
    if (!content) {
      throw new Error("openai empty")
    }
    return JSON.parse(withoutEmDash(content)) as T
  } finally {
    clearTimeout(timer)
  }
}
