"use client"

import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
    >
      יציאה
    </button>
  )
}
