import type { EcoGrade, EcoScore } from '@/core/types'

const GRADE_BG: Record<EcoGrade, string> = {
  A: 'bg-eco-a',
  B: 'bg-eco-b',
  C: 'bg-eco-c',
  D: 'bg-eco-d',
  E: 'bg-eco-e',
  F: 'bg-eco-f',
}

const SUBSCORE_LABELS: Array<[keyof EcoScore['subScores'], string]> = [
  ['carbon', 'Carbon'],
  ['weight', 'Weight'],
  ['hosting', 'Hosting'],
  ['bestPractices', 'Best practices'],
]

export function EcoScoreCard({ score }: { score: EcoScore }) {
  return (
    <section className="flex flex-col gap-3 rounded-ij-md border border-ij-border p-3">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-ij-md text-3xl font-bold text-white ${GRADE_BG[score.grade]}`}
        >
          {score.grade}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums">
            {score.score}
            <span className="text-base font-normal text-ij-text-tertiary">
              /100
            </span>
          </span>
          <span className="text-xs text-ij-text-secondary">Eco Score</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {SUBSCORE_LABELS.map(([key, label]) => (
          <li key={key} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-ij-text-secondary">{label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ij-muted">
              <span
                className="block h-full rounded-full bg-ij-primary"
                style={{ width: `${score.subScores[key]}%` }}
              />
            </span>
            <span className="w-7 text-right tabular-nums text-ij-text-secondary">
              {score.subScores[key]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
