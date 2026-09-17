import { emptyAnalysis, analyzeSnapshot } from "@/lib/openai/analyze-task"
import { jsonError } from "@/lib/http/json"
import { logError, logInfo } from "@/lib/log"
import { clientKey, tooManyRequests } from "@/lib/security/rate-limit"
import { parseSnapshot } from "@/lib/tasks/validate"

export const runtime = "nodejs"
export const maxDuration = 15

export async function POST(req: Request) {
  if (tooManyRequests(`analyze:${clientKey(req)}`, 30, 10 * 60 * 1000)) {
    logInfo("analyze_rate_limited")
    return jsonError("יותר מדי בדיקות. נסו שוב בעוד רגע.", 429)
  }

  try {
    const body = await req.json()
    const snapshot = parseSnapshot(body)
    logInfo("analyze_start", {
      opener: snapshot.opener,
      taskType: snapshot.taskType,
    })
    try {
      const analysis = await analyzeSnapshot(snapshot)
      logInfo("analyze_ok", {
        missing: analysis.missing.length,
        warnings: analysis.warnings.length,
      })
      return Response.json({ analysis, skipped: false })
    } catch (error) {
      logError("analyze_skipped", { error })
      return Response.json({
        analysis: emptyAnalysis(true),
        skipped: true,
      })
    }
  } catch (error) {
    logError("analyze_invalid", { error })
    const message = error instanceof Error ? error.message : "בקשה לא תקינה"
    return jsonError(message)
  }
}
