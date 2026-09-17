import type { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "soft"
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  const styles: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-[var(--ink)] text-white shadow-lg shadow-stone-900/10 hover:translate-y-[-1px] hover:shadow-xl",
    ghost:
      "bg-white/40 text-[var(--ink)] hover:bg-white/70 border border-white/60",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
    soft: "bg-[var(--accent-soft)] text-[var(--accent-ink)] hover:bg-[#dceee8]",
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
