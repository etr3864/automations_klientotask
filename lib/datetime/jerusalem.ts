export const JERUSALEM = "Asia/Jerusalem"

type ZoneParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((item) => item.type === type)?.value ?? ""
}

export function zonedParts(date: Date, timeZone = JERUSALEM): ZoneParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  return {
    year: Number(part(parts, "year")),
    month: Number(part(parts, "month")),
    day: Number(part(parts, "day")),
    hour: Number(part(parts, "hour")),
    minute: Number(part(parts, "minute")),
  }
}

export function jerusalemOffset(date: Date): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: JERUSALEM,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((item) => item.type === "timeZoneName")?.value

  const match = name?.match(/GMT([+-]\d{2}:\d{2})/)
  return match?.[1] ?? "+03:00"
}

export function fromJerusalemLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const actual = zonedParts(guess)
  const desired = Date.UTC(year, month - 1, day, hour, minute)
  const shown = Date.UTC(
    actual.year,
    actual.month - 1,
    actual.day,
    actual.hour,
    actual.minute,
  )
  return new Date(guess.getTime() - (shown - desired))
}

export function toIso8601Jerusalem(date: Date): string {
  const parts = zonedParts(date)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:00${jerusalemOffset(date)}`
}

export function calendarDayKey(date: Date): string {
  const parts = zonedParts(date)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

export function addJerusalemDays(date: Date, days: number): Date {
  const parts = zonedParts(date)
  return fromJerusalemLocal(parts.year, parts.month, parts.day + days, parts.hour, parts.minute)
}

export function formatHeDateTime(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: JERUSALEM,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export function formatShortDeadline(date: Date, now = new Date()): string {
  const time = new Intl.DateTimeFormat("he-IL", {
    timeZone: JERUSALEM,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)

  if (calendarDayKey(date) === calendarDayKey(now)) {
    return `היום ${time}`
  }
  if (calendarDayKey(date) === calendarDayKey(addJerusalemDays(now, 1))) {
    return `מחר ${time}`
  }
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: JERUSALEM,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export function formatTaskDescriptionDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: JERUSALEM,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date)
}

export const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
]

export const HEBREW_WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]

export function jerusalemWeekday(year: number, month: number, day: number): number {
  const date = fromJerusalemLocal(year, month, day, 12, 0)
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: JERUSALEM,
    weekday: "short",
  }).format(date)
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name)
}

export function daysInJerusalemMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function isPastDeadline(due: Date, now = new Date()): boolean {
  return due.getTime() < now.getTime()
}
