import { TASK_TYPES } from "@/lib/tasks/catalog"
import type { AnalyzeResult, FormSnapshot, TaskTypeId } from "@/lib/tasks/types"

const TASK_IDS = new Set(TASK_TYPES.map((item) => item.id))

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function parseSnapshot(input: unknown): FormSnapshot {
  if (!isRecord(input)) {
    throw new Error("גוף הבקשה לא תקין")
  }

  const taskType = String(input.taskType ?? "") as TaskTypeId
  if (!TASK_IDS.has(taskType)) {
    throw new Error("סוג משימה לא תקין")
  }

  const opener = String(input.opener ?? "").trim()
  const deadlineIso = String(input.deadlineIso ?? "").trim()
  const needToDo = String(input.needToDo ?? "")
  const campaignerNote = String(input.campaignerNote ?? "")
  const fieldsRaw = isRecord(input.fields) ? input.fields : {}
  const fields: Record<string, string | boolean> = {}

  for (const [key, value] of Object.entries(fieldsRaw)) {
    if (typeof value === "boolean") fields[key] = value
    else if (typeof value === "string") fields[key] = value
    else if (value == null) fields[key] = ""
    else fields[key] = String(value)
  }

  if (!opener) throw new Error("חסר מי פותח")
  if (!deadlineIso) throw new Error("חסר דדליין")
  const due = new Date(deadlineIso)
  if (Number.isNaN(due.getTime())) throw new Error("דדליין לא תקין")

  return {
    opener,
    taskType,
    deadlineIso,
    needToDo,
    campaignerNote,
    fields,
  }
}

export function parseAnalysis(input: unknown): AnalyzeResult | null {
  if (input == null) return null
  if (!isRecord(input)) return null
  const missing = Array.isArray(input.missing) ? input.missing : []
  const warnings = Array.isArray(input.warnings) ? input.warnings : []
  return {
    summary: String(input.summary ?? ""),
    warnings: warnings.map((item) => String(item)),
    checkFailed: Boolean(input.checkFailed),
    missing: missing
      .filter(isRecord)
      .map((item) => ({
        field: String(item.field ?? ""),
        label: String(item.label ?? ""),
        why: String(item.why ?? ""),
        where: item.where ? String(item.where) : undefined,
      })),
  }
}
