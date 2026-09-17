export type TaskTypeId =
  | "meta_monday_new"
  | "meta_add_form"
  | "site_monday"
  | "whatsapp"
  | "fix_automation"
  | "email"
  | "other"

export type FieldKind = "text" | "textarea" | "checkbox" | "tel" | "url" | "email"

export type FieldConfig = {
  key: string
  label: string
  kind: FieldKind
  required?: boolean
  help?: string
  placeholder?: string
  inputMode?: "numeric" | "tel" | "url" | "email" | "text"
}

export type TaskTypeConfig = {
  id: TaskTypeId
  label: string
  shortLabel: string
  fields: FieldConfig[]
  showNeedToDo: boolean
}

export type AnalyzeGap = {
  field: string
  label: string
  why: string
  where?: string
}

export type AnalyzeResult = {
  missing: AnalyzeGap[]
  warnings: string[]
  summary: string
  checkFailed?: boolean
}

export type FormSnapshot = {
  opener: string
  taskType: TaskTypeId
  deadlineIso: string
  needToDo: string
  campaignerNote: string
  fields: Record<string, string | boolean>
}

export type TodayTask = {
  id: number
  title: string
  createdAt: string
  opener: string
}

export type DeadlineValue = {
  iso: string
  display: string
  date: string
  time: string
}
