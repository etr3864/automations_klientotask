import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"

type Common = {
  label: string
  help?: string
  required?: boolean
  error?: string
}

export function FieldFrame({
  label,
  help,
  required,
  error,
  children,
}: Common & { children: ReactNode }) {
  return (
    <label className="block space-y-1.5" data-invalid={error ? "true" : undefined}>
      <span className="flex items-baseline gap-2 text-sm font-medium text-[var(--ink)]">
        {label}
        {required ? <span className="text-[var(--accent)]">חובה</span> : null}
      </span>
      {children}
      {error ? (
        <span className="field-hint-error block text-[13px] leading-5">{error}</span>
      ) : help ? (
        <span className="block text-[13px] leading-5 text-[var(--muted)]">{help}</span>
      ) : null}
    </label>
  )
}

export function TextField({
  label,
  help,
  required,
  error,
  className = "",
  ...props
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldFrame label={label} help={help} required={required} error={error}>
      <input
        {...props}
        className={`field-input ${error ? "field-error" : ""} ${className}`}
      />
    </FieldFrame>
  )
}

export function TextAreaField({
  label,
  help,
  required,
  error,
  className = "",
  ...props
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldFrame label={label} help={help} required={required} error={error}>
      <textarea
        {...props}
        className={`field-input min-h-32 resize-y ${error ? "field-error" : ""} ${className}`}
      />
    </FieldFrame>
  )
}

export function CheckField({
  label,
  help,
  required,
  error,
  checked,
  onChange,
}: Common & {
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label
      data-invalid={error ? "true" : undefined}
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        error
          ? "field-error-box border-rose-300"
          : "border-white/70 bg-white/45 hover:bg-white/70"
      }`}
    >
      <input
        type="checkbox"
        className="mt-1 size-5 accent-[var(--accent)]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-[var(--ink)]">
          {label}
          {required ? <span className="ms-2 text-[var(--accent)]">חובה</span> : null}
        </span>
        {error ? (
          <span className="field-hint-error block text-[13px]">{error}</span>
        ) : help ? (
          <span className="block text-[13px] text-[var(--muted)]">{help}</span>
        ) : null}
      </span>
    </label>
  )
}
