"use client"

import { Button } from "@/components/ui/button"
import { TextAreaField } from "@/components/ui/field"
import type { AnalyzeResult } from "@/lib/tasks/types"

type Props = {
  analysis: AnalyzeResult
  note: string
  onNote: (value: string) => void
  onSendAnyway: () => void
  sending: boolean
}

export function AnalyzeGap({
  analysis,
  note,
  onNote,
  onSendAnyway,
  sending,
}: Props) {
  const first = analysis.missing[0]
  if (!first && !analysis.warnings.length) return null

  return (
    <div className="animate-rise space-y-4 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-5">
      {first ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--ink)]">
            חסר לנו {first.label}. אפשר למלא כאן, או לכתוב למה אין.
          </p>
          {first.why ? (
            <p className="text-[13px] leading-5 text-[var(--muted)]">{first.why}</p>
          ) : null}
          {first.where ? (
            <p className="text-[13px] leading-5 text-[var(--muted)]">{first.where}</p>
          ) : null}
        </div>
      ) : null}

      {analysis.missing.length > 1 ? (
        <ul className="space-y-1 text-sm text-[var(--ink)]">
          {analysis.missing.slice(1).map((item) => (
            <li key={item.field}>{item.label}: {item.why}</li>
          ))}
        </ul>
      ) : null}

      {analysis.warnings.length ? (
        <ul className="space-y-1 text-sm text-amber-900">
          {analysis.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <TextAreaField
        label="הערות מהקמפיינר"
        value={note}
        onChange={(event) => onNote(event.target.value)}
      />

      <Button variant="soft" onClick={onSendAnyway} disabled={sending}>
        {sending ? "שולחים..." : "שלח בכל מקרה"}
      </Button>
    </div>
  )
}
