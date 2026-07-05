import { formatBytes } from '@/lib/format'
import type { CoverageSummary, ScanMode } from '@/core/types'

interface Props {
  scanMode: ScanMode
  coverage: CoverageSummary | null
  onDeepScan: () => void
}

export function ScanModeBar({ scanMode, coverage, onDeepScan }: Props) {
  if (scanMode === 'deep') {
    return (
      <div className="flex flex-col gap-1 rounded-ij-sm bg-ij-muted px-2.5 py-2 text-xs">
        <span className="font-medium text-ij-text">
          🔬 Deep scan · exact transferred bytes
        </span>
        {coverage && coverage.totalJsBytes > 0 && (
          <span className="text-ij-text-secondary">
            {Math.round(coverage.unusedRatio * 100)}% of JS unused (
            {formatBytes(coverage.unusedJsBytes)} of{' '}
            {formatBytes(coverage.totalJsBytes)})
          </span>
        )}
        {coverage && coverage.totalCssBytes > 0 && (
          <span className="text-ij-text-secondary">
            {Math.round(coverage.cssUnusedRatio * 100)}% of CSS unused (
            {formatBytes(coverage.unusedCssBytes)} of{' '}
            {formatBytes(coverage.totalCssBytes)})
          </span>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onDeepScan}
      title="Attaches the debugger and reloads the page to measure exact bytes and unused JavaScript."
      className="flex items-center justify-between gap-2 rounded-ij-sm border border-ij-border px-2.5 py-2 text-xs text-ij-text-secondary transition-colors hover:border-ij-primary hover:text-ij-text"
    >
      <span>Quick scan · some cross-origin bytes estimated</span>
      <span className="font-medium text-ij-primary">Run deep scan ↻</span>
    </button>
  )
}
