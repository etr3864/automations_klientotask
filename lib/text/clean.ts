const EM_DASH = /\u2014|\u2013|\u2015/g

export function withoutEmDash(value: string): string {
  return value.replace(EM_DASH, ",").replace(/\s+,/g, ",").replace(/,\s*,/g, ",")
}

export function clip(value: string, max: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 3)}...`
}

export function looksLikePasswordDump(value: string): boolean {
  return /(סיסמ[הא]|password)\s*[:：=]/i.test(value)
}
