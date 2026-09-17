import { formatHeDateTime, JERUSALEM, toIso8601Jerusalem } from "@/lib/datetime/jerusalem"
import { parseNaturalHebrew } from "@/lib/datetime/natural-he"
import { completeJson } from "@/lib/openai/complete-json"
import { DEADLINE_SYSTEM_PROMPT } from "@/lib/openai/prompts"
import { withoutEmDash } from "@/lib/text/clean"

export type ParsedDeadline = {
  understood: boolean
  missingTime: boolean
  iso: string | null
  display: string | null
  error: string | null
}

function normalize(result: ParsedDeadline): ParsedDeadline {
  const understood = Boolean(result.understood || result.iso)
  return {
    understood,
    missingTime: understood ? Boolean(result.missingTime) : false,
    iso: result.iso,
    display: result.display ? withoutEmDash(result.display) : null,
    error: understood
      ? null
      : result.error
        ? withoutEmDash(result.error)
        : "לא הצלחנו להבין את התאריך. כתבו למשל מחר ב-18:00",
  }
}

export async function parseDeadlineText(text: string, now: Date): Promise<ParsedDeadline> {
  const local = parseNaturalHebrew(text, now)
  if (local) return normalize(local)

  const result = await completeJson<ParsedDeadline>(
    DEADLINE_SYSTEM_PROMPT,
    JSON.stringify({
      nowIso: toIso8601Jerusalem(now),
      timeZone: JERUSALEM,
      nowDisplay: formatHeDateTime(now),
      text,
    }),
    8000,
  )

  return normalize(result)
}
