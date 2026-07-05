import type { CoverageSummary } from './types'

// Shapes mirror the CDP Profiler.takePreciseCoverage result. Kept here (not in
// deep-scan.ts) so the byte math is pure and unit-testable.
export interface CoverageRange {
  startOffset: number
  endOffset: number
  count: number
}

export interface CoverageFunction {
  ranges: CoverageRange[]
}

export interface RawScriptCoverage {
  scriptId: string
  url: string
  functions: CoverageFunction[]
}

/**
 * Used vs total source bytes for one script.
 *
 * V8 precise coverage yields nested ranges: a byte's execution count is that of
 * the innermost range covering it. We flatten to non-overlapping intervals and
 * count an interval as "used" when its innermost covering range ran (count > 0).
 */
export function scriptUsedBytes(functions: CoverageFunction[]): {
  used: number
  total: number
} {
  const ranges = functions.flatMap((fn) => fn.ranges)
  if (ranges.length === 0) return { used: 0, total: 0 }

  const total = ranges.reduce((max, r) => Math.max(max, r.endOffset), 0)

  // Elementary intervals between all boundary offsets.
  const boundaries = Array.from(
    new Set(ranges.flatMap((r) => [r.startOffset, r.endOffset])),
  ).sort((a, b) => a - b)

  let used = 0
  for (let i = 0; i < boundaries.length - 1; i++) {
    const a = boundaries[i]
    const b = boundaries[i + 1]
    // Innermost = smallest range fully covering [a, b).
    let innermost: CoverageRange | null = null
    for (const r of ranges) {
      if (r.startOffset <= a && r.endOffset >= b) {
        if (
          !innermost ||
          r.endOffset - r.startOffset < innermost.endOffset - innermost.startOffset
        ) {
          innermost = r
        }
      }
    }
    if (innermost && innermost.count > 0) used += b - a
  }

  return { used, total }
}

// --- CSS coverage (CDP CSS.stopRuleUsageTracking + styleSheetAdded) ---
export interface CssRuleUsage {
  styleSheetId: string
  startOffset: number
  endOffset: number
  used: boolean
}

export interface CssStyleSheet {
  styleSheetId: string
  url: string
  /** Stylesheet length in bytes, from the CSS.styleSheetAdded header. */
  length: number
}

type JsCoverage = Pick<
  CoverageSummary,
  'unusedJsBytes' | 'totalJsBytes' | 'unusedRatio'
>
type CssCoverage = Pick<
  CoverageSummary,
  'unusedCssBytes' | 'totalCssBytes' | 'cssUnusedRatio'
>

/** Aggregate JS coverage across all real (http/https) scripts on the page. */
export function summarizeJsCoverage(scripts: RawScriptCoverage[]): JsCoverage {
  let used = 0
  let total = 0
  for (const script of scripts) {
    if (!/^https?:/.test(script.url)) continue // skip inline/extension/eval scripts
    const result = scriptUsedBytes(script.functions)
    used += result.used
    total += result.total
  }
  const unusedJsBytes = Math.max(0, total - used)
  return {
    unusedJsBytes,
    totalJsBytes: total,
    unusedRatio: total > 0 ? unusedJsBytes / total : 0,
  }
}

/**
 * Aggregate CSS coverage. Total bytes come from stylesheet lengths; used bytes
 * are the summed lengths of rule ranges the page actually applied.
 */
export function summarizeCssCoverage(
  rules: CssRuleUsage[],
  sheets: CssStyleSheet[],
): CssCoverage {
  const httpSheetIds = new Set(
    sheets.filter((s) => /^https?:/.test(s.url)).map((s) => s.styleSheetId),
  )
  const total = sheets
    .filter((s) => httpSheetIds.has(s.styleSheetId))
    .reduce((sum, s) => sum + s.length, 0)

  const used = rules
    .filter((r) => r.used && httpSheetIds.has(r.styleSheetId))
    .reduce((sum, r) => sum + (r.endOffset - r.startOffset), 0)

  const unusedCssBytes = Math.max(0, total - used)
  return {
    unusedCssBytes,
    totalCssBytes: total,
    cssUnusedRatio: total > 0 ? unusedCssBytes / total : 0,
  }
}

/** Combine JS + CSS coverage into the full summary. */
export function combineCoverage(
  scripts: RawScriptCoverage[],
  cssRules: CssRuleUsage[],
  cssSheets: CssStyleSheet[],
): CoverageSummary {
  return {
    ...summarizeJsCoverage(scripts),
    ...summarizeCssCoverage(cssRules, cssSheets),
  }
}
