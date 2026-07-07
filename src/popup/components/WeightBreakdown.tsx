import { formatBytes, percentOf } from '@/lib/format'
import { RESOURCE_CATEGORIES, type WeightBreakdown } from '@/core/types'

const CATEGORY_LABELS: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  image: 'Images',
  font: 'Fonts',
  video: 'Video',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  html: 'bg-sky-500',
  css: 'bg-violet-500',
  js: 'bg-amber-500',
  image: 'bg-emerald-500',
  font: 'bg-pink-500',
  video: 'bg-rose-500',
  other: 'bg-slate-400',
}

export function WeightBreakdownView({ weight }: { weight: WeightBreakdown }) {
  const rows = RESOURCE_CATEGORIES.map((category) => ({
    category,
    ...weight.byCategory[category],
  }))
    .filter((row) => row.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Page weight</h2>
        <span className="text-lg font-semibold tabular-nums">
          {formatBytes(weight.totalBytes)}
        </span>
      </div>

      {/* Stacked distribution bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ij-muted">
        {rows.map((row) => (
          <div
            key={row.category}
            className={CATEGORY_COLORS[row.category]}
            style={{ width: `${percentOf(row.bytes, weight.totalBytes)}%` }}
            title={`${CATEGORY_LABELS[row.category]} — ${formatBytes(row.bytes)}`}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.category} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-sm ${CATEGORY_COLORS[row.category]}`}
            />
            <span className="flex-1">{CATEGORY_LABELS[row.category]}</span>
            <span className="text-ij-text-tertiary">{row.count}</span>
            <span className="w-16 text-right tabular-nums">
              {formatBytes(row.bytes)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex justify-between border-t border-ij-border pt-2 text-xs text-ij-text-secondary">
        <div className="flex gap-1">
          <dt>Requests</dt>
          <dd className="font-medium text-ij-text">{weight.resourceCount}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Third-party</dt>
          <dd className="font-medium text-ij-text">
            {formatBytes(weight.thirdParty.bytes)} ({weight.thirdParty.count})
          </dd>
        </div>
      </dl>

      {weight.estimatedBytes > 0 && (
        <p className="text-xs text-ij-text-tertiary">
          ~{formatBytes(weight.estimatedBytes)} estimated (cross-origin
          resources without timing headers).
        </p>
      )}
    </section>
  )
}
