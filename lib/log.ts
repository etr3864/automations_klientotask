export function logInfo(event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level: "info", event, ...data }))
}

export function logError(event: string, data: Record<string, unknown> = {}) {
  const error = data.error
  const safe =
    error instanceof Error
      ? { ...data, error: error.message }
      : data
  console.error(JSON.stringify({ level: "error", event, ...safe }))
}
