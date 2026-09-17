type JsonRpcError = {
  code: number
  message: string
}

type JsonRpcResponse = {
  jsonrpc?: string
  id?: number | string
  error?: JsonRpcError
  result?: {
    isError?: boolean
    content?: Array<{ type?: string; text?: string }>
    structuredContent?: unknown
  }
}

export type CreatedKaliTask = {
  id: number
  title: string
  status?: string
}

function parseSse(raw: string): unknown {
  const payloads = raw
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== "[DONE]")

  if (!payloads.length) {
    throw new Error("תשובת SSE ריקה")
  }

  return JSON.parse(payloads[payloads.length - 1])
}

export async function readMcpPayload(res: Response): Promise<JsonRpcResponse> {
  const contentType = res.headers.get("content-type") ?? ""
  const raw = await res.text()
  if (!raw.trim()) {
    throw new Error("תשובה ריקה מקאלי")
  }

  const parsed = contentType.includes("text/event-stream") || raw.includes("\ndata:")
    ? parseSse(raw)
    : JSON.parse(raw)

  return parsed as JsonRpcResponse
}

function parseEmbeddedJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1))
    }
    throw new Error("לא הצלחנו לקרוא את תשובת קאלי")
  }
}

export function extractCreatedTask(payload: JsonRpcResponse): CreatedKaliTask {
  if (payload.error) {
    throw new Error(payload.error.message || "קאלי החזיר שגיאה")
  }
  if (payload.result?.isError) {
    const text = payload.result.content?.map((item) => item.text).join("\n")
    throw new Error(text || "קאלי החזיר שגיאה")
  }

  const structured = payload.result?.structuredContent as
    | { data?: { id?: number; title?: string; status?: string } }
    | undefined
  if (structured?.data?.id) {
    return {
      id: structured.data.id,
      title: structured.data.title ?? "",
      status: structured.data.status,
    }
  }

  const text = payload.result?.content?.find((item) => item.text)?.text
  if (text) {
    const embedded = parseEmbeddedJson(text) as {
      data?: { id?: number; title?: string; status?: string }
    }
    if (embedded.data?.id) {
      return {
        id: embedded.data.id,
        title: embedded.data.title ?? "",
        status: embedded.data.status,
      }
    }
  }

  throw new Error("קאלי לא החזיר מזהה משימה")
}
