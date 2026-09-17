import { addJerusalemDays, fromJerusalemLocal, toIso8601Jerusalem, zonedParts } from "@/lib/datetime/jerusalem"

const WORD_HOURS: Record<string, number> = {
  אחת: 1,
  שתיים: 2,
  שלוש: 3,
  ארבע: 4,
  חמש: 5,
  שש: 6,
  שבע: 7,
  שמונה: 8,
  תשע: 9,
  עשר: 10,
  אחתעשרה: 11,
  שתיםעשרה: 12,
}

function clean(text: string): string {
  return text.replace(/[\u2013\u2014\u2015]/g, " ").replace(/\s+/g, " ").trim()
}

function parseTime(text: string): { hour: number; minute: number } | null {
  const clock = text.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/)
  if (clock) {
    return { hour: Number(clock[1]), minute: Number(clock[2]) }
  }

  const numeric = text.match(/(?:ב-?\s*|בשעה\s+|עד\s+)([01]?\d|2[0-3])\b/)
  if (numeric) {
    return { hour: Number(numeric[1]), minute: 0 }
  }

  const compact = text.replace(/\s+/g, "")
  for (const [word, hour] of Object.entries(WORD_HOURS)) {
    if (new RegExp(`ב${word}|בשעה${word}`).test(compact)) {
      const afternoon = /ערב|אחה.?צ|צהריים/.test(text)
      return { hour: afternoon && hour <= 12 ? hour + 12 : hour, minute: 0 }
    }
  }

  return null
}

function parseDay(text: string, now: Date) {
  const today = zonedParts(now)
  const base = fromJerusalemLocal(today.year, today.month, today.day, 12, 0)

  if (/מחרתיים/.test(text)) return addJerusalemDays(base, 2)
  if (/מחר/.test(text)) return addJerusalemDays(base, 1)
  if (/היום/.test(text)) return base

  const numbered = text.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/)
  if (numbered) {
    const day = Number(numbered[1])
    const month = Number(numbered[2])
    const year = numbered[3]
      ? Number(numbered[3].length === 2 ? `20${numbered[3]}` : numbered[3])
      : today.year
    return fromJerusalemLocal(year, month, day, 12, 0)
  }

  return null
}

export function parseNaturalHebrew(
  raw: string,
  now: Date,
): {
  understood: boolean
  missingTime: boolean
  iso: string | null
  display: string | null
  error: string | null
} | null {
  const text = clean(raw)
  if (!text) return null

  const day = parseDay(text, now)
  if (!day) return null

  const time = parseTime(text)
  const parts = zonedParts(day)
  if (time) {
    const withTime = fromJerusalemLocal(parts.year, parts.month, parts.day, time.hour, time.minute)
    return {
      understood: true,
      missingTime: false,
      iso: toIso8601Jerusalem(withTime),
      display: null,
      error: null,
    }
  }

  return {
    understood: true,
    missingTime: true,
    iso: toIso8601Jerusalem(fromJerusalemLocal(parts.year, parts.month, parts.day, 12, 0)),
    display: null,
    error: null,
  }
}
