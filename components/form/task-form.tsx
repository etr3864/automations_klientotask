"use client"

import { useMemo, useRef, useState } from "react"
import { AnalyzeGap } from "@/components/form/analyze-gap"
import { DeadlinePicker, deadlineIso, type DeadlineState } from "@/components/form/deadline-picker"
import { OpenerSelect } from "@/components/form/opener-select"
import { SuccessScreen } from "@/components/form/success-screen"
import { TypeFields } from "@/components/form/type-fields"
import { Button } from "@/components/ui/button"
import { TextAreaField } from "@/components/ui/field"
import { useCampaigners } from "@/hooks/use-campaigners"
import { useTodayTasks } from "@/hooks/use-today-tasks"
import { TASK_TYPES, taskTypeById } from "@/lib/tasks/catalog"
import { collectSubmitIssues, issueMap } from "@/lib/tasks/client-validation"
import type { AnalyzeResult, FormSnapshot, TaskTypeId } from "@/lib/tasks/types"

const emptyDeadline: DeadlineState = {
  year: null,
  month: null,
  day: null,
  time: "",
}

function emptyFailedAnalysis(): AnalyzeResult {
  return {
    missing: [],
    warnings: [],
    summary: "",
    checkFailed: true,
  }
}

export function TaskForm() {
  const campaigners = useCampaigners()
  const today = useTodayTasks()
  const [taskType, setTaskType] = useState<TaskTypeId>("meta_monday_new")
  const [deadline, setDeadline] = useState<DeadlineState>(emptyDeadline)
  const [fields, setFields] = useState<Record<string, string | boolean>>({})
  const [needToDo, setNeedToDo] = useState("")
  const [note, setNote] = useState("")
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null)
  const [busy, setBusy] = useState<"analyze" | "submit" | null>(null)
  const [error, setError] = useState("")
  const [attempted, setAttempted] = useState(false)
  const [successTitle, setSuccessTitle] = useState("")
  const [done, setDone] = useState(false)
  const submitLock = useRef(false)

  const config = useMemo(() => taskTypeById(taskType), [taskType])
  const iso = deadlineIso(deadline)
  const issues = attempted
    ? collectSubmitIssues({
        opener: campaigners.selected,
        deadline,
        needToDo,
        otherDescription: String(fields.otherDescription ?? ""),
        showNeedToDo: config.showNeedToDo,
      })
    : []
  const errors = issueMap(issues)

  function snapshot(): FormSnapshot {
    return {
      opener: campaigners.selected,
      taskType,
      deadlineIso: iso,
      needToDo,
      campaignerNote: note,
      fields,
    }
  }

  function resetForm() {
    submitLock.current = false
    setFields({})
    setNeedToDo("")
    setNote("")
    setAnalysis(null)
    setError("")
    setAttempted(false)
    setSuccessTitle("")
    setDone(false)
    setDeadline(emptyDeadline)
  }

  function canCheck() {
    return collectSubmitIssues({
      opener: campaigners.selected,
      deadline,
      needToDo,
      otherDescription: String(fields.otherDescription ?? ""),
      showNeedToDo: config.showNeedToDo,
    }).length === 0
  }

  function showFieldIssues() {
    setAttempted(true)
    requestAnimationFrame(() => {
      document
        .querySelector("[data-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  async function analyze() {
    setError("")
    if (!canCheck()) {
      showFieldIssues()
      return
    }
    setBusy("analyze")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot()),
      })
      const data = (await res.json()) as {
        analysis?: AnalyzeResult
        skipped?: boolean
        error?: string
      }
      if (res.status === 400 || res.status === 429) {
        setError(data.error || "לא הצלחנו לבדוק. תקנו את הטופס ונסו שוב.")
        return
      }
      const analysis = data.analysis ?? emptyFailedAnalysis()
      if (!res.ok || data.skipped || analysis.checkFailed || !analysis.missing.length) {
        await submit(analysis.checkFailed || data.skipped || !res.ok ? { ...analysis, checkFailed: true } : analysis)
        return
      }
      setAnalysis(analysis)
    } catch {
      await submit(emptyFailedAnalysis())
    } finally {
      setBusy((current) => (current === "analyze" ? null : current))
    }
  }

  async function submit(nextAnalysis: AnalyzeResult | null) {
    if (submitLock.current) return
    submitLock.current = true
    setBusy("submit")
    setError("")
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: snapshot(), analysis: nextAnalysis }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        task?: { id: number; title: string }
      }
      if (!res.ok || !data.task) {
        submitLock.current = false
        setError(data.error || "לא הצלחנו לפתוח את המשימה, נסו שוב")
        return
      }
      today.add({
        id: data.task.id,
        title: data.task.title,
        createdAt: new Date().toISOString(),
        opener: campaigners.selected,
      })
      setSuccessTitle(data.task.title)
      setDone(true)
    } catch {
      submitLock.current = false
      setError("לא הצלחנו לפתוח את המשימה, נסו שוב")
    } finally {
      setBusy(null)
    }
  }

  if (done) {
    return (
      <SuccessScreen
        lastTitle={successTitle}
        tasks={today.tasks}
        onAgain={resetForm}
      />
    )
  }

  return (
    <form
      className="space-y-6 pb-8 lg:space-y-8"
      onSubmit={(event) => {
        event.preventDefault()
        void analyze()
      }}
    >
      <section className="glass-panel space-y-6 p-5 sm:p-7 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0 lg:p-8">
        <div className="space-y-5">
          <OpenerSelect
            names={campaigners.names}
            selected={campaigners.selected}
            onSelect={campaigners.select}
            onAdd={campaigners.add}
            onRemove={campaigners.remove}
            error={errors.opener}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ink)]">סוג משימה</span>
            <select
              className="field-input"
              value={taskType}
              onChange={(event) => {
                setTaskType(event.target.value as TaskTypeId)
                setFields((current) => {
                  const next: Record<string, string | boolean> = {}
                  if (typeof current.clientName === "string" && current.clientName) {
                    next.clientName = current.clientName
                  }
                  return next
                })
                setAnalysis(null)
              }}
            >
              {TASK_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DeadlinePicker
          value={deadline}
          onChange={setDeadline}
          dateError={errors.deadlineDate}
          timeError={errors.deadlineTime}
        />
      </section>

      <section className="glass-panel space-y-5 p-5 sm:p-7 lg:p-8">
        <p className="hidden text-sm font-medium text-[var(--muted)] lg:block">פרטי המשימה</p>
        <TypeFields
          taskType={taskType}
          values={fields}
          errors={errors}
          onChange={(key, value) => {
            setFields((current) => ({ ...current, [key]: value }))
            setAnalysis(null)
          }}
        />

        {config.showNeedToDo ? (
          <TextAreaField
            label="מה צריך לעשות בתכלס"
            required
            help="זה המקום לכתוב חופשי, כמו בוואטסאפ."
            error={errors.needToDo}
            value={needToDo}
            onChange={(event) => setNeedToDo(event.target.value)}
          />
        ) : null}
      </section>

      {analysis ? (
        <AnalyzeGap
          analysis={analysis}
          note={note}
          onNote={setNote}
          sending={busy === "submit"}
          onSendAnyway={() => void submit(analysis)}
        />
      ) : null}

      {issues.length ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-medium">חסר כדי לשלוח. השדות מסומנים למעלה.</p>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {issues.map((issue) => (
              <li key={issue.key}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      <div className="sticky bottom-4 z-20 lg:bottom-6">
        <div className="glass-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="hidden text-sm text-[var(--muted)] lg:block">
            {[campaigners.selected, config.label, iso ? `${deadline.day}/${deadline.month} ${deadline.time}` : ""]
              .filter(Boolean)
              .join(" · ") || "מלאים את מה שחובה, ואז בודקים ושולחים"}
          </p>
          <Button
            type="submit"
            className="w-full py-3.5 text-base sm:w-auto sm:min-w-56"
            disabled={busy !== null}
          >
            {busy === "analyze"
              ? "בודקים..."
              : busy === "submit"
                ? "שולחים..."
                : "בדוק ושלח"}
          </Button>
        </div>
      </div>
    </form>
  )
}
