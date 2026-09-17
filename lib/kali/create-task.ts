import { kaliMcpUrl } from "@/lib/env"
import { KALI_DEPARTMENT, KALI_SOURCE, KALI_TASK_TYPE } from "@/lib/kali/defaults"
import { logError, logInfo } from "@/lib/log"
import { extractCreatedTask, readMcpPayload, type CreatedKaliTask } from "@/lib/kali/parse"
import type { KaliPriority } from "@/lib/tasks/priority"

export type CreateTaskInput = {
  title: string
  description: string
  assigneeId: number
  priority: KaliPriority
  dueDate: string
}

const inflight = new Map<string, Promise<CreatedKaliTask>>()

function requestKey(input: CreateTaskInput): string {
  return `${input.assigneeId}|${input.dueDate}|${input.title}|${input.description}`
}

export async function createKaliTask(input: CreateTaskInput): Promise<CreatedKaliTask> {
  const key = requestKey(input)
  const pending = inflight.get(key)
  if (pending) return pending

  const request = sendCreate(input).finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, request)
  return request
}

async function sendCreate(input: CreateTaskInput): Promise<CreatedKaliTask> {
  logInfo("kali_create_start", {
    title: input.title,
    assigneeId: input.assigneeId,
    priority: input.priority,
    dueDate: input.dueDate,
  })

  const res = await fetch(kaliMcpUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "create_task",
        arguments: {
          title: input.title,
          description: input.description,
          assignee_ids: [input.assigneeId],
          primary_id: input.assigneeId,
          task_type: KALI_TASK_TYPE,
          source: KALI_SOURCE,
          department: KALI_DEPARTMENT,
          priority: input.priority,
          due_date: input.dueDate,
        },
      },
    }),
  })

  if (!res.ok) {
    logError("kali_create_http_failed", { status: res.status })
    throw new Error(`קאלי החזיר ${res.status}`)
  }

  const payload = await readMcpPayload(res)
  const task = extractCreatedTask(payload)
  logInfo("kali_create_ok", { taskId: task.id, title: task.title })
  return task
}
