function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`חסר משתנה סביבה ${name}`)
  }
  return value
}

function optional(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback
}

export function kaliMcpUrl(): string {
  return required("KALI_MCP_URL")
}

export function kaliAssigneeId(): number {
  const value = Number(required("KALI_ASSIGNEE_ID"))
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("KALI_ASSIGNEE_ID לא תקין")
  }
  return value
}

export function appPassword(): string {
  return required("APP_PASSWORD")
}

export function openaiApiKey(): string | null {
  return optional("OPENAI_API_KEY") || null
}

export function openaiModel(): string {
  return optional("OPENAI_MODEL", "gpt-5.6-luna")
}

export function wasenderApiKey(): string | null {
  return optional("WASENDER_API_KEY") || null
}

export function wasenderUrl(): string {
  return optional("WASENDER_URL", "https://www.wasenderapi.com/api/send-message")
}

export function notifyPhones(): string[] {
  return optional("NOTIFY_PHONES")
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean)
}
