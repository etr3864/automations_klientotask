import { addJerusalemDays, calendarDayKey } from "@/lib/datetime/jerusalem"

export type KaliPriority = "low" | "medium" | "high" | "urgent"

export function priorityFromDeadline(due: Date, now = new Date()): KaliPriority {
  const diffMs = due.getTime() - now.getTime()
  if (diffMs <= 2 * 60 * 60 * 1000) return "urgent"
  if (calendarDayKey(due) === calendarDayKey(now)) return "high"
  if (calendarDayKey(due) === calendarDayKey(addJerusalemDays(now, 1))) return "medium"
  return "low"
}

