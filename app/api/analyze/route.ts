import { emptyAnalysis, analyzeSnapshot } from "@/lib/openai/analyze-task"
import { jsonError } from "@/lib/http/json"
import { clientKey, tooManyRequests } from "@/lib/security/rate-limit"
import { parseSnapshot } from "@/lib/tasks/validate"

export const runtime = "nodejs"
export const maxDuration = 15

export async function POST(req: Request) {
  if (tooManyRequests(`analyze:${clientKey(req)}`, 30, 10 * 60 * 1000)) {
    return jsonError("יותר מדי בדיקות. נסו שוב בעוד רגע.", 429)
  }

  try {
    const body = await req.json()
    const snapshot = parseSnapshot(body)
    try {
      const analysis = await analyzeSnapshot(snapshot)
      return Response.json({ analysis, skipped: false })
    } catch {
      return Response.json({
        analysis: emptyAnalysis(true),
        skipped: true,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "בקשה לא תקינה"
    return jsonError(message)
  }
}
