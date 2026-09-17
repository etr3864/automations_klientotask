import { kaliAssigneeId } from "@/lib/env"
import { jsonError } from "@/lib/http/json"
import { createKaliTask } from "@/lib/kali/create-task"
import { logError, logInfo } from "@/lib/log"
import { clientKey, tooManyRequests } from "@/lib/security/rate-limit"
import { looksLikePasswordDump } from "@/lib/text/clean"
import { toIso8601Jerusalem } from "@/lib/datetime/jerusalem"
import { buildDescription, buildTitle, buildWhatsappText } from "@/lib/tasks/format"
import { priorityFromDeadline } from "@/lib/tasks/priority"
import { parseAnalysis, parseSnapshot } from "@/lib/tasks/validate"
import { notifyKaliFailure, sendWhatsapp } from "@/lib/whatsapp/send"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: Request) {
  if (tooManyRequests(`submit:${clientKey(req)}`, 12, 10 * 60 * 1000)) {
    logInfo("submit_rate_limited")
    return jsonError("יותר מדי שליחות. נסו שוב בעוד כמה דקות.", 429)
  }

  try {
    const body = await req.json()
    const snapshot = parseSnapshot(body.snapshot ?? body)
    const analysis = parseAnalysis(body.analysis)
    const due = new Date(snapshot.deadlineIso)
    const title = buildTitle(snapshot)

    logInfo("submit_start", {
      opener: snapshot.opener,
      taskType: snapshot.taskType,
      deadlineIso: snapshot.deadlineIso,
      checkFailed: Boolean(analysis?.checkFailed),
    })

    if (looksLikePasswordDump(`${snapshot.needToDo}\n${JSON.stringify(snapshot.fields)}`)) {
      snapshot.campaignerNote = [snapshot.campaignerNote, "הופיע טקסט שנראה כמו סיסמה. הסיסמה לא צריכה להיות בטופס."]
        .filter(Boolean)
        .join("\n")
    }

    const description = buildDescription(snapshot, analysis, due)

    try {
      const task = await createKaliTask({
        title,
        description,
        assigneeId: kaliAssigneeId(),
        priority: priorityFromDeadline(due),
        dueDate: toIso8601Jerusalem(due),
      })

      logInfo("submit_kali_ok", { taskId: task.id, title: task.title })

      try {
        await sendWhatsapp(buildWhatsappText(snapshot, due, analysis, task))
        logInfo("submit_whatsapp_done", { taskId: task.id })
      } catch (error) {
        logError("submit_whatsapp_failed", { taskId: task.id, error })
      }

      logInfo("submit_ok", { taskId: task.id })
      return Response.json({
        ok: true,
        task,
      })
    } catch (error) {
      logError("submit_kali_failed", { title, error })
      void notifyKaliFailure(`${title}\n\n${description}`)
      return jsonError("לא הצלחנו לפתוח את המשימה, נסו שוב", 502)
    }
  } catch (error) {
    logError("submit_invalid", { error })
    const message = error instanceof Error ? error.message : "בקשה לא תקינה"
    return jsonError(message)
  }
}
