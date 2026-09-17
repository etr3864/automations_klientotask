"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
        aria-label="סגירה"
        onClick={onCancel}
      />
      <div className="glass-panel relative w-full max-w-md animate-rise p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
