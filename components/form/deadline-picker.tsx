"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  daysInJerusalemMonth,
  fromJerusalemLocal,
  HEBREW_MONTHS,
  HEBREW_WEEKDAYS,
  isPastDeadline,
  jerusalemWeekday,
  toIso8601Jerusalem,
  zonedParts,
} from "@/lib/datetime/jerusalem"

export type DeadlineState = {
  year: number | null
  month: number | null
  day: number | null
  time: string
}

type Props = {
  value: DeadlineState
  onChange: (value: DeadlineState) => void
  dateError?: string
  timeError?: string
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function deadlineIso(value: DeadlineState): string {
  if (!value.year || !value.month || !value.day || !value.time) return ""
  const [hour, minute] = value.time.split(":").map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return ""
  return toIso8601Jerusalem(
    fromJerusalemLocal(value.year, value.month, value.day, hour, minute),
  )
}

export function DeadlinePicker({ value, onChange, dateError, timeError }: Props) {
  const now = zonedParts(new Date())
  const [monthCursor, setMonthCursor] = useState({
    year: value.year ?? now.year,
    month: value.month ?? now.month,
  })
  const [natural, setNatural] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const cells = useMemo(() => {
    const start = jerusalemWeekday(monthCursor.year, monthCursor.month, 1)
    const total = daysInJerusalemMonth(monthCursor.year, monthCursor.month)
    const boxes: Array<number | null> = []
    for (let i = 0; i < start; i += 1) boxes.push(null)
    for (let day = 1; day <= total; day += 1) boxes.push(day)
    while (boxes.length % 7 !== 0) boxes.push(null)
    return boxes
  }, [monthCursor])

  async function understand() {
    if (!natural.trim()) return
    setLoading(true)
    setStatus("קוראים את מה שכתבת...")
    try {
      const res = await fetch("/api/parse-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: natural }),
      })
      const data = (await res.json()) as {
        understood?: boolean
        missingTime?: boolean
        iso?: string | null
        display?: string | null
        error?: string | null
      }
      if (data.understood && data.iso && data.missingTime) {
        const parts = zonedParts(new Date(data.iso))
        setMonthCursor({ year: parts.year, month: parts.month })
        onChange({
          year: parts.year,
          month: parts.month,
          day: parts.day,
          time: "",
        })
        setStatus("התאריך הובן. חסרה שעה, בחרו שעה למטה.")
        return
      }
      if (!res.ok || !data.understood || !data.iso) {
        setStatus(
          data.missingTime
            ? "התאריך הובן. חסרה שעה, בחרו שעה למטה."
            : data.error || "לא הצלחנו להבין את התאריך. בחרו מהיומן או כתבו שוב.",
        )
        return
      }
      const parts = zonedParts(new Date(data.iso))
      setMonthCursor({ year: parts.year, month: parts.month })
      onChange({
        year: parts.year,
        month: parts.month,
        day: parts.day,
        time: data.missingTime ? "" : `${pad(parts.hour)}:${pad(parts.minute)}`,
      })
      setStatus(
        data.missingTime
          ? "התאריך הובן. חסרה שעה, בחרו שעה למטה."
          : data.display || "הדדליין הובן",
      )
    } catch {
      setStatus("לא הצלחנו להבין את התאריך. בחרו מהיומן.")
    } finally {
      setLoading(false)
    }
  }

  const complete = Boolean(deadlineIso(value))

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">דדליין</p>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          תאריך ושעה תמיד. אפשר לכתוב חופשי או לבחור מהיומן.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="field-input"
          value={natural}
          placeholder="למשל מחר בשש בערב"
          onChange={(event) => setNatural(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              void understand()
            }
          }}
        />
        <Button variant="soft" onClick={() => void understand()} disabled={loading}>
          הבן תאריך
        </Button>
      </div>

      {status ? <p className="text-sm text-[var(--accent-ink)]">{status}</p> : null}

      <div
        className={`rounded-3xl border p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8 ${
          dateError || timeError
            ? "field-error-box border-rose-300"
            : "border-white/70 bg-white/40"
        }`}
        data-invalid={dateError || timeError ? "true" : undefined}
      >
        <div>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm hover:bg-white/70"
            onClick={() =>
              setMonthCursor((current) =>
                current.month === 1
                  ? { year: current.year - 1, month: 12 }
                  : { year: current.year, month: current.month - 1 },
              )
            }
          >
            הקודם
          </button>
          <p className="text-sm font-medium">
            {HEBREW_MONTHS[monthCursor.month - 1]} {monthCursor.year}
          </p>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm hover:bg-white/70"
            onClick={() =>
              setMonthCursor((current) =>
                current.month === 12
                  ? { year: current.year + 1, month: 1 }
                  : { year: current.year, month: current.month + 1 },
              )
            }
          >
            הבא
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--muted)]">
          {HEBREW_WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
          {cells.map((day, index) => {
            const isSelected =
              day &&
              value.year === monthCursor.year &&
              value.month === monthCursor.month &&
              value.day === day
            const isToday =
              day &&
              now.year === monthCursor.year &&
              now.month === monthCursor.month &&
              now.day === day
            return (
              <button
                key={`${monthCursor.month}-${index}`}
                type="button"
                disabled={!day}
                onClick={() =>
                  day &&
                  onChange({
                    year: monthCursor.year,
                    month: monthCursor.month,
                    day,
                    time: value.time,
                  })
                }
                className={`h-10 rounded-2xl text-sm transition ${
                  day ? "hover:bg-white" : ""
                } ${isSelected ? "bg-[var(--ink)] text-white" : ""} ${
                  isToday && !isSelected ? "ring-1 ring-[var(--accent)]" : ""
                }`}
              >
                {day || ""}
              </button>
            )
          })}
        </div>

        </div>

        <div className="mt-4 lg:mt-0">
          <label className="text-sm font-medium text-[var(--ink)]">שעה</label>
          <input
            type="time"
            className={`field-input mt-1 ${timeError ? "field-error" : ""}`}
            value={value.time}
            onChange={(event) => onChange({ ...value, time: event.target.value })}
          />
          {timeError ? (
            <p className="field-hint-error mt-1.5 text-[13px] leading-5">{timeError}</p>
          ) : (
            <p className="mt-2 text-[13px] text-[var(--muted)]">חובה לבחור שעה, גם אם כתבתם רק מחר.</p>
          )}
        </div>
      </div>

      {dateError ? (
        <p className="field-hint-error text-[13px] leading-5">{dateError}</p>
      ) : (
        <p className={`text-sm ${complete ? "text-[var(--accent-ink)]" : "text-amber-800"}`}>
          {complete
            ? `המערכת שולחת: ${value.day} ב${HEBREW_MONTHS[(value.month ?? 1) - 1]} ${value.year}, ${value.time}`
            : value.day
              ? "התאריך נבחר. חסרה שעה."
              : "בחרו תאריך ושעה, או כתבו בשפה חופשית."}
        </p>
      )}
      {complete && isPastDeadline(new Date(deadlineIso(value))) ? (
        <p className="text-sm text-amber-800">הדדליין כבר עבר. בדקו שזה מה שהתכוונתם.</p>
      ) : null}
    </div>
  )
}
