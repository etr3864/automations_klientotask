"use client"

import { Button } from "@/components/ui/button"
import type { TodayTask } from "@/lib/tasks/types"

type Props = {
  lastTitle: string
  tasks: TodayTask[]
  onAgain: () => void
}

export function SuccessScreen({ lastTitle, tasks, onAgain }: Props) {
  return (
    <div className="glass-panel mx-auto w-full max-w-xl animate-rise p-8 text-center lg:max-w-2xl lg:p-10">
      <p className="text-sm text-[var(--accent-ink)]">נפתחה</p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">המשימה נפתחה</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{lastTitle}</p>
      <Button className="mt-8 w-full" onClick={onAgain}>
        פתח משימה נוספת
      </Button>
      {tasks.length ? (
        <div className="mt-8 text-right">
          <p className="text-sm font-medium text-[var(--ink)]">נפתחו מהדפדפן הזה היום</p>
          <ul className="mt-3 space-y-2">
            {tasks.map((task) => (
              <li
                key={`${task.id}-${task.createdAt}`}
                className="rounded-2xl bg-white/50 px-4 py-3 text-sm"
              >
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
