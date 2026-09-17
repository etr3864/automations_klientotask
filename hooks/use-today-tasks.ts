"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { calendarDayKey } from "@/lib/datetime/jerusalem"
import { readJson, STORAGE_TODAY, writeJson } from "@/lib/storage/local"
import type { TodayTask } from "@/lib/tasks/types"

type Store = {
  day: string
  tasks: TodayTask[]
}

const listeners = new Set<() => void>()
let memoRaw: string | null = null
let memoStore: Store = { day: "", tasks: [] }

function emit() {
  memoRaw = null
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Store {
  const raw = window.localStorage.getItem(STORAGE_TODAY)
  if (raw === memoRaw) return memoStore
  memoRaw = raw
  memoStore = readJson<Store>(STORAGE_TODAY, { day: "", tasks: [] })
  return memoStore
}

function persist(next: Store) {
  writeJson(STORAGE_TODAY, next)
  emit()
}

const EMPTY_TODAY: Store = { day: "", tasks: [] }

function getServerSnapshot(): Store {
  return EMPTY_TODAY
}

export function useTodayTasks() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const todayKey = calendarDayKey(new Date())
  const tasks = useMemo(
    () => (store.day === todayKey ? store.tasks : []),
    [store, todayKey],
  )

  const add = useCallback(
    (task: TodayTask) => {
      persist({ day: todayKey, tasks: [task, ...tasks] })
    },
    [tasks, todayKey],
  )

  return { tasks, add }
}
