"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/modal"

type Props = {
  names: string[]
  selected: string
  onSelect: (name: string) => void
  onAdd: (name: string) => void
  onRemove: (name: string) => void
  error?: string
}

export function OpenerSelect({
  names,
  selected,
  onSelect,
  onAdd,
  onRemove,
  error,
}: Props) {
  const [draft, setDraft] = useState("")
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  function saveDraft() {
    if (!draft.trim()) return
    onAdd(draft)
    setDraft("")
    setAdding(false)
  }

  function pickName(name: string) {
    onSelect(name)
    setAdding(false)
    setDraft("")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--ink)]">מי פותח</span>
        <button
          type="button"
          className="text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline"
          onClick={() => {
            setAdding((value) => !value)
            setDraft("")
          }}
        >
          {adding ? "סגור" : "הוספת שם"}
        </button>
      </div>

      <div className="flex items-center gap-2" data-invalid={error ? "true" : undefined}>
        <select
          className={`field-input min-w-0 flex-1 ${error ? "field-error" : ""}`}
          value={selected}
          onChange={(event) => pickName(event.target.value)}
        >
          <option value="">בחרו מי פותח את המשימה</option>
          {names.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {selected ? (
          <button
            type="button"
            aria-label={`מחיקת ${selected}`}
            className="flex h-[52px] w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-lg text-rose-700 transition hover:bg-rose-50"
            onClick={() => setPendingDelete(selected)}
          >
            ×
          </button>
        ) : null}
      </div>
      {error ? <p className="field-hint-error text-[13px] leading-5">{error}</p> : null}

      {adding ? (
        <div className="flex gap-2">
          <input
            className="field-input"
            placeholder="שם חדש"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                saveDraft()
              }
            }}
          />
          <Button variant="soft" onClick={saveDraft}>
            שמירה
          </Button>
        </div>
      ) : null}

      {pendingDelete ? (
        <ConfirmModal
          title="למחוק את השם?"
          body={`למחוק את ${pendingDelete} מהרשימה במחשב הזה?`}
          confirmLabel="מחיקה"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onRemove(pendingDelete)
            setPendingDelete(null)
          }}
        />
      ) : null}
    </div>
  )
}
