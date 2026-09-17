import type { ReactNode } from "react"
import { LogoutButton } from "@/components/auth/logout-button"

export function LiquidShell({
  children,
  title,
  subtitle,
  showLogout = false,
}: {
  children: ReactNode
  title: string
  subtitle: string
  showLogout?: boolean
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>
      <main className="relative mx-auto w-full max-w-3xl px-4 py-8 lg:max-w-6xl lg:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 text-center sm:text-right">
            <p className="text-sm text-[var(--accent-ink)]">ווינרס · תפעול</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] lg:text-5xl">
              {title}
            </h1>
            <p className="text-sm leading-6 text-[var(--muted)] sm:text-base">{subtitle}</p>
          </div>
          {showLogout ? <LogoutButton /> : null}
        </header>
        {children}
      </main>
    </div>
  )
}
