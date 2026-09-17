import { jsonError } from "@/lib/http/json"
import { logError, logInfo } from "@/lib/log"
import { parseDeadlineText } from "@/lib/openai/parse-deadline"
import { clientKey, tooManyRequests } from "@/lib/security/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 15

export async function POST(req: Request) {
  if (tooManyRequests(`deadline:${clientKey(req)}`, 40, 10 * 60 * 1000)) {
    logInfo("deadline_rate_limited")
    return jsonError("יותר מדי ניסיונות. נסו שוב בעוד רגע.", 429)
  }

  try {
    const body = (await req.json()) as { text?: string }
    const text = String(body.text ?? "").trim()
    if (!text) {
      return jsonError("כתבו דדליין בשפה חופשית")
    }
    const parsed = await parseDeadlineText(text, new Date())
    logInfo("deadline_parsed", {
      understood: parsed.understood,
      missingTime: parsed.missingTime,
    })
    return Response.json(parsed)
  } catch (error) {
    logError("deadline_failed", { error })
    return jsonError("לא הצלחנו להבין את התאריך. בחרו מהיומן.", 422)
  }
}
