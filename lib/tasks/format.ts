import {
  formatTaskDescriptionDate,
} from "@/lib/datetime/jerusalem"
import { taskTypeById } from "@/lib/tasks/catalog"
import type { AnalyzeResult, FormSnapshot } from "@/lib/tasks/types"
import { clip, withoutEmDash } from "@/lib/text/clean"

function text(fields: FormSnapshot["fields"], key: string): string {
  const value = fields[key]
  return typeof value === "string" ? value.trim() : ""
}

function flag(fields: FormSnapshot["fields"], key: string): string {
  return fields[key] === true ? "כן" : "לא"
}

function line(label: string, value: string, empty = "(חסר)"): string {
  return `${label}: ${value || empty}`
}

export function clientNameFrom(snapshot: FormSnapshot): string {
  return text(snapshot.fields, "clientName")
}

export function buildTitle(snapshot: FormSnapshot): string {
  const type = taskTypeById(snapshot.taskType)
  const client = clientNameFrom(snapshot) || "בלי שם לקוח"
  return clip(withoutEmDash(`${type.label} · ${client} · ${snapshot.opener}`), 255)
}

function buildDescriptionBody(
  snapshot: FormSnapshot,
  analysis: AnalyzeResult | null,
  due: Date,
): string {
  const type = taskTypeById(snapshot.taskType)
  const fields = snapshot.fields
  const blocks: string[] = [
    line("פתח", snapshot.opener),
    line("סוג", type.label),
    line("דדליין", formatTaskDescriptionDate(due)),
  ]

  const clientLines = [
    line("שם הלקוח", text(fields, "clientName")),
    text(fields, "businessName") ? line("שם העסק", text(fields, "businessName")) : "",
    text(fields, "clientPhone") ? line("טלפון", text(fields, "clientPhone")) : "",
  ].filter(Boolean)

  if (clientLines.length) {
    blocks.push("", "פרטי הלקוח", ...clientLines)
  }

  const idLines: string[] = []
  if (snapshot.taskType === "meta_monday_new" || snapshot.taskType === "meta_add_form") {
    if (text(fields, "pageId") || snapshot.taskType === "meta_monday_new") {
      idLines.push(line("Page ID", text(fields, "pageId")))
    }
    idLines.push(line("Form ID", text(fields, "formId")))
    idLines.push(line("שם הטופס", text(fields, "formName")))
  }
  if (text(fields, "mondayBoardId")) {
    idLines.push(line("בורד מאנדיי", text(fields, "mondayBoardId")))
  }
  if (typeof fields.sharedBoard === "boolean") {
    idLines.push(line("גישה לבורד", flag(fields, "sharedBoard")))
  }
  if (idLines.length) {
    blocks.push("", "מזהים", ...idLines)
  }

  if (snapshot.taskType === "site_monday") {
    blocks.push(
      "",
      "אתר",
      line("בונה האתר", text(fields, "siteBuilder")),
      line("כתובת", text(fields, "siteUrl")),
    )
  }

  if (snapshot.taskType === "whatsapp") {
    blocks.push(
      "",
      "וואטסאפ",
      line("מספר שולח", text(fields, "fromNumber")),
      line("טופס מקור", text(fields, "fromForm")),
      "",
      "נוסח ההודעה",
      text(fields, "messageBody") || "(חסר)",
    )
  }

  if (snapshot.taskType === "fix_automation") {
    blocks.push(
      "",
      "תיקון",
      line("נבדק ולא עובד", flag(fields, "verifiedBroken")),
      "",
      "מה צריך שיקרה",
      text(fields, "expectedBehavior") || "(חסר)",
    )
  }

  if (snapshot.taskType === "email") {
    blocks.push(
      "",
      "מייל",
      line("למי נשלח", text(fields, "mailTo")),
      line("כתובת שולחת", text(fields, "mailFrom")),
      "",
      "נוסח המייל",
      text(fields, "mailBody") || "(חסר)",
    )
  }

  if (snapshot.taskType === "other") {
    blocks.push("", "תיאור המשימה", text(fields, "otherDescription") || "(חסר)")
  }

  if (type.showNeedToDo) {
    blocks.push("", "מה צריך לעשות בתכלס", snapshot.needToDo.trim() || "(חסר)")
  }

  if (snapshot.campaignerNote.trim()) {
    blocks.push("", "הערות מהקמפיינר", snapshot.campaignerNote.trim())
  }

  if (analysis?.checkFailed) {
    blocks.push("", "בדיקת הטופס", "הייתה שגיאה בניתוח. המשימה נפתחה כמו שהיא.")
  }

  if (analysis?.missing.length) {
    blocks.push("", "חסר, לפי הבדיקה")
    for (const gap of analysis.missing) {
      const note =
        snapshot.campaignerNote.trim() && analysis.missing.length === 1
          ? snapshot.campaignerNote.trim()
          : gap.why
      blocks.push(`${gap.label}: ${withoutEmDash(note)}`)
    }
  }

  if (analysis?.warnings.length) {
    blocks.push("", "אזהרות", ...analysis.warnings.map(withoutEmDash))
  }

  return withoutEmDash(blocks.join("\n"))
}

export function buildDescription(
  snapshot: FormSnapshot,
  analysis: AnalyzeResult | null,
  due: Date,
): string {
  return clip(buildDescriptionBody(snapshot, analysis, due), 5000)
}

export function buildWhatsappText(
  snapshot: FormSnapshot,
  due: Date,
  analysis: AnalyzeResult | null,
  task?: { id: number; title: string },
): string {
  const title = task?.title || buildTitle(snapshot)
  const body = buildDescriptionBody(snapshot, analysis, due)
  const header = [
    "משימה חדשה נפתחה",
    `*${title}*`,
    task?.id ? `מספר משימה בקאלי: ${task.id}` : "",
  ].filter(Boolean)

  return withoutEmDash([...header, "", body].join("\n"))
}
