// Pure formatting helpers, shared by core rules and the UI.

/** Human-readable byte size, e.g. 1536 → "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** exponent
  const decimals = value >= 100 || exponent === 0 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[exponent]}`
}

/** Human-readable CO₂ mass, e.g. 0.42 → "0.42 g", 2500 → "2.5 kg". */
export function formatGrams(grams: number): string {
  if (grams >= 1_000_000) return `${(grams / 1_000_000).toFixed(1)} t`
  if (grams >= 1_000) return `${(grams / 1_000).toFixed(1)} kg`
  if (grams >= 10) return `${Math.round(grams)} g`
  return `${grams.toFixed(2)} g`
}

/** Percentage of a total, clamped and rounded for display. */
export function percentOf(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}
