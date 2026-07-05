import { formatGrams } from '@/lib/format'

interface Props {
  gramsPerView: number
  monthlyVisits: number
  onVisitsChange: (visits: number) => void
}

export function CarbonEstimateCard({
  gramsPerView,
  monthlyVisits,
  onVisitsChange,
}: Props) {
  const gramsPerYear = gramsPerView * monthlyVisits * 12

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-stretch gap-3">
        <div className="flex flex-1 flex-col rounded-ij-md border border-ij-border p-3">
          <span className="text-xl font-semibold tabular-nums">
            {formatGrams(gramsPerView)}
          </span>
          <span className="text-xs text-ij-text-secondary">CO₂ per view</span>
        </div>
        <div className="flex flex-1 flex-col rounded-ij-md border border-ij-border p-3">
          <span className="text-xl font-semibold tabular-nums">
            {formatGrams(gramsPerYear)}
          </span>
          <span className="text-xs text-ij-text-secondary">CO₂ per year</span>
        </div>
      </div>

      <label className="flex items-center justify-between gap-2 text-xs text-ij-text-secondary">
        <span>Monthly visits</span>
        <input
          type="number"
          min={1}
          step={1000}
          value={monthlyVisits}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (Number.isFinite(next) && next > 0) onVisitsChange(next)
          }}
          className="w-28 rounded-ij-sm border border-ij-border bg-transparent px-2 py-1 text-right tabular-nums text-ij-text focus:border-ij-primary focus:outline-none"
        />
      </label>
    </section>
  )
}
