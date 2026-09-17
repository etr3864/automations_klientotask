import { completeJson } from "@/lib/openai/complete-json"
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/openai/prompts"
import { taskTypeById } from "@/lib/tasks/catalog"
import type { AnalyzeResult, FormSnapshot } from "@/lib/tasks/types"
import { withoutEmDash } from "@/lib/text/clean"

const EMPTY: AnalyzeResult = { missing: [], warnings: [], summary: "" }

export async function analyzeSnapshot(
  snapshot: FormSnapshot,
): Promise<AnalyzeResult> {
  const type = taskTypeById(snapshot.taskType)
  const user = JSON.stringify(
    {
      opener: snapshot.opener,
      taskType: type.label,
      deadlineIso: snapshot.deadlineIso,
      needToDo: snapshot.needToDo,
      campaignerNote: snapshot.campaignerNote,
      fields: snapshot.fields,
    },
    null,
    2,
  )

  const result = await completeJson<AnalyzeResult>(
    ANALYZE_SYSTEM_PROMPT,
    user,
    5000,
  )

  return {
    missing: Array.isArray(result.missing)
      ? result.missing.map((item) => ({
          field: withoutEmDash(item.field ?? ""),
          label: withoutEmDash(item.label ?? ""),
          why: withoutEmDash(item.why ?? ""),
          where: item.where ? withoutEmDash(item.where) : undefined,
        }))
      : [],
    warnings: Array.isArray(result.warnings)
      ? result.warnings.map((item) => withoutEmDash(String(item)))
      : [],
    summary: withoutEmDash(result.summary ?? type.shortLabel),
  }
}

export function emptyAnalysis(checkFailed = false): AnalyzeResult {
  return { ...EMPTY, checkFailed }
}
