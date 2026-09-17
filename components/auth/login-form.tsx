"use client"

import { FormEvent, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LiquidShell } from "@/components/liquid/shell"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error || "הסיסמה לא נכונה")
        return
      }
      router.replace(search.get("next") || "/")
      router.refresh()
    } catch {
      setError("לא הצלחנו להיכנס. נסו שוב.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <LiquidShell title="כניסה לטופס" subtitle="סיסמה אחת לכולם. נשמרת לשבוע במחשב הזה.">
      <form className="glass-panel mx-auto max-w-md space-y-5 p-6" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">סיסמה</span>
          <input
            className="field-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy || !password}>
          {busy ? "נכנסים..." : "כניסה"}
        </Button>
      </form>
    </LiquidShell>
  )
}
