"use client"

import { useCallback, useSyncExternalStore } from "react"
import { readJson, STORAGE_OPENERS, writeJson } from "@/lib/storage/local"
import { DEFAULT_CAMPAIGNERS } from "@/lib/tasks/catalog"

type OpenerState = {
  names: string[]
  selected: string
}

const FALLBACK: OpenerState = {
  names: DEFAULT_CAMPAIGNERS,
  selected: "",
}

const listeners = new Set<() => void>()
let memoRaw: string | null = null
let memoState: OpenerState = FALLBACK

function emit() {
  memoRaw = null
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function normalize(stored: OpenerState): OpenerState {
  const names = stored.names?.length ? stored.names : DEFAULT_CAMPAIGNERS
  return {
    names,
    selected: names.includes(stored.selected) ? stored.selected : "",
  }
}

function getSnapshot(): OpenerState {
  const raw = window.localStorage.getItem(STORAGE_OPENERS)
  if (raw === memoRaw) return memoState
  memoRaw = raw
  memoState = normalize(readJson<OpenerState>(STORAGE_OPENERS, FALLBACK))
  return memoState
}

function persist(next: OpenerState) {
  writeJson(STORAGE_OPENERS, next)
  emit()
}

function getServerSnapshot(): OpenerState {
  return FALLBACK
}

export function useCampaigners() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((name: string) => {
    const clean = name.trim()
    if (!clean) return
    const current = getSnapshot()
    persist({
      names: current.names.includes(clean) ? current.names : [...current.names, clean],
      selected: clean,
    })
  }, [])

  const remove = useCallback((name: string) => {
    const current = getSnapshot()
    const names = current.names.filter((item) => item !== name)
    persist({
      names,
      selected: current.selected === name ? "" : current.selected,
    })
  }, [])

  const select = useCallback((name: string) => {
    persist({ ...getSnapshot(), selected: name })
  }, [])

  return { ...state, add, remove, select }
}
