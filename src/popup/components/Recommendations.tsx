import { formatBytes } from '@/lib/format'
import type { Recommendation, RecommendationImpact } from '@/core/types'

const IMPACT_STYLE: Record<RecommendationImpact, string> = {
  high: 'bg-eco-e/10 text-eco-e',
  medium: 'bg-eco-d/10 text-eco-d',
  low: 'bg-ij-muted text-ij-text-secondary',
}

const IMPACT_LABEL: Record<RecommendationImpact, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">Recommendations</h2>

      {items.length === 0 ? (
        <p className="rounded-ij-md border border-ij-border bg-ij-muted p-3 text-sm text-ij-text-secondary">
          ✅ No major issues detected. Nicely optimized.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((rec) => (
            <li
              key={rec.id}
              className="overflow-hidden rounded-ij-md border border-ij-border"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 p-2.5 text-sm">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${IMPACT_STYLE[rec.impact]}`}
                  >
                    {IMPACT_LABEL[rec.impact]}
                  </span>
                  <span className="flex-1 font-medium">{rec.title}</span>
                  {rec.savingBytes ? (
                    <span className="text-xs text-ij-text-tertiary">
                      ~{formatBytes(rec.savingBytes)}
                    </span>
                  ) : null}
                  <span className="text-ij-text-tertiary transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <p className="border-t border-ij-border px-2.5 py-2 text-xs leading-relaxed text-ij-text-secondary">
                  {rec.detail}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
